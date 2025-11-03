import { Update, Start, Command, Ctx, Hears } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { CustomersService } from '../customers.service';

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
export class CustomersBotController {
  constructor(private readonly customers: CustomersService) {}

  @Start()
  async onStart(@Ctx() ctx: Context) {
    const from = getFrom(ctx);
    const customer = await this.customers.createOrFindByTgId({
      tgId: from.tgId ?? '',
      tgUsername: from.tgUsername ?? undefined,
      name: from.name,
    });

    await ctx.reply(
      `Здравствуйте, ${customer.name}. Ваш профиль создан. Команды: /me, /setname <имя>`,
    );
  }

  @Command('me')
  async me(@Ctx() ctx: Context) {
    const from = getFrom(ctx);
    if (!from.tgId) return ctx.reply('Не удалось определить Telegram ID.');

    const customer = await this.customers.findByTgId(from.tgId);
    if (!customer) return ctx.reply('Профиль не найден. Наберите /start.');

    await ctx.reply(
      [
        `ID: ${customer.id}`,
        `Имя: ${customer.name}`,
        `Username: ${customer.tgUsername ?? '—'}`,
        `Активен: ${customer.isActive ? 'да' : 'нет'}`,
        `Создан: ${customer.createdAt.toISOString()}`,
      ].join('\n'),
    );
  }

  // Пример: /setname Иван Петров
  @Hears(/^\/setname\s+(.+)/i)
  async setName(@Ctx() ctx: Context) {
    const from = getFrom(ctx);
    if (!from.tgId) return ctx.reply('Не удалось определить Telegram ID.');

    const match = (ctx.message as any).text.match(/^\/setname\s+(.+)/i);
    const newName = match?.[1]?.trim();
    if (!newName) return ctx.reply('Укажите имя: /setname Иван Петров');

    const customer = await this.customers.findByTgId(from.tgId);
    if (!customer) return ctx.reply('Профиль не найден. Наберите /start.');

    customer.name = newName;
    await this.customers.update(customer.id, { name: newName });
    await ctx.reply(`Имя обновлено: ${newName}`);
  }

  // Фолбэк для непонятных сообщений
  @Hears(/.*/i)
  async fallback(@Ctx() ctx: Context) {
    await ctx.reply('Неизвестная команда. Используйте: /me, /setname <имя>');
  }
}
