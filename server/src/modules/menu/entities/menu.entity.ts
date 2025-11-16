import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { MenuItem } from './menu-item.entity';

@Entity('menus')
export class Menu {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Main drinks menu' })
  @Column({ length: 120 })
  title: string;

  @ApiProperty({
    type: String,
    format: 'date-time',
    required: false,
    nullable: true,
    description: 'Datetime when the menu becomes active',
  })
  @Column({ type: 'datetime', nullable: true })
  validFrom?: Date;

  @ApiProperty({
    type: String,
    format: 'date-time',
    required: false,
    nullable: true,
    description: 'Datetime when the menu stops being active',
  })
  @Column({ type: 'datetime', nullable: true })
  validTo?: Date;

  @ApiProperty({
    type: () => [MenuItem],
    description: 'Items included in the menu (loaded only in specific endpoints)',
    required: false,
  })
  @OneToMany(() => MenuItem, (item) => item.menu, { cascade: true })
  items: MenuItem[];

  @ApiProperty({ type: String, format: 'date-time' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
