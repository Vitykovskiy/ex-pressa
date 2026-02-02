import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';
import { UsersService } from '../users/users.service';
import { verifyTelegramInitData } from './helpers';
import { User } from '../users/user.entity';
import { SessionPayload } from './types';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly config: ConfigService,
  ) {}

  private get jwtSecret(): string {
    const secret = this.config.get<string>('AUTH_JWT_SECRET', '');
    if (!secret) {
      throw new Error('AUTH_JWT_SECRET отсутствует в .env');
    }
    return secret;
  }

  async authTelegram(initData: string): Promise<User> {
    const botToken = this.config.get<string>('TELEGRAM_BOT_TOKEN', '');

    const result = verifyTelegramInitData(initData, botToken);

    if (!result.ok) {
      throw new UnauthorizedException(result.error);
    }

    const tgUser = result.data.user;

    if (!tgUser?.id) {
      throw new BadRequestException('Telegram user отсутствует');
    }

    const name =
      [tgUser.firstName, tgUser.lastName].filter(Boolean).join(' ') ||
      tgUser.username ||
      'Пользователь';

    return this.users.createOrFindByTgId({
      tgId: String(tgUser.id),
      tgUsername: tgUser.username,
      name,
    });
  }

  issueToken(user: User): string {
    const payload: SessionPayload = { sub: user.id, tgId: user.tgId };
    return jwt.sign(payload, this.jwtSecret, { expiresIn: '30d' });
  }

  verifyToken(token: string): unknown {
    return jwt.verify(token, this.jwtSecret);
  }
}
