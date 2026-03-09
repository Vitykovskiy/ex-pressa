import request from 'supertest';
import { App } from 'supertest/types';
import { Role } from '../src/modules/users/roles/role.entity';
import { User } from '../src/modules/users/user.entity';
import {
  TestApp,
  createTestApp,
  closeTestApp,
  clearDatabase,
  ensureRoles,
  createUser,
  authCookie,
} from './helpers/setup';

describe('Catalog (e2e)', () => {
  let testApp: TestApp;
  let adminRole: Role;
  let userRole: Role;
  let adminUser: User;
  let regularUser: User;
  let adminCookie: string;
  let userCookie: string;

  beforeAll(async () => {
    testApp = await createTestApp();
    await clearDatabase(testApp.ds);
    ({ adminRole, userRole } = await ensureRoles(testApp.ds));
    adminUser = await createUser(testApp.ds, [adminRole], { name: 'Admin' });
    regularUser = await createUser(testApp.ds, [userRole], { name: 'User' });
    adminCookie = authCookie(testApp.module, adminUser);
    userCookie = authCookie(testApp.module, regularUser);
  });

  afterAll(async () => {
    await closeTestApp(testApp);
  });

  describe('GET /catalog', () => {
    it('возвращает пустой каталог', async () => {
      const res = await request(testApp.app.getHttpServer() as App)
        .get('/catalog')
        .set('Cookie', userCookie)
        .expect(200);

      expect(res.body).toEqual([]);
    });
  });

  describe('GET /catalog/addon-groups', () => {
    it('возвращает пустой список групп допов', async () => {
      const res = await request(testApp.app.getHttpServer() as App)
        .get('/catalog/addon-groups')
        .set('Cookie', userCookie)
        .expect(200);

      expect(res.body).toEqual([]);
    });
  });

  describe('POST /catalog/product-groups', () => {
    it('создаёт группу товаров (admin)', async () => {
      const res = await request(testApp.app.getHttpServer() as App)
        .post('/catalog/product-groups')
        .set('Cookie', adminCookie)
        .send({ name: 'Напитки', sortOrder: 1, isActive: true })
        .expect(201);

      expect(res.body).toMatchObject({
        name: 'Напитки',
        sortOrder: 1,
        isActive: true,
      });
      expect(res.body.id).toBeDefined();
    });

    it('возвращает 403 для обычного пользователя', () => {
      return request(testApp.app.getHttpServer() as App)
        .post('/catalog/product-groups')
        .set('Cookie', userCookie)
        .send({ name: 'Еда' })
        .expect(403);
    });

    it('возвращает 401 без авторизации', () => {
      return request(testApp.app.getHttpServer() as App)
        .post('/catalog/product-groups')
        .send({ name: 'Еда' })
        .expect(401);
    });
  });

  describe('PATCH /catalog/product-groups/:id', () => {
    it('обновляет группу товаров', async () => {
      const created = await request(testApp.app.getHttpServer() as App)
        .post('/catalog/product-groups')
        .set('Cookie', adminCookie)
        .send({ name: 'Десерты', sortOrder: 3, isActive: true })
        .expect(201);

      const res = await request(testApp.app.getHttpServer() as App)
        .patch(`/catalog/product-groups/${created.body.id}`)
        .set('Cookie', adminCookie)
        .send({ name: 'Десерты обновлённые', sortOrder: 5 })
        .expect(200);

      expect(res.body).toMatchObject({
        name: 'Десерты обновлённые',
        sortOrder: 5,
      });
    });

    it('возвращает 404 для несуществующей группы', () => {
      return request(testApp.app.getHttpServer() as App)
        .patch('/catalog/product-groups/99999')
        .set('Cookie', adminCookie)
        .send({ name: 'X' })
        .expect(404);
    });
  });

  describe('DELETE /catalog/product-groups/:id', () => {
    it('удаляет группу товаров', async () => {
      const created = await request(testApp.app.getHttpServer() as App)
        .post('/catalog/product-groups')
        .set('Cookie', adminCookie)
        .send({ name: 'Временная группа' })
        .expect(201);

      await request(testApp.app.getHttpServer() as App)
        .delete(`/catalog/product-groups/${created.body.id}`)
        .set('Cookie', adminCookie)
        .expect(204);

      await request(testApp.app.getHttpServer() as App)
        .delete(`/catalog/product-groups/${created.body.id}`)
        .set('Cookie', adminCookie)
        .expect(404);
    });
  });

  describe('POST /catalog/addon-groups', () => {
    it('создаёт группу допов (admin)', async () => {
      const res = await request(testApp.app.getHttpServer() as App)
        .post('/catalog/addon-groups')
        .set('Cookie', adminCookie)
        .send({ name: 'Сиропы', sortOrder: 1, isActive: true })
        .expect(201);

      expect(res.body).toMatchObject({ name: 'Сиропы', isActive: true });
    });
  });

  describe('POST /catalog/addons', () => {
    it('создаёт доп в группе', async () => {
      const group = await request(testApp.app.getHttpServer() as App)
        .post('/catalog/addon-groups')
        .set('Cookie', adminCookie)
        .send({ name: 'Топпинги' })
        .expect(201);

      const res = await request(testApp.app.getHttpServer() as App)
        .post('/catalog/addons')
        .set('Cookie', adminCookie)
        .send({
          addonGroupId: group.body.id,
          name: 'Карамель',
          priceRub: 50,
          isActive: true,
        })
        .expect(201);

      expect(res.body).toMatchObject({ name: 'Карамель', priceRub: 50 });
    });
  });

  describe('POST /catalog/products + GET /catalog', () => {
    it('создаёт продукт и он появляется в каталоге', async () => {
      // Создаём группу
      const group = await request(testApp.app.getHttpServer() as App)
        .post('/catalog/product-groups')
        .set('Cookie', adminCookie)
        .send({ name: 'Кофе', sortOrder: 10, isActive: true })
        .expect(201);

      // Создаём продукт
      const product = await request(testApp.app.getHttpServer() as App)
        .post('/catalog/products')
        .set('Cookie', adminCookie)
        .send({
          groupId: group.body.id,
          name: 'Эспрессо',
          type: 'FOOD',
          isActive: true,
          isAvailable: true,
          sortOrder: 1,
        })
        .expect(201);

      expect(product.body).toMatchObject({ name: 'Эспрессо', type: 'FOOD' });

      // Создаём цену
      await request(testApp.app.getHttpServer() as App)
        .post('/catalog/product-prices')
        .set('Cookie', adminCookie)
        .send({ productId: product.body.id, priceRub: 90, isActive: true })
        .expect(201);

      // Проверяем каталог
      const catalog = await request(testApp.app.getHttpServer() as App)
        .get('/catalog')
        .set('Cookie', userCookie)
        .expect(200);

      const coffeeGroup = catalog.body.find((g: any) => g.id === group.body.id);
      expect(coffeeGroup).toBeDefined();
      expect(coffeeGroup.products).toHaveLength(1);
      expect(coffeeGroup.products[0].name).toBe('Эспрессо');
    });
  });

  describe('GET /catalog/products/:id', () => {
    it('возвращает продукт по id', async () => {
      const group = await request(testApp.app.getHttpServer() as App)
        .post('/catalog/product-groups')
        .set('Cookie', adminCookie)
        .send({ name: 'Чай' })
        .expect(201);

      const product = await request(testApp.app.getHttpServer() as App)
        .post('/catalog/products')
        .set('Cookie', adminCookie)
        .send({
          groupId: group.body.id,
          name: 'Зелёный чай',
          type: 'FOOD',
          isActive: true,
          isAvailable: true,
        })
        .expect(201);

      const res = await request(testApp.app.getHttpServer() as App)
        .get(`/catalog/products/${product.body.id}`)
        .set('Cookie', userCookie)
        .expect(200);

      expect(res.body).toMatchObject({
        id: product.body.id,
        name: 'Зелёный чай',
      });
    });

    it('возвращает 404 для несуществующего продукта', () => {
      return request(testApp.app.getHttpServer() as App)
        .get('/catalog/products/99999')
        .set('Cookie', userCookie)
        .expect(404);
    });
  });

  describe('PUT /catalog/products/:id/prices', () => {
    it('заменяет цены продукта', async () => {
      const group = await request(testApp.app.getHttpServer() as App)
        .post('/catalog/product-groups')
        .set('Cookie', adminCookie)
        .send({ name: 'Смузи' })
        .expect(201);

      const product = await request(testApp.app.getHttpServer() as App)
        .post('/catalog/products')
        .set('Cookie', adminCookie)
        .send({
          groupId: group.body.id,
          name: 'Манго смузи',
          type: 'DRINK',
          isActive: true,
          isAvailable: true,
        })
        .expect(201);

      const res = await request(testApp.app.getHttpServer() as App)
        .put(`/catalog/products/${product.body.id}/prices`)
        .set('Cookie', adminCookie)
        .send({
          prices: [
            { sizeCode: 'S', priceRub: 180, isActive: true },
            { sizeCode: 'M', priceRub: 220, isActive: true },
            { sizeCode: 'L', priceRub: 270, isActive: true },
          ],
        })
        .expect(200);

      expect(res.body).toHaveLength(3);
      expect(res.body.map((p: any) => p.sizeCode)).toEqual(
        expect.arrayContaining(['S', 'M', 'L']),
      );
    });
  });

  describe('PATCH /catalog/addon-groups/:id', () => {
    it('обновляет группу допов', async () => {
      const group = await request(testApp.app.getHttpServer() as App)
        .post('/catalog/addon-groups')
        .set('Cookie', adminCookie)
        .send({ name: 'Молоко' })
        .expect(201);

      const res = await request(testApp.app.getHttpServer() as App)
        .patch(`/catalog/addon-groups/${group.body.id}`)
        .set('Cookie', adminCookie)
        .send({ name: 'Альтернативное молоко' })
        .expect(200);

      expect(res.body).toMatchObject({ name: 'Альтернативное молоко' });
    });
  });

  describe('DELETE /catalog/addons/:id', () => {
    it('удаляет доп', async () => {
      const group = await request(testApp.app.getHttpServer() as App)
        .post('/catalog/addon-groups')
        .set('Cookie', adminCookie)
        .send({ name: 'Специи' })
        .expect(201);

      const addon = await request(testApp.app.getHttpServer() as App)
        .post('/catalog/addons')
        .set('Cookie', adminCookie)
        .send({
          addonGroupId: group.body.id,
          name: 'Корица',
          priceRub: 30,
          isActive: true,
        })
        .expect(201);

      await request(testApp.app.getHttpServer() as App)
        .delete(`/catalog/addons/${addon.body.id}`)
        .set('Cookie', adminCookie)
        .expect(204);
    });
  });
});

