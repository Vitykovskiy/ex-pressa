import { ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { User } from '../users/user.entity';
import { RoleCode } from '../users/roles/role-code.enum';
import { RolesGuard } from './roles.guard';

function createContext(user?: User) {
  return {
    getHandler: () => 'handler',
    getClass: () => 'class',
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as never;
}

function createUser(roleCodes: RoleCode[]): User {
  return Object.assign(new User(), {
    id: 1,
    name: 'Tester',
    isActive: true,
    isConfirmed: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    roles: roleCodes.map((code, index) => ({
      id: index + 1,
      code,
      name: code,
      users: [],
    })),
  });
}

describe('RolesGuard', () => {
  it('skips role checks when SKIP_ROLES=true', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(['ADMIN']),
    } as unknown as Reflector;
    const config = {
      get: jest.fn().mockReturnValue('true'),
    } as unknown as ConfigService;
    const guard = new RolesGuard(reflector, config);

    expect(guard.canActivate(createContext())).toBe(true);
  });

  it('allows access when user has required role', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(['ADMIN']),
    } as unknown as Reflector;
    const config = {
      get: jest.fn().mockReturnValue('false'),
    } as unknown as ConfigService;
    const guard = new RolesGuard(reflector, config);

    expect(guard.canActivate(createContext(createUser([RoleCode.ADMIN])))).toBe(
      true,
    );
  });

  it('denies access when user lacks required role', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(['ADMIN']),
    } as unknown as Reflector;
    const config = {
      get: jest.fn().mockReturnValue('false'),
    } as unknown as ConfigService;
    const guard = new RolesGuard(reflector, config);

    expect(() =>
      guard.canActivate(createContext(createUser([RoleCode.USER]))),
    ).toThrow(ForbiddenException);
  });
});
