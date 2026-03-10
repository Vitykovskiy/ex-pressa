import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { Role } from '../src/modules/users/roles/role.entity';
import { User } from '../src/modules/users/user.entity';
import { TimeSlot } from '../src/modules/orders/time-slot.entity';
import {
  TestApp,
  createTestApp,
  closeTestApp,
  clearDatabase,
  ensureRoles,
  createUser,
  authCookie,
} from './helpers/setup';

async function createTimeSlot(
  ds: DataSource,
  opts: Partial<{
    date: string;
    timeFrom: string;
    timeTo: string;
    capacity: number;
    bookedCount: number;
  }> = {},
): Promise<TimeSlot> {
  const repo = ds.getRepository(TimeSlot);
  const today = new Date().toISOString().split('T')[0];
  return repo.save({
    date: opts.date ?? today,
    timeFrom: opts.timeFrom ?? '10:00:00',
    timeTo: opts.timeTo ?? '10:10:00',
    capacity: opts.capacity ?? 5,
    bookedCount: opts.bookedCount ?? 0,
    isActive: true,
  });
}

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatLocalTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

async function setupCatalogAndCart(
  server: App,
  adminCookie: string,
  userCookie: string,
): Promise<{ productId: number }> {
  const group = await request(server)
    .post('/catalog/product-groups')
    .set('Cookie', adminCookie)
    .send({ name: 'Заказы: каталог' })
    .then((r) => r.body);

  const product = await request(server)
    .post('/catalog/products')
    .set('Cookie', adminCookie)
    .send({
      groupId: group.id,
      name: 'Капучино тест',
      type: 'FOOD',
      isActive: true,
      isAvailable: true,
    })
    .then((r) => r.body);

  await request(server)
    .post('/catalog/product-prices')
    .set('Cookie', adminCookie)
    .send({ productId: product.id, priceRub: 150, isActive: true });

  await request(server)
    .post('/cart/items')
    .set('Cookie', userCookie)
    .send({ productId: product.id, quantity: 1 });

  return { productId: product.id };
}

