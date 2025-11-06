import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Menu } from '../entities/menu.entity';
import { MenuItem } from '../entities/menu-item.entity';
import { AnyGroup, DrinkMenuItem, MenuMenuItem } from './types';

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

  async listItems(): Promise<AnyGroup[]> {
    const allMenuItems: MenuItem[] = await this.items.find({
      where: { available: true },
    });

    const groups = allMenuItems
      .filter(
        ({ type }) =>
          type === 'drinks_group' ||
          type === 'other_group' ||
          type === 'options_group',
      )
      .map((group) => {
        const items = allMenuItems
          .filter(({ parentKey }) => parentKey === group.key)
          .reduce((acc, item) => {
            switch (item.type) {
              case 'drink':
                const existedDrink = acc.find(
                  ({ name }) => item.name === name,
                ) as DrinkMenuItem;

                if (existedDrink) {
                  existedDrink.sizes.push({
                    size: item.size!,
                    price: item.price!,
                  });
                } else {
                  acc.push({
                    id: item.id,
                    name: item.name ?? '',
                    type: 'drink',
                    optionsGroupKey: item.optionsGroupKey,
                    description: item.description,
                    sizes: [{ size: item.size!, price: item.price! }],
                  });
                }
                break;

              case 'other':
                acc.push({
                  id: item.id,
                  name: item.name ?? '',
                  type: 'other',
                  optionsGroupKey: item.optionsGroupKey,
                  description: item.description,
                  price: item.price!,
                });
                break;

              case 'option':
                acc.push({
                  id: item.id,
                  name: item.name ?? '',
                  type: 'option',
                  description: item.description,
                  price: item.price ?? null,
                });
                break;
            }

            return acc;
          }, [] as MenuMenuItem[]);

        return {
          id: group.id,
          type: group.type,
          name: group.name,
          key: group.key,
          available: group.available,
          items,
        } as AnyGroup;
      });

    return groups;
  }

  async findItemByName(name: string): Promise<MenuItem | null> {
    return this.items.findOne({ where: { name } });
  }

  async findItemById(id: number): Promise<MenuItem> {
    const item = await this.items.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Menu item not found');
    return item;
  }

  async findMenuById(id: number): Promise<Menu> {
    const menu = await this.menus.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!menu) throw new NotFoundException('Menu not found');
    return menu;
  }

  async listMenus(): Promise<Menu[]> {
    return this.menus.find({ order: { id: 'DESC' } });
  }
}
