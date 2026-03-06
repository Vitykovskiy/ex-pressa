import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { User } from '@modules/users';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!required || required.length === 0) return true;

    const request = context.switchToHttp().getRequest<{ user?: User }>();
    const user = request.user;

    if (!user) throw new ForbiddenException('Нет доступа');

    const userRoles = user.roles?.map((r) => r.code as string) ?? [];
    const hasRole = required.some((r) => userRoles.includes(r));

    if (!hasRole) throw new ForbiddenException('Недостаточно прав');
    return true;
  }
}
