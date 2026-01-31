import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Menu } from './menu.entity';
import { MenuItemType } from '../services/types';

@Entity('menu_items')
export class MenuItem {
  @PrimaryColumn({ type: 'integer' })
  id: number;

  @ManyToOne(() => Menu, (menu) => menu.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'menu_id' })
  menu: Menu;

  @Column({ name: 'key', type: 'varchar', length: 64, nullable: true })
  key: string | null;

  // parent_key: ключ родительской группы / options_group
  @Column({ name: 'parent_key', type: 'varchar', length: 64, nullable: true })
  parentKey: string | null;

  @Column({ name: 'type', type: 'varchar', length: 16, nullable: true })
  type: MenuItemType | null;

  @Column({
    name: 'options_group_key',
    type: 'varchar',
    length: 64,
    nullable: true,
  })
  optionsGroupKey: string | null;

  @Column({ name: 'name', type: 'varchar', length: 255, nullable: true })
  name: string | null;

  @Column({ name: 'size', type: 'varchar', length: 8, nullable: true })
  size: string | null;

  @Column({ name: 'price', type: 'real', nullable: true })
  price: number | null;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'available', type: 'boolean', default: true })
  available: boolean;
}
