import request from 'supertest';
import { App } from 'supertest/types';
import { Role } from '../src/modules/users/roles/role.entity';
import {
  TestApp,
  createTestApp,
  closeTestApp,
  clearDatabase,
  seedRoles,
  createUser,
  authCookie,
} from './helpers/setup';

describe('Auth (e2e)', () => {
  let testApp: TestApp;
  let userRole: Role;

  beforeAll(async () => {
    testApp = await createTestApp();
    await clearDatabase(testApp.ds);
    ({ userRole } = await seedRoles(testApp.ds));
  });

  afterAll(async () => {
    await closeTestApp(testApp);
  });

  describe('GET /auth/me', () => {
    it('возвращает 401 без сессии', () => {
      return request(testApp.app.getHttpServer() as App)
        .get('/auth/me')
        .expect(401);
    });

    it('возвращает текущего пользователя при валидном токене', async () => {
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

    it('возвращает 401 с невалидным токеном', () => {
      return request(testApp.app.getHttpServer() as App)
        .get('/auth/me')
        .set('Cookie', 'session=invalidtoken')
        .expect(401);
    });
  });

  describe('POST /auth/telegram', () => {
    it('возвращает 401 без заголовка Authorization', () => {
      return request(testApp.app.getHttpServer() as App)
        .post('/auth/telegram')
        .expect(401);
    });

    it('возвращает 401 с неверным форматом заголовка', () => {
      return request(testApp.app.getHttpServer() as App)
        .post('/auth/telegram')
        .set('Authorization', 'Bearer invalid')
        .expect(401);
    });
  });
});
