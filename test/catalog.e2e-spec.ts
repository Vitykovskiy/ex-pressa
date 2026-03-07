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
    it('РІРѕР·РІСЂР°С‰Р°РµС‚ РїСѓСЃС‚РѕР№ РєР°С‚Р°Р»РѕРі', async () => {
      const res = await request(testApp.app.getHttpServer() as App)
        .get('/catalog')
        .set('Cookie', userCookie)
        .expect(200);

      expect(res.body).toEqual([]);
    });
  });

  describe('GET /catalog/addon-groups', () => {
    it('РІРѕР·РІСЂР°С‰Р°РµС‚ РїСѓСЃС‚РѕР№ СЃРїРёСЃРѕРє РіСЂСѓРїРї РґРѕРїРѕРІ', async () => {
      const res = await request(testApp.app.getHttpServer() as App)
        .get('/catalog/addon-groups')
        .set('Cookie', userCookie)
        .expect(200);

      expect(res.body).toEqual([]);
    });
  });

  describe('POST /catalog/product-groups', () => {
    it('СЃРѕР·РґР°С‘С‚ РіСЂСѓРїРїСѓ С‚РѕРІР°СЂРѕРІ (admin)', async () => {
      const res = await request(testApp.app.getHttpServer() as App)
        .post('/catalog/product-groups')
        .set('Cookie', adminCookie)
        .send({ name: 'РќР°РїРёС‚РєРё', sortOrder: 1, isActive: true })
        .expect(201);

      expect(res.body).toMatchObject({
        name: 'РќР°РїРёС‚РєРё',
        sortOrder: 1,
        isActive: true,
      });
      expect(res.body.id).toBeDefined();
    });

    it('РІРѕР·РІСЂР°С‰Р°РµС‚ 403 РґР»СЏ РѕР±С‹С‡РЅРѕРіРѕ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ', () => {
      return request(testApp.app.getHttpServer() as App)
        .post('/catalog/product-groups')
        .set('Cookie', userCookie)
        .send({ name: 'Р•РґР°' })
        .expect(403);
    });

    it('РІРѕР·РІСЂР°С‰Р°РµС‚ 401 Р±РµР· Р°РІС‚РѕСЂРёР·Р°С†РёРё', () => {
      return request(testApp.app.getHttpServer() as App)
        .post('/catalog/product-groups')
        .send({ name: 'Р•РґР°' })
        .expect(401);
    });
  });

  describe('PATCH /catalog/product-groups/:id', () => {
    it('РѕР±РЅРѕРІР»СЏРµС‚ РіСЂСѓРїРїСѓ С‚РѕРІР°СЂРѕРІ', async () => {
      const created = await request(testApp.app.getHttpServer() as App)
        .post('/catalog/product-groups')
        .set('Cookie', adminCookie)
        .send({ name: 'Р”РµСЃРµСЂС‚С‹', sortOrder: 3, isActive: true })
        .expect(201);

      const res = await request(testApp.app.getHttpServer() as App)
        .patch(`/catalog/product-groups/${created.body.id}`)
        .set('Cookie', adminCookie)
        .send({ name: 'Р”РµСЃРµСЂС‚С‹ РѕР±РЅРѕРІР»С‘РЅРЅС‹Рµ', sortOrder: 5 })
        .expect(200);

      expect(res.body).toMatchObject({
        name: 'Р”РµСЃРµСЂС‚С‹ РѕР±РЅРѕРІР»С‘РЅРЅС‹Рµ',
        sortOrder: 5,
      });
    });

    it('РІРѕР·РІСЂР°С‰Р°РµС‚ 404 РґР»СЏ РЅРµСЃСѓС‰РµСЃС‚РІСѓСЋС‰РµР№ РіСЂСѓРїРїС‹', () => {
      return request(testApp.app.getHttpServer() as App)
        .patch('/catalog/product-groups/99999')
        .set('Cookie', adminCookie)
        .send({ name: 'X' })
        .expect(404);
    });
  });

  describe('DELETE /catalog/product-groups/:id', () => {
    it('СѓРґР°Р»СЏРµС‚ РіСЂСѓРїРїСѓ С‚РѕРІР°СЂРѕРІ', async () => {
      const created = await request(testApp.app.getHttpServer() as App)
        .post('/catalog/product-groups')
        .set('Cookie', adminCookie)
        .send({ name: 'Р’СЂРµРјРµРЅРЅР°СЏ РіСЂСѓРїРїР°' })
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
    it('СЃРѕР·РґР°С‘С‚ РіСЂСѓРїРїСѓ РґРѕРїРѕРІ (admin)', async () => {
      const res = await request(testApp.app.getHttpServer() as App)
        .post('/catalog/addon-groups')
        .set('Cookie', adminCookie)
        .send({ name: 'РЎРёСЂРѕРїС‹', sortOrder: 1, isActive: true })
        .expect(201);

      expect(res.body).toMatchObject({ name: 'РЎРёСЂРѕРїС‹', isActive: true });
    });
  });

  describe('POST /catalog/addons', () => {
    it('СЃРѕР·РґР°С‘С‚ РґРѕРї РІ РіСЂСѓРїРїРµ', async () => {
      const group = await request(testApp.app.getHttpServer() as App)
        .post('/catalog/addon-groups')
        .set('Cookie', adminCookie)
        .send({ name: 'РўРѕРїРїРёРЅРіРё' })
        .expect(201);

      const res = await request(testApp.app.getHttpServer() as App)
        .post('/catalog/addons')
        .set('Cookie', adminCookie)
        .send({
          addonGroupId: group.body.id,
          name: 'РљР°СЂР°РјРµР»СЊ',
          priceRub: 50,
          isActive: true,
        })
        .expect(201);

      expect(res.body).toMatchObject({ name: 'РљР°СЂР°РјРµР»СЊ', priceRub: 50 });
    });
  });

  describe('POST /catalog/products + GET /catalog', () => {
    it('СЃРѕР·РґР°С‘С‚ РїСЂРѕРґСѓРєС‚ Рё РѕРЅ РїРѕСЏРІР»СЏРµС‚СЃСЏ РІ РєР°С‚Р°Р»РѕРіРµ', async () => {
      // РЎРѕР·РґР°С‘Рј РіСЂСѓРїРїСѓ
      const group = await request(testApp.app.getHttpServer() as App)
        .post('/catalog/product-groups')
        .set('Cookie', adminCookie)
        .send({ name: 'РљРѕС„Рµ', sortOrder: 10, isActive: true })
        .expect(201);

      // РЎРѕР·РґР°С‘Рј РїСЂРѕРґСѓРєС‚
      const product = await request(testApp.app.getHttpServer() as App)
        .post('/catalog/products')
        .set('Cookie', adminCookie)
        .send({
          groupId: group.body.id,
          name: 'Р­СЃРїСЂРµСЃСЃРѕ',
          type: 'FOOD',
          isActive: true,
          isAvailable: true,
          sortOrder: 1,
        })
        .expect(201);

      expect(product.body).toMatchObject({ name: 'Р­СЃРїСЂРµСЃСЃРѕ', type: 'FOOD' });

      // РЎРѕР·РґР°С‘Рј С†РµРЅСѓ
      await request(testApp.app.getHttpServer() as App)
        .post('/catalog/product-prices')
        .set('Cookie', adminCookie)
        .send({ productId: product.body.id, priceRub: 90, isActive: true })
        .expect(201);

      // РџСЂРѕРІРµСЂСЏРµРј РєР°С‚Р°Р»РѕРі
      const catalog = await request(testApp.app.getHttpServer() as App)
        .get('/catalog')
        .set('Cookie', userCookie)
        .expect(200);

      const coffeeGroup = catalog.body.find((g: any) => g.id === group.body.id);
      expect(coffeeGroup).toBeDefined();
      expect(coffeeGroup.products).toHaveLength(1);
      expect(coffeeGroup.products[0].name).toBe('Р­СЃРїСЂРµСЃСЃРѕ');
    });
  });

  describe('GET /catalog/products/:id', () => {
    it('РІРѕР·РІСЂР°С‰Р°РµС‚ РїСЂРѕРґСѓРєС‚ РїРѕ id', async () => {
      const group = await request(testApp.app.getHttpServer() as App)
        .post('/catalog/product-groups')
        .set('Cookie', adminCookie)
        .send({ name: 'Р§Р°Р№' })
        .expect(201);

      const product = await request(testApp.app.getHttpServer() as App)
        .post('/catalog/products')
        .set('Cookie', adminCookie)
        .send({
          groupId: group.body.id,
          name: 'Р—РµР»С‘РЅС‹Р№ С‡Р°Р№',
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
        name: 'Р—РµР»С‘РЅС‹Р№ С‡Р°Р№',
      });
    });

    it('РІРѕР·РІСЂР°С‰Р°РµС‚ 404 РґР»СЏ РЅРµСЃСѓС‰РµСЃС‚РІСѓСЋС‰РµРіРѕ РїСЂРѕРґСѓРєС‚Р°', () => {
      return request(testApp.app.getHttpServer() as App)
        .get('/catalog/products/99999')
        .set('Cookie', userCookie)
        .expect(404);
    });
  });

  describe('PUT /catalog/products/:id/prices', () => {
    it('Р·Р°РјРµРЅСЏРµС‚ С†РµРЅС‹ РїСЂРѕРґСѓРєС‚Р°', async () => {
      const group = await request(testApp.app.getHttpServer() as App)
        .post('/catalog/product-groups')
        .set('Cookie', adminCookie)
        .send({ name: 'РЎРјСѓР·Рё' })
        .expect(201);

      const product = await request(testApp.app.getHttpServer() as App)
        .post('/catalog/products')
        .set('Cookie', adminCookie)
        .send({
          groupId: group.body.id,
          name: 'РњР°РЅРіРѕ СЃРјСѓР·Рё',
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
    it('РѕР±РЅРѕРІР»СЏРµС‚ РіСЂСѓРїРїСѓ РґРѕРїРѕРІ', async () => {
      const group = await request(testApp.app.getHttpServer() as App)
        .post('/catalog/addon-groups')
        .set('Cookie', adminCookie)
        .send({ name: 'РњРѕР»РѕРєРѕ' })
        .expect(201);

      const res = await request(testApp.app.getHttpServer() as App)
        .patch(`/catalog/addon-groups/${group.body.id}`)
        .set('Cookie', adminCookie)
        .send({ name: 'РђР»СЊС‚РµСЂРЅР°С‚РёРІРЅРѕРµ РјРѕР»РѕРєРѕ' })
        .expect(200);

      expect(res.body).toMatchObject({ name: 'РђР»СЊС‚РµСЂРЅР°С‚РёРІРЅРѕРµ РјРѕР»РѕРєРѕ' });
    });
  });

  describe('DELETE /catalog/addons/:id', () => {
    it('СѓРґР°Р»СЏРµС‚ РґРѕРї', async () => {
      const group = await request(testApp.app.getHttpServer() as App)
        .post('/catalog/addon-groups')
        .set('Cookie', adminCookie)
        .send({ name: 'РЎРїРµС†РёРё' })
        .expect(201);

      const addon = await request(testApp.app.getHttpServer() as App)
        .post('/catalog/addons')
        .set('Cookie', adminCookie)
        .send({
          addonGroupId: group.body.id,
          name: 'РљРѕСЂРёС†Р°',
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

