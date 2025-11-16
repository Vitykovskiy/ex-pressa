import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type CartItemSize = 's' | 'm' | 'l';

export interface CartItemSelectedOption {
  id: number;
  name: string;
  price: number | null;
  type: 'drink' | 'other' | 'option' | null;
  description: string | null;
}

@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'menu_item_id', type: 'integer' })
  menuItemId: number;

  @Column({ name: 'group_id', type: 'integer', nullable: true })
  groupId: number | null;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'real' })
  price: number;

  @Column({ type: 'integer' })
  quantity: number;

  @Column({ type: 'varchar', length: 8, nullable: true })
  size: CartItemSize | null;

  @Column({ name: 'selected_options', type: 'simple-json', nullable: true })
  selectedOptions: CartItemSelectedOption[] | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
