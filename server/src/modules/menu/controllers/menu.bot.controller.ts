import { Update, Ctx, Command, On } from 'nestjs-telegraf';
import { Context, Markup } from 'telegraf';
import { MenuImportService } from '../services/menu-import.service';
import { Message } from 'telegraf/types';
import { ConfigService } from '@nestjs/config';

@Update()
export class MenuBotController {  private readonly webAppUrl: string;

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
      'Р С›РЎвЂљР С”РЎР‚РЎвЂ№Р Р†Р В°РЎР‹ Р СР ВµР Р…РЎР‹:',
      Markup.inlineKeyboard([
        [Markup.button.webApp('Р С›РЎвЂљР С”РЎР‚РЎвЂ№РЎвЂљРЎРЉ Р СР ВµР Р…РЎР‹', this.webAppUrl)],
      ]),
    );
  }

  @Command('importmenu')
  async importPrompt(@Ctx() ctx: Context) {
    await ctx.reply('Р С›РЎвЂљР С—РЎР‚Р В°Р Р†РЎРЉРЎвЂљР Вµ Excel-РЎвЂћР В°Р в„–Р В» РЎРѓ Р СР ВµР Р…РЎР‹ (.xlsx).');
  }

  @On('document')
  async onDocument(@Ctx() ctx: Context) {
    const message = ctx.message as Message.DocumentMessage;
    const file = message.document;

    if (!file?.file_id) {
      return ctx.reply('Р В¤Р В°Р в„–Р В» Р Р…Р Вµ Р Р…Р В°Р в„–Р Т‘Р ВµР Р….');
    }

    const fileLink = await ctx.telegram.getFileLink(file.file_id);
    const res = await fetch(fileLink.href);
    const buffer = Buffer.from(await res.arrayBuffer());

    const menu = await this.importer.importFromBuffer(buffer);
    await ctx.reply(
      `РІСљвЂ¦ Р ВР СР С—Р С•РЎР‚РЎвЂљР С‘РЎР‚Р С•Р Р†Р В°Р Р…Р С• Р СР ВµР Р…РЎР‹ "${menu.title}" РЎРѓ ${menu.items.length} Р С—Р С•Р В·Р С‘РЎвЂ Р С‘РЎРЏР СР С‘.`,
    );
  }
}
