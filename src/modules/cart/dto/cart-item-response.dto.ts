import type {
  CartItemSelectedOption,
  CartItemSize,
} from '../entities/cart-item.entity';

export interface CartItemResponseDto {
  id: number;
  menuItemId: number;
  groupId: number | null;
  name: string;
  price: number;
  quantity: number;
  size: CartItemSize | null;
  selectedOptions: CartItemSelectedOption[] | null;
  createdAt: string;
  updatedAt: string;
}
