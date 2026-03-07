import request from 'supertest';
import { App } from 'supertest/types';
import { Role } from '../src/modules/users/roles/role.entity';
import { User } from '../src/modules/users/user.entity';
import {
  TestApp,
  createTestApp,
  closeTestApp,
  clearDatabase,
  seedRoles,
  createUser,
  authCookie,
} from './helpers/setup';

describe('Cart (e2e)', () => {
  let testApp: TestApp;
  let adminRole: Role;
  let userRole: Role;
  let adminUser: User;
  let regularUser: User;
  let adminCookie: string;
  let userCookie: string;
  let productId: number;
  let drinkId: number;

  beforeAll(async () => {
    testApp = await createTestApp();
    await clearDatabase(testApp.ds);
    ({ adminRole, userRole } = await seedRoles(testApp.ds));

    adminUser = await createUser(testApp.ds, [adminRole], {
      name: 'Cart Admin',
    });
    regularUser = await createUser(testApp.ds, [userRole], {
      name: 'Cart User',
    });
    adminCookie = authCookie(testApp.module, adminUser);
    userCookie = authCookie(testApp.module, regularUser);

    // Создаём каталог для тестов корзины
    const group = await request(testApp.app.getHttpServer() as App)
      .post('/catalog/product-groups')
      .set('Cookie', adminCookie)
      .send({ name: 'Для корзины', sortOrder: 1 })
      .then((r) => r.body);

    const food = await request(testApp.app.getHttpServer() as App)
      .post('/catalog/products')
      .set('Cookie', adminCookie)
      .send({
        groupId: group.id,
        name: 'Пирожок',
        type: 'FOOD',
        isActive: true,
        isAvailable: true,
      })
      .then((r) => r.body);

    await request(testApp.app.getHttpServer() as App)
      .post('/catalog/product-prices')
      .set('Cookie', adminCookie)
      .send({ productId: food.id, priceRub: 80, isActive: true });

    productId = food.id;

    const drink = await request(testApp.app.getHttpServer() as App)
      .post('/catalog/products')
      .set('Cookie', adminCookie)
      .send({
        groupId: group.id,
        name: 'Латте тест',
        type: 'DRINK',
        isActive: true,
        isAvailable: true,
      })
      .then((r) => r.body);

    await request(testApp.app.getHttpServer() as App)
      .post('/catalog/product-prices')
      .set('Cookie', adminCookie)
      .send({
        productId: drink.id,
        sizeCode: 'M',
        priceRub: 200,
        isActive: true,
      });

    drinkId = drink.id;
  });

  afterAll(async () => {
    await closeTestApp(testApp);
  });

  describe('GET /cart', () => {
    it('возвращает пустую корзину для нового пользователя', async () => {
      const res = await request(testApp.app.getHttpServer() as App)
        .get('/cart')
        .set('Cookie', userCookie)
        .expect(200);

      expect(res.body.items).toEqual([]);
    });

    it('возвращает 401 без авторизации', () => {
      return request(testApp.app.getHttpServer() as App)
        .get('/cart')
        .expect(401);
    });
  });

  describe('POST /cart/items', () => {
    it('добавляет позицию в корзину', async () => {
      const res = await request(testApp.app.getHttpServer() as App)
        .post('/cart/items')
        .set('Cookie', userCookie)
        .send({ productId, quantity: 2 })
        .expect(201);

      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0]).toMatchObject({
        productName: 'Пирожок',
        quantity: 2,
      });
    });

    it('добавляет напиток с размером', async () => {
      const res = await request(testApp.app.getHttpServer() as App)
        .post('/cart/items')
        .set('Cookie', userCookie)
        .send({ productId: drinkId, quantity: 1, sizeCode: 'M' })
        .expect(201);

      const items: any[] = res.body.items;
      const drinkItem = items.find((i) => i.productName === 'Латте тест');
      expect(drinkItem).toBeDefined();
      expect(drinkItem.sizeCode).toBe('M');
    });

    it('возвращает 404 для несуществующего продукта', () => {
      return request(testApp.app.getHttpServer() as App)
        .post('/cart/items')
        .set('Cookie', userCookie)
        .send({ productId: 99999, quantity: 1 })
        .expect(404);
    });
  });

  describe('PATCH /cart/items/:itemId', () => {
    it('изменяет количество позиции', async () => {
      // Сначала получаем корзину с позицией
      const cart = await request(testApp.app.getHttpServer() as App)
        .get('/cart')
        .set('Cookie', userCookie)
        .then((r) => r.body);

      const item = cart.items.find((i: any) => i.productName === 'Пирожок');
      expect(item).toBeDefined();

      const res = await request(testApp.app.getHttpServer() as App)
        .patch(`/cart/items/${item.id}`)
        .set('Cookie', userCookie)
        .send({ quantity: 5 })
        .expect(200);

      const updated = res.body.items.find((i: any) => i.id === item.id);
      expect(updated.quantity).toBe(5);
    });
  });

  describe('DELETE /cart/items/:itemId', () => {
    it('удаляет позицию из корзины', async () => {
      const cart = await request(testApp.app.getHttpServer() as App)
        .get('/cart')
        .set('Cookie', userCookie)
        .then((r) => r.body);

      const item = cart.items[0];
      expect(item).toBeDefined();

      const res = await request(testApp.app.getHttpServer() as App)
        .delete(`/cart/items/${item.id}`)
        .set('Cookie', userCookie)
        .expect(200);

      const remaining = res.body.items.filter((i: any) => i.id === item.id);
      expect(remaining).toHaveLength(0);
    });
  });

  describe('DELETE /cart', () => {
    it('очищает корзину', async () => {
      // Добавляем позицию
      await request(testApp.app.getHttpServer() as App)
        .post('/cart/items')
        .set('Cookie', userCookie)
        .send({ productId, quantity: 1 });

      const res = await request(testApp.app.getHttpServer() as App)
        .delete('/cart')
        .set('Cookie', userCookie)
        .expect(200);

      expect(res.body.items).toEqual([]);
    });
  });
});
