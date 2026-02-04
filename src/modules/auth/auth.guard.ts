import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { User, UsersService } from '@modules/users';
import { AuthService } from './auth.service';
import { IS_PUBLIC_KEY } from './public.decorator';
import { isSessionPayload } from './types';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly auth: AuthService,
    private readonly users: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (process.env.SKIP_AUTH === 'true') {
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
