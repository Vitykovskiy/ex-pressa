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

async function setupCatalogAndCart(
  server: App,
  adminCookie: string,
  userCookie: string,
): Promise<{ productId: number }> {
  const group = await request(server)
    .post('/catalog/product-groups')
    .set('Cookie', adminCookie)
    .send({ name: 'Р—Р°РєР°Р·С‹: РєР°С‚Р°Р»РѕРі' })
    .then((r) => r.body);

  const product = await request(server)
    .post('/catalog/products')
    .set('Cookie', adminCookie)
    .send({
      groupId: group.id,
      name: 'РљР°РїСѓС‡РёРЅРѕ С‚РµСЃС‚',
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
    it('РІРѕР·РІСЂР°С‰Р°РµС‚ РїСѓСЃС‚СѓСЋ РёСЃС‚РѕСЂРёСЋ РґР»СЏ РЅРѕРІРѕРіРѕ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ', async () => {
      const res = await request(testApp.app.getHttpServer() as App)
        .get('/orders/history')
        .set('Cookie', userCookie)
        .expect(200);

      expect(res.body).toEqual([]);
    });
  });

  describe('POST /orders/from-cart', () => {
    it('СЃРѕР·РґР°С‘С‚ Р·Р°РєР°Р· РёР· РєРѕСЂР·РёРЅС‹', async () => {
      // РЎРѕР·РґР°С‘Рј РѕС‚РґРµР»СЊРЅРѕРіРѕ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ РґР»СЏ СЌС‚РѕРіРѕ С‚РµСЃС‚Р°
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

    it('РІРѕР·РІСЂР°С‰Р°РµС‚ 400 РґР»СЏ Р·Р°РїРѕР»РЅРµРЅРЅРѕРіРѕ СЃР»РѕС‚Р°', async () => {
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

    it('РІРѕР·РІСЂР°С‰Р°РµС‚ 404 РґР»СЏ РЅРµСЃСѓС‰РµСЃС‚РІСѓСЋС‰РµРіРѕ СЃР»РѕС‚Р°', async () => {
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
  });

  describe('POST /orders/search (barista)', () => {
    it('РІРѕР·РІСЂР°С‰Р°РµС‚ СЃРїРёСЃРѕРє Р·Р°РєР°Р·РѕРІ', async () => {
      const res = await request(testApp.app.getHttpServer() as App)
        .post('/orders/search')
        .set('Cookie', baristaCookie)
        .send({})
        .expect(201);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it('РІРѕР·РІСЂР°С‰Р°РµС‚ 403 РґР»СЏ РѕР±С‹С‡РЅРѕРіРѕ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ', () => {
      return request(testApp.app.getHttpServer() as App)
        .post('/orders/search')
        .set('Cookie', userCookie)
        .send({})
        .expect(403);
    });
  });

  describe('PATCH /orders/:id/status', () => {
    it('РїРµСЂРµРІРѕРґРёС‚ Р·Р°РєР°Р· С‡РµСЂРµР· С†РµРїРѕС‡РєСѓ СЃС‚Р°С‚СѓСЃРѕРІ CREATED в†’ CONFIRMED в†’ READY в†’ CLOSED', async () => {
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

      // CREATED в†’ CONFIRMED
      const confirmed = await request(testApp.app.getHttpServer() as App)
        .patch(`/orders/${order.id}/status`)
        .set('Cookie', baristaCookie)
        .send({ status: 'CONFIRMED' })
        .expect(200);
      expect(confirmed.body.status).toBe('CONFIRMED');

      // CONFIRMED в†’ READY
      const ready = await request(testApp.app.getHttpServer() as App)
        .patch(`/orders/${order.id}/status`)
        .set('Cookie', baristaCookie)
        .send({ status: 'READY' })
        .expect(200);
      expect(ready.body.status).toBe('READY');

      // READY в†’ CLOSED
      const closed = await request(testApp.app.getHttpServer() as App)
        .patch(`/orders/${order.id}/status`)
        .set('Cookie', baristaCookie)
        .send({ status: 'CLOSED' })
        .expect(200);
      expect(closed.body.status).toBe('CLOSED');
    });

    it('РІРѕР·РІСЂР°С‰Р°РµС‚ 400 РїСЂРё РЅРµРґРѕРїСѓСЃС‚РёРјРѕРј РїРµСЂРµС…РѕРґРµ СЃС‚Р°С‚СѓСЃР°', async () => {
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
        .send({ status: 'READY' }) // РїСЂРѕРїСѓСЃРєР°РµРј CONFIRMED
        .expect(400);
    });
  });

  describe('POST /orders/:id/reject', () => {
    it('РѕС‚РєР»РѕРЅСЏРµС‚ Р·Р°РєР°Р· СЃ РїСЂРёС‡РёРЅРѕР№', async () => {
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
        .send({ reason: 'РќРµС‚ РёРЅРіСЂРµРґРёРµРЅС‚РѕРІ' })
        .expect(201);

      expect(res.body.status).toBe('REJECTED');
      expect(res.body.rejectReason).toBe('РќРµС‚ РёРЅРіСЂРµРґРёРµРЅС‚РѕРІ');
    });

    it('РІРѕР·РІСЂР°С‰Р°РµС‚ 403 РґР»СЏ РѕР±С‹С‡РЅРѕРіРѕ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ', async () => {
      return request(testApp.app.getHttpServer() as App)
        .post('/orders/99999/reject')
        .set('Cookie', userCookie)
        .send({ reason: 'test' })
        .expect(403);
    });
  });

  describe('GET /orders/history (РїРѕСЃР»Рµ СЃРѕР·РґР°РЅРёСЏ Р·Р°РєР°Р·РѕРІ)', () => {
    it('РІРѕР·РІСЂР°С‰Р°РµС‚ РёСЃС‚РѕСЂРёСЋ Р·Р°РєР°Р·РѕРІ С‚РµРєСѓС‰РµРіРѕ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ', async () => {
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

