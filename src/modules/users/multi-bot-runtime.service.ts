import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Context, Markup, Telegraf } from 'telegraf';
import {
  buildBotWebAppLinks,
  resolveWebAppUrls,
  type BotWebAppLink,
} from './bot-links';
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
  private started = false;

  constructor(
    private readonly config: ConfigService,
    private readonly users: UsersService,
  ) {}

  async onModuleInit(): Promise<void> {
    if (this.config.get<string>('NODE_ENV') === 'test' || this.started) {
      return;
    }
    this.started = true;
    queueMicrotask(() => {
      void this.startExtraBots();
    });
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

  private async startExtraBots(): Promise<void> {
    try {
      const urls = resolveWebAppUrls(
        this.config.get<string>('BOT_WEB_APP_URL', ''),
        this.config.get<string>('WEB_APP_URL', ''),
      );

      const links = buildBotWebAppLinks({
        primaryToken: this.config.get<string>('TELEGRAM_BOT_TOKEN', ''),
        extraTokens: this.config.get<string>('TELEGRAM_BOT_TOKENS', ''),
        customerUrl: urls.customerUrl,
        baristaUrl: urls.baristaUrl,
        adminUrl: urls.adminUrl,
      });

      await Promise.allSettled(
        links.map((link, index) =>
          index === 0
            ? this.configureMenuButton(link)
            : this.launchBot(link),
        ),
      );
    } catch (error) {
      this.logger.error(
        `Failed to start extra bots: ${error instanceof Error ? error.stack ?? error.message : String(error)}`,
      );
    }
  }

  private async configureMenuButton(link: BotWebAppLink): Promise<void> {
    const bot = new Telegraf(link.token);

    try {
      await bot.telegram.setChatMenuButton({
        menuButton: {
          type: 'web_app',
          text: link.buttonText,
          web_app: {
            url: link.appUrl,
          },
        },
      });
      this.logger.log(`Menu button configured for ${link.buttonText}`);
    } finally {
      await bot.stop();
    }
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

    await bot.telegram.setChatMenuButton({
      menuButton: {
        type: 'web_app',
        text: link.buttonText,
        web_app: {
          url: link.appUrl,
        },
      },
    });
    await bot.launch();
    this.bots.push(bot);
    this.logger.log(`Extra bot launched for ${link.buttonText}`);
  }
}
