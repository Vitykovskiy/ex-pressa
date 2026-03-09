import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { User, UsersService } from '@modules/users';
import { RoleCode } from '@modules/users/roles/role-code.enum';
import { AuthService } from './auth.service';
import { parseBoolean } from './helpers';
import { IS_PUBLIC_KEY } from './public.decorator';
import { isSessionPayload } from './types';

const DEV_USER: User = Object.assign(new User(), {
  id: 0,
  name: 'Dev User',
  tgId: undefined,
  tgUsername: undefined,
  isActive: true,
  isConfirmed: true,
  confirmationRequestedAt: undefined,
  createdAt: new Date(0),
  updatedAt: new Date(0),
  roles: [
    { id: 1, code: RoleCode.USER, name: 'Пользователь', users: [] },
    { id: 2, code: RoleCode.BARISTA, name: 'Бариста', users: [] },
    { id: 3, code: RoleCode.ADMIN, name: 'Администратор', users: [] },
  ],
});

const ALL_ROLES = DEV_USER.roles;

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly skipAuth: boolean;
  private readonly skipRoles: boolean;

  constructor(
    private readonly reflector: Reflector,
    private readonly config: ConfigService,
    private readonly auth: AuthService,
    private readonly users: UsersService,
  ) {
    this.skipAuth = parseBoolean(this.config.get<string>('SKIP_AUTH', 'false'));
    this.skipRoles = parseBoolean(
      this.config.get<string>('SKIP_ROLES', 'false'),
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.skipAuth) {
      const request = context.switchToHttp().getRequest<Request>();
      const persistedUser = await this.users.ensureSkipAuthUser();
      (request as Request & { user: User }).user = Object.assign(
        new User(),
        DEV_USER,
        {
          id: persistedUser.id,
          name: persistedUser.name,
          tgUsername: persistedUser.tgUsername,
          isActive: persistedUser.isActive,
          isConfirmed: persistedUser.isConfirmed,
        },
      );
      return true;
    }

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const type = context.getType<string>();

    if (type !== 'http') {
      throw new UnauthorizedException('Контекст не поддерживает авторизацию');
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies?.session as string | undefined;
    if (!token) {
      throw new UnauthorizedException('Сессия не найдена');
    }

    let payload: unknown;
    try {
      payload = this.auth.verifyToken(token);
    } catch {
      throw new UnauthorizedException('Сессия некорректна');
    }
    if (!isSessionPayload(payload)) {
      throw new UnauthorizedException('Сессия некорректна');
    }

    const user = await this.users.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    (request as Request & { user: User }).user = this.skipRoles
      ? Object.assign(new User(), user, { roles: ALL_ROLES })
      : user;
    return true;
  }
}
