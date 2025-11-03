import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu } from '../entities/menu.entity';
import { MenuItem } from '../entities/menu-item.entity';
import { parseMenuExcel } from '../utils/parseMenuExcel';

@Injectable()
export class MenuImportService {
  private readonly logger = new Logger(MenuImportService.name);

  constructor(
    @InjectRepository(Menu) private readonly menus: Repository<Menu>,
    @InjectRepository(MenuItem) private readonly items: Repository<MenuItem>,
  ) {}

  async importFromBuffer(buffer: Buffer): Promise<Menu> {
    const parsed = parseMenuExcel(buffer);

    if (!parsed.length) {
      throw new BadRequestException('Файл пуст или содержит неверные данные.');
    }

    const menu = this.menus.create({
      title: `Импорт ${new Date().toLocaleString('ru-RU')}`,
      validFrom: new Date(),
      items: parsed.map((r) =>
        this.items.create({
          name: r.name,
          price: r.price,
          isAvailable: r.isAvailable,
          position: r.position,
        }),
      ),
    });

    const saved = await this.menus.save(menu);
    this.logger.log(
      `Импортировано ${parsed.length} позиций в меню #${saved.id}`,
    );
    return saved;
  }
}
