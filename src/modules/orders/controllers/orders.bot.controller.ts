import { Update, Command, Ctx, Hears } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from 'src/modules/customers/customers.entity';
import { OrdersService } from '../orders.service';

function getTgId(ctx: Context): string | null {
  const from = ctx.message?.from || ctx.callbackQuery?.from || ctx.from;
  return from?.id ? String(from.id) : null;
}

@Update()
export class OrdersBotController {
  constructor(
    private readonly orders: OrdersService,
    @InjectRepository(Customer)
    private readonly customers: Repository<Customer>,
  ) {}

  @Command('neworder')
  async newOrder(@Ctx() ctx: Context) {
    const tgId = getTgId(ctx);
    if (!tgId) return ctx.reply('Не удалось определить Telegram ID.');

    const customer = await this.customers.findOne({ where: { tgId } });
    if (!customer)
      return ctx.reply('Профиль не найден. Наберите /start в боте клиентов.');

    const existing = await this.orders.getOpenByCustomer(customer.id);
    if (existing)
      return ctx.reply(`У вас уже есть заказ #${existing.id} в работе.`);

    const order = await this.orders.create(customer.id);
    return ctx.reply(
      `Создан заказ #${order.id}. Добавляйте позиции командой: /add <itemId> [qty]`,
    );
  }

  // пример: /add 12 2
  @Hears(/^\/add\s+(\d+)(?:\s+(\d+))?/i)
  async add(@Ctx() ctx: Context) {
    const tgId = getTgId(ctx);
    if (!tgId) return ctx.reply('Не удалось определить Telegram ID.');
    const customer = await this.customers.findOne({ where: { tgId } });
    if (!customer) return ctx.reply('Профиль не найден.');

    const order = await this.orders.getOpenByCustomer(customer.id);
    if (!order) return ctx.reply('Сначала создайте заказ: /neworder');

    const text = (ctx.message as any).text as string;
    const [, itemIdStr, qtyStr] =
      text.match(/^\/add\s+(\d+)(?:\s+(\d+))?/i) || [];
    const itemId = Number(itemIdStr);
    const qty = qtyStr ? Number(qtyStr) : 1;

    const updated = await this.orders.addItem(order.id, itemId, qty);
    const total = await this.orders.total(updated.id);
    return ctx.reply(
      `Добавлено. Позиции: ${updated.items.length}. Сумма: ${total.toFixed(2)}.`,
    );
  }

  @Command('cart')
  async cart(@Ctx() ctx: Context) {
    const tgId = getTgId(ctx);
    if (!tgId) return ctx.reply('Не удалось определить Telegram ID.');
    const customer = await this.customers.findOne({ where: { tgId } });
    if (!customer) return ctx.reply('Профиль не найден.');

    const order = await this.orders.getOpenByCustomer(customer.id);
    if (!order) return ctx.reply('Корзина пуста. Создайте заказ: /neworder');

    const lines = order.items.map(
      (i) =>
        `#${i.id} ${i.menuItem.name} × ${i.qty} = ${(i.qty * i.price).toFixed(2)}`,
    );
    const total = await this.orders.total(order.id);
    return ctx.reply(
      ['Корзина:', ...lines, `Итого: ${total.toFixed(2)}`].join('\n'),
    );
  }

  @Command('confirm')
  async confirm(@Ctx() ctx: Context) {
    const tgId = getTgId(ctx);
    if (!tgId) return ctx.reply('Не удалось определить Telegram ID.');
    const customer = await this.customers.findOne({ where: { tgId } });
    if (!customer) return ctx.reply('Профиль не найден.');

    const order = await this.orders.getOpenByCustomer(customer.id);
    if (!order) return ctx.reply('Нет активного заказа.');

    const updated = await this.orders.confirm(order.id);
    const total = await this.orders.total(updated.id);
    return ctx.reply(
      `Заказ #${updated.id} подтверждён. Сумма: ${total.toFixed(2)}.`,
    );
  }

  @Command('cancel')
  async cancel(@Ctx() ctx: Context) {
    const tgId = getTgId(ctx);
    if (!tgId) return ctx.reply('Не удалось определить Telegram ID.');
    const customer = await this.customers.findOne({ where: { tgId } });
    if (!customer) return ctx.reply('Профиль не найден.');

    const order = await this.orders.getOpenByCustomer(customer.id);
    if (!order) return ctx.reply('Нет активного заказа.');

    await this.orders.cancel(order.id);
    return ctx.reply(`Заказ #${order.id} отменён.`);
  }
}
