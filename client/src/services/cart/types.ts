import type { DrinkSizes } from "@/services/menu/types";

export interface CreateCartItemDto {
  id: number;
  quantity: number;
  size?: DrinkSizes | null;
  selectedOptions?: number[] | null;
}

export type UpdateCartItemDto = CreateCartItemDto;

export interface CartItemResponseDto {
  id: number;
  menuItemId: number;
  quantity: number;
  size: DrinkSizes | null;
  selectedOptions: number[] | null;
}
