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

/** Мок-пользователь для режима SKIP_AUTH=true — имеет все роли */
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

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly skipAuth: boolean;

  constructor(
    private readonly reflector: Reflector,
    private readonly config: ConfigService,
    private readonly auth: AuthService,
    private readonly users: UsersService,
  ) {
    this.skipAuth = parseBoolean(this.config.get<string>('SKIP_AUTH', 'false'));
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.skipAuth) {
      const request = context.switchToHttp().getRequest<Request>();
      (request as Request & { user: User }).user = DEV_USER;
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

    const payload = this.auth.verifyToken(token);
    if (!isSessionPayload(payload)) {
      throw new UnauthorizedException('Сессия некорректна');
    }

    const user = await this.users.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    (request as Request & { user: User }).user = user;
    return true;
  }
}
