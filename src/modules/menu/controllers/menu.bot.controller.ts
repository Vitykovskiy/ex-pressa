import { Update, Ctx, Command, On, Action } from 'nestjs-telegraf';
import { Context, Markup } from 'telegraf';
import { MenuImportService } from '../services/menu-import.service';
import { MenuService } from '../services/menu.service';
import { Message } from 'telegraf/types';

@Update()
export class MenuBotController {
  constructor(
    private readonly menu: MenuService,
    private readonly importer: MenuImportService,
  ) {}

  @Command('menu')
  async showMenu(@Ctx() ctx: Context) {
    // URL вашей страницы с меню, доступной по HTTPS
    const webAppUrl = 'https://serene-heliotrope-d9a2a9.netlify.app/';

    return ctx.reply(
      'Открываю меню:',
      Markup.inlineKeyboard([
        [Markup.button.webApp('Открыть меню', webAppUrl)],
      ]),
    );
  }

  @Action(/menu_item:(.+)/)
  async onMenuItem(@Ctx() ctx: Context) {
    const match = (ctx as any).match as RegExpMatchArray;
    const name = match[1];

    const item = await this.menu.findItemByName(name);
    if (!item) {
      await ctx.answerCbQuery('Позиция не найдена');
      return;
    }

    await ctx.answerCbQuery();
    await ctx.reply(`Вы выбрали: ${item.name} за ${item.price.toFixed(2)}₽`);
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
