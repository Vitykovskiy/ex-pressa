import { Update, Command, Ctx, Hears } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { ScheduleService } from '../schedule.service';

@Update()
export class ScheduleBotController {
  constructor(private readonly schedule: ScheduleService) {}

  @Command('slots')
  async showSlots(@Ctx() ctx: Context) {
    const slots = await this.schedule.findActive();
    if (!slots.length) return ctx.reply('Нет активных слотов.');

    const lines = slots.map((s) => {
      const from = s.startTime.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      });
      const to = s.endTime.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      });
      return `#${s.id} ${from}–${to} (${s.capacityMinutes} мин)`;
    });

    await ctx.reply(['⏰ Активные слоты:', ...lines].join('\n'));
  }

  // пример: /addslot 10:00 11:00 90
  @Hears(/^\/addslot\s+(\d{1,2}:\d{2})\s+(\d{1,2}:\d{2})(?:\s+(\d+))?$/i)
  async addSlot(@Ctx() ctx: Context) {
    const text = (ctx.message as any).text;
    const [, startStr, endStr, capStr] =
      text.match(
        /^\/addslot\s+(\d{1,2}:\d{2})\s+(\d{1,2}:\d{2})(?:\s+(\d+))?$/i,
      ) || [];
    const today = new Date();
    const [sh, sm] = startStr.split(':').map(Number);
    const [eh, em] = endStr.split(':').map(Number);
    const start = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      sh,
      sm,
    );
    const end = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      eh,
      em,
    );
    const cap = capStr ? parseInt(capStr, 10) : 60;

    const slot = await this.schedule.create(start, end, cap);
    await ctx.reply(
      `Добавлен слот #${slot.id}: ${startStr}–${endStr}, вместимость ${cap} мин.`,
    );
  }
}
