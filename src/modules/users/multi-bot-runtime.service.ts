import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Context, Markup, Telegraf } from 'telegraf';
import { buildBotWebAppLinks, type BotWebAppLink } from './bot-links';
import { UsersService } from './users.service';

function getFrom(ctx: Context) {
  const from = ctx.message?.from || ctx.callbackQuery?.from || ctx.from;
  return {
    tgId: from?.id?.toString(),
    tgUsername: from?.username || undefined,
    name:
      [from?.first_name, from?.last_name].filter(Boolean).join(' ') ||
      from?.username ||
      'Пользователь',
  };
}

@Injectable()
export class MultiBotRuntimeService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MultiBotRuntimeService.name);
  private readonly bots: Telegraf[] = [];

  constructor(
    private readonly config: ConfigService,
    private readonly users: UsersService,
  ) {}

  async onModuleInit(): Promise<void> {
    if (this.config.get<string>('NODE_ENV') === 'test') {
      return;
    }

    const webAppUrls = (this.config.get<string>('WEB_APP_URL', '') || '')
      .split(',')
      .map((url) => url.trim())
      .filter(Boolean);

    const links = buildBotWebAppLinks({
      primaryToken: this.config.get<string>('TELEGRAM_BOT_TOKEN', ''),
      extraTokens: this.config.get<string>('TELEGRAM_BOT_TOKENS', ''),
      customerUrl:
        this.config.get<string>('BOT_WEB_APP_URL', '') || webAppUrls[0],
      baristaUrl: webAppUrls[1],
      adminUrl: webAppUrls[2],
    });

    for (const link of links.slice(1)) {
      await this.launchBot(link);
    }
  }

  async onModuleDestroy(): Promise<void> {
    await Promise.all(
      this.bots.map(async (bot) => {
        try {
          await bot.stop();
        } catch (error) {
          this.logger.warn(
            `Failed to stop extra bot: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }),
    );
  }

  private async launchBot(link: BotWebAppLink): Promise<void> {
    const bot = new Telegraf(link.token);

    bot.start(async (ctx) => {
      const from = getFrom(ctx);
      const user = await this.users.createOrFindByTgId({
        tgId: from.tgId ?? '',
        tgUsername: from.tgUsername,
        name: from.name,
      });

      await ctx.reply(
        `Здравствуйте, ${user.name}`,
        Markup.inlineKeyboard([
          [Markup.button.webApp(link.buttonText, link.appUrl)],
        ]),
      );
    });

    await bot.launch();
    this.bots.push(bot);
    this.logger.log(`Extra bot launched for ${link.buttonText}`);
  }
}

