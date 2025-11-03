import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Menu } from './menu.entity';

@Entity('menu_items')
export class MenuItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Menu, (menu) => menu.items, { onDelete: 'CASCADE' })
  menu: Menu;

  @Column({ length: 120 })
  name: string;

  @Column({ type: 'real' })
  price: number;

  @Column({ default: true })
  isAvailable: boolean;

  @Column({ type: 'int', nullable: true })
  position?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
