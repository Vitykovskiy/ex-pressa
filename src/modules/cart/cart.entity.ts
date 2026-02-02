import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '@modules/users';
import { CartItem } from './cart-item.entity';

@Entity('carts')
export class Cart {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 2 })
  id: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  @ApiProperty({
    type: () => User,
    example: { id: 7, name: 'Алексей' },
  })
  user: User;

  @OneToMany(() => CartItem, (item) => item.cart, { cascade: true })
  @ApiProperty({
    type: () => [CartItem],
    example: [{ id: 10, productName: 'Латте', quantity: 2 }],
  })
  items: CartItem[];

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty({ example: '2026-02-01T08:30:00.000Z' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @ApiProperty({ example: '2026-02-01T08:35:00.000Z' })
  updatedAt: Date;
}
