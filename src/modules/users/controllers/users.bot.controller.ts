import { Update, Start, Ctx } from 'nestjs-telegraf';
import { Context, Markup } from 'telegraf';
import { UsersService } from '../users.service';

function getFrom(ctx: Context) {
  const from = ctx.message?.from || ctx.callbackQuery?.from || ctx.from;
  return {
    tgId: from?.id?.toString(),
    tgUsername: from?.username || null,
    name:
      [from?.first_name, from?.last_name].filter(Boolean).join(' ') ||
      from?.username ||
      'User',
  };
}

@Update()
export class UsersBotController {
  constructor(private readonly users: UsersService) {}

  @Start()
  async onStart(@Ctx() ctx: Context) {
    const from = getFrom(ctx);
    const user = await this.users.createOrFindByTgId({
      tgId: from.tgId ?? '',
      tgUsername: from.tgUsername ?? undefined,
      name: from.name,
    });

    await ctx.reply(
      `Здравствуйте, ${user.name}`,
      Markup.keyboard([['/menu']])
        .resize()
        .oneTime(),
    );
  }
}