describe('Orders (e2e)', () => {
  let testApp: TestApp;
  let adminRole: Role;
  let baristaRole: Role;
  let userRole: Role;
  let adminUser: User;
  let baristaUser: User;
  let regularUser: User;
  let adminCookie: string;
  let baristaCookie: string;
  let userCookie: string;

  beforeAll(async () => {
    testApp = await createTestApp();
    await clearDatabase(testApp.ds);
    ({ adminRole, baristaRole, userRole } = await ensureRoles(testApp.ds));

    adminUser = await createUser(testApp.ds, [adminRole], {
      name: 'Orders Admin',
    });
    baristaUser = await createUser(testApp.ds, [baristaRole], {
      name: 'Orders Barista',
    });
    regularUser = await createUser(testApp.ds, [userRole], {
      name: 'Orders User',
    });

    adminCookie = authCookie(testApp.module, adminUser);
    baristaCookie = authCookie(testApp.module, baristaUser);
    userCookie = authCookie(testApp.module, regularUser);
  });

  afterAll(async () => {
    await closeTestApp(testApp);
  });

  describe('GET /orders/history', () => {
    it('возвращает пустую историю для нового пользователя', async () => {
      const res = await request(testApp.app.getHttpServer() as App)
        .get('/orders/history')
        .set('Cookie', userCookie)
        .expect(200);

      expect(res.body).toEqual([]);
    });
  });

  describe('GET /time-slots/active', () => {
    it('не возвращает истёкшие слоты за сегодня', async () => {
      const base = new Date();
      const futureFrom = new Date(base.getTime() + 20 * 60 * 1000);
      const futureTo = new Date(base.getTime() + 30 * 60 * 1000);
      const pastFrom = new Date(base.getTime() - 30 * 60 * 1000);
      const pastTo = new Date(base.getTime() - 20 * 60 * 1000);
      const today = formatLocalDate(base);

      await createTimeSlot(testApp.ds, {
        date: today,
        timeFrom: formatLocalTime(pastFrom),
        timeTo: formatLocalTime(pastTo),
      });

      const futureSlot = await createTimeSlot(testApp.ds, {
        date: today,
        timeFrom: formatLocalTime(futureFrom),
        timeTo: formatLocalTime(futureTo),
      });

      const res = await request(testApp.app.getHttpServer() as App)
        .get('/time-slots/active')
        .set('Cookie', userCookie)
        .expect(200);

      expect(res.body.map((slot: { id: number }) => slot.id)).toContain(
        futureSlot.id,
      );
      expect(res.body).toHaveLength(1);
    });
  });

  describe('POST /orders/from-cart', () => {
    it('создаёт заказ из корзины', async () => {
      // Создаём отдельного пользователя для этого теста
      const user = await createUser(testApp.ds, [userRole], {
        name: 'Order Creator',
      });
      const cookie = authCookie(testApp.module, user);

      await setupCatalogAndCart(
        testApp.app.getHttpServer() as App,
        adminCookie,
        cookie,
      );

      const slot = await createTimeSlot(testApp.ds, {
        timeFrom: '11:00:00',
        timeTo: '11:10:00',
      });

      const res = await request(testApp.app.getHttpServer() as App)
        .post('/orders/from-cart')
        .set('Cookie', cookie)
        .send({ timeSlotId: slot.id })
        .expect(201);

      expect(res.body).toMatchObject({
        status: 'CREATED',
        totalRub: 150,
      });
      expect(res.body.items).toHaveLength(1);
    });

    it('возвращает 400 для заполненного слота', async () => {
      const user = await createUser(testApp.ds, [userRole], {
        name: 'Blocked User',
      });
      const cookie = authCookie(testApp.module, user);

      await setupCatalogAndCart(
        testApp.app.getHttpServer() as App,
        adminCookie,
        cookie,
      );

      const fullSlot = await createTimeSlot(testApp.ds, {
        timeFrom: '12:00:00',
        timeTo: '12:10:00',
        capacity: 3,
        bookedCount: 3,
      });

      return request(testApp.app.getHttpServer() as App)
        .post('/orders/from-cart')
        .set('Cookie', cookie)
        .send({ timeSlotId: fullSlot.id })
        .expect(400);
    });

    it('возвращает 404 для несуществующего слота', async () => {
      const user = await createUser(testApp.ds, [userRole], {
        name: 'No Slot User',
      });
      const cookie = authCookie(testApp.module, user);

      await setupCatalogAndCart(
        testApp.app.getHttpServer() as App,
        adminCookie,
        cookie,
      );

      return request(testApp.app.getHttpServer() as App)
        .post('/orders/from-cart')
        .set('Cookie', cookie)
        .send({ timeSlotId: 99999 })
        .expect(404);
    });

    it('возвращает 400 для истёкшего слота', async () => {
      const user = await createUser(testApp.ds, [userRole], {
        name: 'Expired Slot User',
      });
      const cookie = authCookie(testApp.module, user);

      await setupCatalogAndCart(
        testApp.app.getHttpServer() as App,
        adminCookie,
        cookie,
      );

      const base = new Date();
      const expiredFrom = new Date(base.getTime() - 30 * 60 * 1000);
      const expiredTo = new Date(base.getTime() - 20 * 60 * 1000);
      const expiredSlot = await createTimeSlot(testApp.ds, {
        date: formatLocalDate(base),
        timeFrom: formatLocalTime(expiredFrom),
        timeTo: formatLocalTime(expiredTo),
      });

      await request(testApp.app.getHttpServer() as App)
        .post('/orders/from-cart')
        .set('Cookie', cookie)
        .send({ timeSlotId: expiredSlot.id })
        .expect(400);
    });
  });

  describe('POST /orders/search (barista)', () => {
    it('возвращает список заказов', async () => {
      const res = await request(testApp.app.getHttpServer() as App)
        .post('/orders/search')
        .set('Cookie', baristaCookie)
        .send({})
        .expect(201);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it('возвращает 403 для обычного пользователя', () => {
      return request(testApp.app.getHttpServer() as App)
        .post('/orders/search')
        .set('Cookie', userCookie)
        .send({})
        .expect(403);
    });
  });

  describe('PATCH /orders/:id/status', () => {
    it('переводит заказ через цепочку статусов CREATED -> CONFIRMED -> READY -> CLOSED', async () => {
      const user = await createUser(testApp.ds, [userRole], {
        name: 'Status Test User',
      });
      const cookie = authCookie(testApp.module, user);

      await setupCatalogAndCart(
        testApp.app.getHttpServer() as App,
        adminCookie,
        cookie,
      );

      const slot = await createTimeSlot(testApp.ds, {
        timeFrom: '13:00:00',
        timeTo: '13:10:00',
      });

      const order = await request(testApp.app.getHttpServer() as App)
        .post('/orders/from-cart')
        .set('Cookie', cookie)
        .send({ timeSlotId: slot.id })
        .then((r) => r.body);

      expect(order.status).toBe('CREATED');

      // CREATED -> CONFIRMED
      const confirmed = await request(testApp.app.getHttpServer() as App)
        .patch(`/orders/${order.id}/status`)
        .set('Cookie', baristaCookie)
        .send({ status: 'CONFIRMED' })
        .expect(200);
      expect(confirmed.body.status).toBe('CONFIRMED');

      // CONFIRMED -> READY
      const ready = await request(testApp.app.getHttpServer() as App)
        .patch(`/orders/${order.id}/status`)
        .set('Cookie', baristaCookie)
        .send({ status: 'READY' })
        .expect(200);
      expect(ready.body.status).toBe('READY');

      // READY -> CLOSED
      const closed = await request(testApp.app.getHttpServer() as App)
        .patch(`/orders/${order.id}/status`)
        .set('Cookie', baristaCookie)
        .send({ status: 'CLOSED' })
        .expect(200);
      expect(closed.body.status).toBe('CLOSED');
    });

    it('возвращает 400 при недопустимом переходе статуса', async () => {
      const user = await createUser(testApp.ds, [userRole], {
        name: 'Bad Transition User',
      });
      const cookie = authCookie(testApp.module, user);

      await setupCatalogAndCart(
        testApp.app.getHttpServer() as App,
        adminCookie,
        cookie,
      );

      const slot = await createTimeSlot(testApp.ds, {
        timeFrom: '14:00:00',
        timeTo: '14:10:00',
      });

      const order = await request(testApp.app.getHttpServer() as App)
        .post('/orders/from-cart')
        .set('Cookie', cookie)
        .send({ timeSlotId: slot.id })
        .then((r) => r.body);

      return request(testApp.app.getHttpServer() as App)
        .patch(`/orders/${order.id}/status`)
        .set('Cookie', baristaCookie)
        .send({ status: 'READY' }) // Пропускаем CONFIRMED
        .expect(400);
    });
  });

  describe('POST /orders/:id/reject', () => {
    it('отклоняет заказ с причиной', async () => {
      const user = await createUser(testApp.ds, [userRole], {
        name: 'Reject Test User',
      });
      const cookie = authCookie(testApp.module, user);

      await setupCatalogAndCart(
        testApp.app.getHttpServer() as App,
        adminCookie,
        cookie,
      );

      const slot = await createTimeSlot(testApp.ds, {
        timeFrom: '15:00:00',
        timeTo: '15:10:00',
      });

      const order = await request(testApp.app.getHttpServer() as App)
        .post('/orders/from-cart')
        .set('Cookie', cookie)
        .send({ timeSlotId: slot.id })
        .then((r) => r.body);

      const res = await request(testApp.app.getHttpServer() as App)
        .post(`/orders/${order.id}/reject`)
        .set('Cookie', baristaCookie)
        .send({ reason: 'Нет ингредиентов' })
        .expect(201);

      expect(res.body.status).toBe('REJECTED');
      expect(res.body.rejectReason).toBe('Нет ингредиентов');
    });

    it('возвращает 403 для обычного пользователя', async () => {
      return request(testApp.app.getHttpServer() as App)
        .post('/orders/99999/reject')
        .set('Cookie', userCookie)
        .send({ reason: 'test' })
        .expect(403);
    });
  });

  describe('GET /orders/history (после создания заказов)', () => {
    it('возвращает историю заказов текущего пользователя', async () => {
      const user = await createUser(testApp.ds, [userRole], {
        name: 'History User',
      });
      const cookie = authCookie(testApp.module, user);

      await setupCatalogAndCart(
        testApp.app.getHttpServer() as App,
        adminCookie,
        cookie,
      );

      const slot = await createTimeSlot(testApp.ds, {
        timeFrom: '16:00:00',
        timeTo: '16:10:00',
      });

      await request(testApp.app.getHttpServer() as App)
        .post('/orders/from-cart')
        .set('Cookie', cookie)
        .send({ timeSlotId: slot.id });

      const res = await request(testApp.app.getHttpServer() as App)
        .get('/orders/history')
        .set('Cookie', cookie)
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].status).toBe('CREATED');
    });
  });
});

