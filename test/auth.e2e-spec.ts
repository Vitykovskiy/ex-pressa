import request from 'supertest';
import { App } from 'supertest/types';
import { Role } from '../src/modules/users/roles/role.entity';
import {
  TestApp,
  createTestApp,
  closeTestApp,
  clearDatabase,
  ensureRoles,
  createUser,
  authCookie,
} from './helpers/setup';

describe('Auth (e2e)', () => {
  let testApp: TestApp;
  let userRole: Role;

  beforeAll(async () => {
    testApp = await createTestApp();
    await clearDatabase(testApp.ds);
    ({ userRole } = await ensureRoles(testApp.ds));
  });

  afterAll(async () => {
    await closeTestApp(testApp);
  });

  describe('GET /auth/me', () => {
    it('РІРѕР·РІСЂР°С‰Р°РµС‚ 401 Р±РµР· СЃРµСЃСЃРёРё', () => {
      return request(testApp.app.getHttpServer() as App)
        .get('/auth/me')
        .expect(401);
    });

    it('РІРѕР·РІСЂР°С‰Р°РµС‚ С‚РµРєСѓС‰РµРіРѕ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ РїСЂРё РІР°Р»РёРґРЅРѕРј С‚РѕРєРµРЅРµ', async () => {
      const user = await createUser(testApp.ds, [userRole]);
      const cookie = authCookie(testApp.module, user);

      const res = await request(testApp.app.getHttpServer() as App)
        .get('/auth/me')
        .set('Cookie', cookie)
        .expect(200);

      expect(res.body).toMatchObject({
        id: user.id,
        name: user.name,
      });
    });

    it('РІРѕР·РІСЂР°С‰Р°РµС‚ 401 СЃ РЅРµРІР°Р»РёРґРЅС‹Рј С‚РѕРєРµРЅРѕРј', () => {
      return request(testApp.app.getHttpServer() as App)
        .get('/auth/me')
        .set('Cookie', 'session=invalidtoken')
        .expect(401);
    });
  });

  describe('POST /auth/telegram', () => {
    it('РІРѕР·РІСЂР°С‰Р°РµС‚ 401 Р±РµР· Р·Р°РіРѕР»РѕРІРєР° Authorization', () => {
      return request(testApp.app.getHttpServer() as App)
        .post('/auth/telegram')
        .expect(401);
    });

    it('РІРѕР·РІСЂР°С‰Р°РµС‚ 401 СЃ РЅРµРІРµСЂРЅС‹Рј С„РѕСЂРјР°С‚РѕРј Р·Р°РіРѕР»РѕРІРєР°', () => {
      return request(testApp.app.getHttpServer() as App)
        .post('/auth/telegram')
        .set('Authorization', 'Bearer invalid')
        .expect(401);
    });
  });
});

