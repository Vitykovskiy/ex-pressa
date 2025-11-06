import { Update, Ctx, Command, On } from 'nestjs-telegraf';
import { Context, Markup } from 'telegraf';
import { MenuImportService } from '../services/menu-import.service';
import { Message } from 'telegraf/types';
import { WEB_APP_URL } from 'src/main';

@Update()
export class MenuBotController {
  constructor(private readonly importer: MenuImportService) {}

  @Command('menu')
  async showMenu(@Ctx() ctx: Context) {
    return ctx.reply(
      'Открываю меню:',
      Markup.inlineKeyboard([
        [Markup.button.webApp('Открыть меню', WEB_APP_URL)],
      ]),
    );
  }

  @Command('importmenu')
  async importPrompt(@Ctx() ctx: Context) {
    await ctx.reply('Отправьте Excel-файл с меню (.xlsx).');
  }

  @On('document')
  async onDocument(@Ctx() ctx: Context) {
    const message = ctx.message as Message.DocumentMessage;
    const file = message.document;

    if (!file?.file_id) {
      return ctx.reply('Файл не найден.');
    }

    const fileLink = await ctx.telegram.getFileLink(file.file_id);
    const res = await fetch(fileLink.href);
    const buffer = Buffer.from(await res.arrayBuffer());

    const menu = await this.importer.importFromBuffer(buffer);
    await ctx.reply(
      `✅ Импортировано меню "${menu.title}" с ${menu.items.length} позициями.`,
    );
  }
}
