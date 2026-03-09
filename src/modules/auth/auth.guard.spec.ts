import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';

jest.mock(
  '@modules/users',
  () => ({
    User: class User {},
    UsersService: class UsersService {},
  }),
  { virtual: true },
);

jest.mock(
  '@modules/users/roles/role-code.enum',
  () => ({
    RoleCode: {
      USER: 'USER',
      BARISTA: 'BARISTA',
      ADMIN: 'ADMIN',
    },
  }),
  { virtual: true },
);

import { User } from '@modules/users';
import { RoleCode } from '@modules/users/roles/role-code.enum';
import { AuthGuard } from './auth.guard';

function createUser(): InstanceType<typeof User> {
  return Object.assign(new User(), {
    id: 7,
    name: 'Tester',
    tgId: '123',
    tgUsername: 'tester',
    isActive: true,
    isConfirmed: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    roles: [],
  });
}

describe('AuthGuard', () => {
  it('injects all roles when SKIP_ROLES=true and telegram session is valid', async () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(false),
    } as unknown as Reflector;
    const config = {
      get: jest.fn((key: string) => {
        if (key === 'SKIP_AUTH') {
          return 'false';
        }
        if (key === 'SKIP_ROLES') {
          return 'true';
        }
        return '';
      }),
    } as unknown as ConfigService;
    const auth = {
      verifyToken: jest.fn().mockReturnValue({ sub: 7, tgId: '123' }),
    };
    const users = {
      findById: jest.fn().mockResolvedValue(createUser()),
      ensureSkipAuthUser: jest.fn(),
    };
    const guard = new AuthGuard(
      reflector,
      config,
      auth as never,
      users as never,
    );
    const request = {
      cookies: { session: 'token' },
    };
    const context = {
      getHandler: () => 'handler',
      getClass: () => 'class',
      getType: () => 'http',
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as never;

    await expect(guard.canActivate(context)).resolves.toBe(true);
    const user = (request as { user?: { roles: Array<{ code: string }> } }).user;

    expect(user?.roles.map((role) => role.code)).toEqual([
      RoleCode.USER,
      RoleCode.BARISTA,
      RoleCode.ADMIN,
    ]);
  });

  it('keeps telegram auth enabled when SKIP_ROLES=true', async () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(false),
    } as unknown as Reflector;
    const config = {
      get: jest.fn((key: string) => {
        if (key === 'SKIP_AUTH') {
          return 'false';
        }
        if (key === 'SKIP_ROLES') {
          return 'true';
        }
        return '';
      }),
    } as unknown as ConfigService;
    const auth = {
      verifyToken: jest.fn(),
    };
    const users = {
      findById: jest.fn(),
      ensureSkipAuthUser: jest.fn(),
    };
    const guard = new AuthGuard(
      reflector,
      config,
      auth as never,
      users as never,
    );
    const context = {
      getHandler: () => 'handler',
      getClass: () => 'class',
      getType: () => 'http',
      switchToHttp: () => ({
        getRequest: () => ({ cookies: {} }),
      }),
    } as never;

    await expect(guard.canActivate(context)).rejects.toThrow(
      'Сессия не найдена',
    );
  });
});
