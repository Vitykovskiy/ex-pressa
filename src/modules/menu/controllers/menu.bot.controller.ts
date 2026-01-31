import { Update, Ctx, Command } from 'nestjs-telegraf';
import { Context, Markup } from 'telegraf';
import { WEB_APP_URL } from 'src/main';

@Update()
export class MenuBotController {
  @Command('menu')
  async showMenu(@Ctx() ctx: Context) {
    return ctx.reply(
      'Открываю меню:',
      Markup.inlineKeyboard([
        [Markup.button.webApp('Открыть меню', WEB_APP_URL)],
      ]),
    );
  }
}
