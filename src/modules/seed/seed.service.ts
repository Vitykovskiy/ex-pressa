import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  User,
  Role,
  RoleCode,
} from '@modules/users';
import {
  ProductGroup,
  Product,
  ProductPrice,
  AddonGroup,
  Addon,
  ProductGroupAddonGroup,
  ProductType,
  DrinkSizeCode,
} from '@modules/catalog';
import {
  TimeSlot,
  Order,
  OrderItem,
  OrderStatus,
} from '@modules/orders';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);
  private readonly enabled: boolean;

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(ProductGroup) private readonly pgRepo: Repository<ProductGroup>,
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductPrice) private readonly priceRepo: Repository<ProductPrice>,
    @InjectRepository(AddonGroup) private readonly agRepo: Repository<AddonGroup>,
    @InjectRepository(Addon) private readonly addonRepo: Repository<Addon>,
    @InjectRepository(ProductGroupAddonGroup) private readonly pgagRepo: Repository<ProductGroupAddonGroup>,
    @InjectRepository(TimeSlot) private readonly slotRepo: Repository<TimeSlot>,
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private readonly itemRepo: Repository<OrderItem>,
  ) {
    this.enabled = config.get<string>('SEED_ON_START') === 'true';
  }

  async onModuleInit(): Promise<void> {
    if (!this.enabled) return;

    const existing = await this.roleRepo.count();
    if (existing > 0) {
      this.logger.log('БД уже содержит данные, сидирование пропущено');
      return;
    }

    this.logger.log('Сидирование тестовой БД...');
    await this.seed();
    this.logger.log('Сидирование завершено');
  }

  private async seed(): Promise<void> {
    // ── Роли ──────────────────────────────────────────────────────────────────
    const roleUser = await this.roleRepo.save({ code: RoleCode.USER, name: 'Пользователь' });
    const roleBarista = await this.roleRepo.save({ code: RoleCode.BARISTA, name: 'Бариста' });
    const roleAdmin = await this.roleRepo.save({ code: RoleCode.ADMIN, name: 'Администратор' });

    // ── Пользователи ──────────────────────────────────────────────────────────
    const testUser = await this.userRepo.save({
      name: 'Тестовый пользователь',
      tgUsername: 'test_user',
      isActive: true,
      isConfirmed: true,
      roles: [roleUser],
    });
    await this.userRepo.save({
      name: 'Анна Бариста',
      tgUsername: 'barista_1',
      isActive: true,
      isConfirmed: true,
      roles: [roleBarista],
    });
    await this.userRepo.save({
      name: 'Владелец кофейни',
      tgUsername: 'owner',
      isActive: true,
      isConfirmed: true,
      roles: [roleAdmin],
    });
    // Неактивный пользователь — для отображения статуса «Отключен» в admin/users
    await this.userRepo.save({
      name: 'Иван Тестовый',
      tgUsername: 'test_user2',
      isActive: false,
      isConfirmed: false,
      roles: [roleUser],
    });

    // ── Каталог: группы допов ─────────────────────────────────────────────────
    const syrups = await this.agRepo.save({ name: 'Сиропы', sortOrder: 1, isActive: true });
    await this.addonRepo.save({ addonGroup: syrups, name: 'Ваниль', priceRub: 50, isActive: true });
    await this.addonRepo.save({ addonGroup: syrups, name: 'Карамель', priceRub: 50, isActive: true });

    // ── Каталог: группы товаров ───────────────────────────────────────────────
    const drinks = await this.pgRepo.save({ name: 'Напитки', sortOrder: 1, isActive: true });
    const food = await this.pgRepo.save({ name: 'Еда', sortOrder: 2, isActive: true });

    // Привязка Напитки ↔ Сиропы
    await this.pgagRepo.save({ productGroupId: drinks.id, addonGroupId: syrups.id });

    // ── Каталог: товары ───────────────────────────────────────────────────────
    const cappuccino = await this.productRepo.save({
      group: drinks,
      name: 'Капучино',
      description: 'Вкусный капучино',
      type: ProductType.Drink,
      isActive: true,
      isAvailable: true,
      sortOrder: 1,
    });
    await this.priceRepo.save([
      { product: cappuccino, sizeCode: DrinkSizeCode.S, priceRub: 150, isActive: true },
      { product: cappuccino, sizeCode: DrinkSizeCode.M, priceRub: 200, isActive: true },
      { product: cappuccino, sizeCode: DrinkSizeCode.L, priceRub: 250, isActive: true },
    ]);

    const latte = await this.productRepo.save({
      group: drinks,
      name: 'Латте',
      description: 'Нежный латте',
      type: ProductType.Drink,
      isActive: true,
      isAvailable: true,
      sortOrder: 2,
    });
    await this.priceRepo.save([
      { product: latte, sizeCode: DrinkSizeCode.S, priceRub: 160, isActive: true },
      { product: latte, sizeCode: DrinkSizeCode.M, priceRub: 210, isActive: true },
      { product: latte, sizeCode: DrinkSizeCode.L, priceRub: 260, isActive: true },
    ]);

    const croissant = await this.productRepo.save({
      group: food,
      name: 'Круассан',
      type: ProductType.Food,
      isActive: true,
      isAvailable: true,
      sortOrder: 1,
    });
    await this.priceRepo.save([
      { product: croissant, sizeCode: null, priceRub: 120, isActive: true },
    ]);

    // ── Тайм-слоты ────────────────────────────────────────────────────────────
    const dateStr = (offset: number): string => {
      const d = new Date();
      d.setDate(d.getDate() + offset);
      return d.toISOString().split('T')[0];
    };
    const slotTimes = [
      { from: '09:00:00', to: '09:10:00' },
      { from: '09:10:00', to: '09:20:00' },
      { from: '09:20:00', to: '09:30:00' },
    ];

    // Сегодня: слот 1 свободен, слот 2 полный, слот 3 частично заполнен
    const slot1 = await this.slotRepo.save({ date: dateStr(0), timeFrom: '09:00:00', timeTo: '09:10:00', capacity: 5, bookedCount: 0, isActive: true });
    const slot2 = await this.slotRepo.save({ date: dateStr(0), timeFrom: '09:10:00', timeTo: '09:20:00', capacity: 5, bookedCount: 5, isActive: true });
    const slot3 = await this.slotRepo.save({ date: dateStr(0), timeFrom: '09:20:00', timeTo: '09:30:00', capacity: 5, bookedCount: 2, isActive: true });

    // Следующие 6 дней — пустые слоты
    for (let day = 1; day <= 6; day++) {
      for (const { from, to } of slotTimes) {
        await this.slotRepo.save({ date: dateStr(day), timeFrom: from, timeTo: to, capacity: 5, bookedCount: 0, isActive: true });
      }
    }

    // ── Заказы ────────────────────────────────────────────────────────────────
    // Заказ #1: CREATED
    const order1 = await this.orderRepo.save({
      user: testUser,
      timeSlot: slot1,
      status: OrderStatus.Created,
      slotTimeFrom: '09:00:00',
      slotTimeTo: '09:10:00',
      totalRub: 200,
    });
    await this.itemRepo.save({ order: order1, productName: 'Капучино', quantity: 1, sizeCode: 'M', unitPriceRub: 200, lineTotalRub: 200 });

    // Заказ #2: CONFIRMED
    const order2 = await this.orderRepo.save({
      user: testUser,
      timeSlot: slot2,
      status: OrderStatus.Confirmed,
      slotTimeFrom: '09:10:00',
      slotTimeTo: '09:20:00',
      totalRub: 210,
      confirmedAt: new Date(),
    });
    await this.itemRepo.save({ order: order2, productName: 'Латте', quantity: 1, sizeCode: 'M', unitPriceRub: 210, lineTotalRub: 210 });

    // Заказ #3: READY
    const order3 = await this.orderRepo.save({
      user: testUser,
      timeSlot: slot3,
      status: OrderStatus.Ready,
      slotTimeFrom: '09:20:00',
      slotTimeTo: '09:30:00',
      totalRub: 120,
      confirmedAt: new Date(),
      readyAt: new Date(),
    });
    await this.itemRepo.save({ order: order3, productName: 'Круассан', quantity: 1, sizeCode: null, unitPriceRub: 120, lineTotalRub: 120 });

    // Заказ #4: REJECTED (для истории заказов customer)
    const order4 = await this.orderRepo.save({
      user: testUser,
      timeSlot: slot1,
      status: OrderStatus.Rejected,
      slotTimeFrom: '09:00:00',
      slotTimeTo: '09:10:00',
      totalRub: 200,
      rejectReason: 'Нет ингредиентов',
    });
    await this.itemRepo.save({ order: order4, productName: 'Капучино', quantity: 1, sizeCode: 'M', unitPriceRub: 200, lineTotalRub: 200 });
  }
}
