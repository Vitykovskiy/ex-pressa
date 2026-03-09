import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { User } from '@modules/users';
import { parseBoolean } from './helpers';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly skipRoles: boolean;

  constructor(
    private readonly reflector: Reflector,
    private readonly config: ConfigService,
  ) {
    this.skipRoles = parseBoolean(
      this.config.get<string>('SKIP_ROLES', 'false'),
    );
  }

  canActivate(context: ExecutionContext): boolean {
    if (this.skipRoles) {
      return true;
    }

    const required = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!required || required.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: User }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Нет доступа');
    }

    const userRoles = user.roles?.map((role) => role.code as string) ?? [];
    const hasRole = required.some((role) => userRoles.includes(role));

    if (!hasRole) {
      throw new ForbiddenException('Недостаточно прав');
    }

    return true;
  }
}
