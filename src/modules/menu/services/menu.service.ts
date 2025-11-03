import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Menu } from '../entities/menu.entity';
import { MenuItem } from '../entities/menu-item.entity';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Menu) private readonly menus: Repository<Menu>,
    @InjectRepository(MenuItem) private readonly items: Repository<MenuItem>,
  ) {}

  async getActiveMenu(): Promise<Menu> {
    const now = new Date();

    const menu = await this.menus.findOne({
      where: [
        { validFrom: IsNull(), validTo: IsNull() },
        {
          validFrom: LessThanOrEqual(now),
          validTo: MoreThanOrEqual(now),
        },
      ],
      relations: ['items'],
      order: { id: 'DESC' },
    });

    if (!menu) throw new NotFoundException('No active menu');
    return menu;
  }

  async listItems(): Promise<MenuItem[]> {
    return this.items.find({
      where: { isAvailable: true },
      order: { position: 'ASC' },
    });
  }

  async findItemByName(name: string): Promise<MenuItem | null> {
    return this.items.findOne({ where: { name } });
  }
}
