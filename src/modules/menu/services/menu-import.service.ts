// src/modules/menu/services/menu-import.service.ts
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu } from '../entities/menu.entity';
import { parseMenuExcel } from '../utils/parseMenuExcel';
import { MenuItem } from '../entities/menu-item.entity';

@Injectable()
export class MenuImportService {
  private readonly logger = new Logger(MenuImportService.name);

  constructor(
    @InjectRepository(Menu) private readonly menus: Repository<Menu>,
    @InjectRepository(MenuItem)
    private readonly entries: Repository<MenuItem>,
  ) {}

  async importFromBuffer(buffer: Buffer): Promise<Menu> {
    const parsed = parseMenuExcel(buffer); // ParsedMenuRow[]

    if (!parsed.length) {
      throw new BadRequestException('Файл пуст или содержит неверные данные.');
    }

    const now = new Date();

    const items = parsed.map((row) =>
      this.entries.create({
        id: row.id,
        key: row.key,
        parentKey: row.parentKey,
        type: row.type,
        optionsGroupKey: row.optionsGroupKey,
        name: row.name,
        size: row.size,
        price: row.price,
        description: row.description,
        available: row.available,
      } as Partial<MenuItem>),
    );

    const menu = this.menus.create({
      title: `Импорт ${now.toLocaleString('ru-RU')}`,
      validFrom: now,
      items,
    });

    const saved = await this.menus.save(menu);
    this.logger.log(
      `Импортировано ${parsed.length} записей в меню #${saved.id}`,
    );
    return saved;
  }
}
