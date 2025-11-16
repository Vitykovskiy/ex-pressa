import { Update, Ctx, Command, On } from 'nestjs-telegraf';
import { Context, Markup } from 'telegraf';
import { MenuImportService } from '../services/menu-import.service';
import { Message } from 'telegraf/types';
import { ConfigService } from '@nestjs/config';

@Update()
export class MenuBotController {
  private readonly webAppUrl: string;

  constructor(
    private readonly importer: MenuImportService,
    configService: ConfigService,
  ) {
    this.webAppUrl = configService.get<string>(
      'WEB_APP_URL',
      'http://localhost:5173',
    );
  }

  @Command('menu')
  async showMenu(@Ctx() ctx: Context) {
    return ctx.reply(
      'Откройте цифровое меню:',
      Markup.inlineKeyboard([
        [Markup.button.webApp('Перейти в меню', this.webAppUrl)],
      ]),
    );
  }

  @Command('importmenu')
  async importPrompt(@Ctx() ctx: Context) {
    await ctx.reply('Загрузите Excel-файл с меню (.xlsx).');
  }

  @On('document')
  async onDocument(@Ctx() ctx: Context) {
    const message = ctx.message as Message.DocumentMessage;
    const file = message.document;

    if (!file?.file_id) {
      return ctx.reply('Не удалось определить файл.');
    }

    const fileLink = await ctx.telegram.getFileLink(file.file_id);
    const res = await fetch(fileLink.href);
    const buffer = Buffer.from(await res.arrayBuffer());

    const menu = await this.importer.importFromBuffer(buffer);
    await ctx.reply(`Готово: загружено ${menu.items.length} позиций.`);
  }
}
