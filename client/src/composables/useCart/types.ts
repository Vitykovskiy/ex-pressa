import type { DrinkSizes, OptionMenuItem } from "@/services/menu/types";

export interface ICartItem {
  id: number;
  menuItemId: number;
  name: string;
  price: number;
  quantity: number;
  size?: DrinkSizes | null;
  selectedOptions?: CartSelectedOption[];
}

export type CartSelectedOption = Pick<OptionMenuItem, "id" | "name" | "price">;
