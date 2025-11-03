import { Update, Ctx, Command, On } from 'nestjs-telegraf';
import { Context } from 'telegraf';
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
    const items = await this.menu.listItems();
    if (!items.length) return ctx.reply('Меню пока пусто.');

    const text = items
      .map((i, idx) => `${idx + 1}. ${i.name} — ${i.price.toFixed(2)}₽`)
      .join('\n');
    await ctx.reply(`📋 Меню:\n${text}`);
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
