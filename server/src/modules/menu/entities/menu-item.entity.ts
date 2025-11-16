import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Menu } from './menu.entity';

export type MenuItemType =
  | 'drinks_group'
  | 'options_group'
  | 'other_group'
  | 'drink'
  | 'option'
  | 'other'
  | null;

@Entity('menu_items')
export class MenuItem {
  @ApiProperty({ example: 101 })
  @PrimaryColumn({ type: 'integer' })
  id: number;

  @ApiProperty({ type: () => Menu })
  @ManyToOne(() => Menu, (menu) => menu.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'menu_id' })
  menu: Menu;

  @ApiProperty({ example: 'DRINKS_GROUP_1', nullable: true, required: false })
  @Column({ name: 'key', type: 'varchar', length: 64, nullable: true })
  key: string | null;

  @ApiProperty({ example: 'GROUP_PARENT', nullable: true, required: false })
  @Column({ name: 'parent_key', type: 'varchar', length: 64, nullable: true })
  parentKey: string | null;

  @ApiProperty({
    enum: [
      'drinks_group',
      'options_group',
      'other_group',
      'drink',
      'option',
      'other',
      null,
    ],
    nullable: true,
    required: false,
  })
  @Column({ name: 'type', type: 'varchar', length: 16, nullable: true })
  type: MenuItemType;

  @ApiProperty({ nullable: true, required: false, example: 'OPTIONS_GROUP_1' })
  @Column({
    name: 'options_group_key',
    type: 'varchar',
    length: 64,
    nullable: true,
  })
  optionsGroupKey: string | null;

  @ApiProperty({ example: 'Cappuccino', nullable: true, required: false })
  @Column({ name: 'name', type: 'varchar', length: 255, nullable: true })
  name: string | null;

  @ApiProperty({ example: 'M', nullable: true, required: false })
  @Column({ name: 'size', type: 'varchar', length: 8, nullable: true })
  size: string | null;

  @ApiProperty({ type: Number, required: false, nullable: true, example: 4.5 })
  @Column({ name: 'price', type: 'real', nullable: true })
  price: number | null;

  @ApiProperty({
    required: false,
    nullable: true,
    example: 'Rich espresso with milk',
  })
  @Column({ name: 'description', type: 'text', nullable: true })
  description: string | null;

  @ApiProperty({ example: true })
  @Column({ name: 'available', type: 'boolean', default: true })
  available: boolean;
}
