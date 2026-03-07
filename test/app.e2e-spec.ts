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

describe('App smoke (e2e)', () => {
  let testApp: TestApp;

  beforeAll(async () => {
    testApp = await createTestApp();
    await clearDatabase(testApp.ds);
    await seedRoles(testApp.ds);
  });

  afterAll(async () => {
    await closeTestApp(testApp);
  });

  it('приложение запускается и отвечает на запросы', async () => {
    // GET /catalog — публично доступный эндпоинт (требует авторизации по факту,
    // но убеждаемся что приложение живо и отвечает, а не 500)
    const { userRole } = await testApp.ds
      .getRepository(Role)
      .findOne({ where: { code: 'USER' as any } })
      .then((r) => ({ userRole: r! }));

    const user = await createUser(testApp.ds, [userRole]);
    const cookie = authCookie(testApp.module, user);

    const res = await request(testApp.app.getHttpServer() as App)
      .get('/catalog')
      .set('Cookie', cookie);

    expect(res.status).not.toBe(500);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
