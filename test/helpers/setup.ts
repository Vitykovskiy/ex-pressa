import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import cookieParser from 'cookie-parser';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module';
import { AuthService } from '../../src/modules/auth/auth.service';
import { User } from '../../src/modules/users/user.entity';
import { Role } from '../../src/modules/users/roles/role.entity';
import { RoleCode } from '../../src/modules/users/roles/role-code.enum';

export const mockBot = {
  launch: jest.fn().mockResolvedValue(undefined),
  stop: jest.fn().mockResolvedValue(undefined),
  telegram: { sendMessage: jest.fn().mockResolvedValue(undefined) },
  use: jest.fn(),
  on: jest.fn(),
  command: jest.fn(),
  start: jest.fn(),
  hears: jest.fn(),
  action: jest.fn(),
  catch: jest.fn(),
};

export interface TestApp {
  app: INestApplication;
  module: TestingModule;
  ds: DataSource;
}

export async function createTestApp(): Promise<TestApp> {
  const module = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider('DEFAULT_BOT_NAME')
    .useValue(mockBot)
    .compile();

  const server = express();
  server.use(cookieParser());

  const app = module.createNestApplication(new ExpressAdapter(server));
  await app.init();

  const ds = module.get(DataSource);
  return { app, module, ds };
}

export async function closeTestApp(testApp: TestApp): Promise<void> {
  await testApp.app.close();
}

export async function clearDatabase(ds: DataSource): Promise<void> {
  await ds.query(`
    TRUNCATE TABLE
      order_item_addons, order_items, orders,
      cart_item_addons, cart_items, carts,
      product_group_addon_groups,
      product_prices, products, product_groups,
      addons, addon_groups,
      time_slots,
      user_roles, users, roles
    RESTART IDENTITY CASCADE
  `);
}

let userCounter = 0;

export async function seedRoles(ds: DataSource): Promise<{
  userRole: Role;
  baristaRole: Role;
  adminRole: Role;
}> {
  const repo = ds.getRepository(Role);
  const userRole = await repo.save({
    code: RoleCode.USER,
    name: 'Пользователь',
  });
  const baristaRole = await repo.save({
    code: RoleCode.BARISTA,
    name: 'Бариста',
  });
  const adminRole = await repo.save({
    code: RoleCode.ADMIN,
    name: 'Администратор',
  });
  return { userRole, baristaRole, adminRole };
}

export async function createUser(
  ds: DataSource,
  roles: Role[],
  opts: { name?: string; isConfirmed?: boolean } = {},
): Promise<User> {
  const repo = ds.getRepository(User);
  const n = ++userCounter;
  return repo.save({
    name: opts.name ?? `Test User ${n}`,
    tgId: `tg-test-${n}-${Date.now()}`,
    tgUsername: `testuser${n}`,
    isActive: true,
    isConfirmed: opts.isConfirmed ?? true,
    roles,
  });
}

export function authCookie(module: TestingModule, user: User): string {
  const auth = module.get(AuthService);
  return `session=${auth.issueToken(user)}`;
}
