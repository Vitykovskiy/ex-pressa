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

describe('App smoke (e2e)', () => {
  let testApp: TestApp;

  beforeAll(async () => {
    testApp = await createTestApp();
    await clearDatabase(testApp.ds);
    await ensureRoles(testApp.ds);
  });

  afterAll(async () => {
    await closeTestApp(testApp);
  });

  it('РїСЂРёР»РѕР¶РµРЅРёРµ Р·Р°РїСѓСЃРєР°РµС‚СЃСЏ Рё РѕС‚РІРµС‡Р°РµС‚ РЅР° Р·Р°РїСЂРѕСЃС‹', async () => {
    // GET /catalog вЂ” РїСѓР±Р»РёС‡РЅРѕ РґРѕСЃС‚СѓРїРЅС‹Р№ СЌРЅРґРїРѕРёРЅС‚ (С‚СЂРµР±СѓРµС‚ Р°РІС‚РѕСЂРёР·Р°С†РёРё РїРѕ С„Р°РєС‚Сѓ,
    // РЅРѕ СѓР±РµР¶РґР°РµРјСЃСЏ С‡С‚Рѕ РїСЂРёР»РѕР¶РµРЅРёРµ Р¶РёРІРѕ Рё РѕС‚РІРµС‡Р°РµС‚, Р° РЅРµ 500)
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

