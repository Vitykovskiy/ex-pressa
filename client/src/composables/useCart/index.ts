import cartService from "@/services/cart";
import type {
  CartItemResponseDto,
  CreateCartItemDto,
  UpdateCartItemDto,
} from "@/services/cart/types";
import { useMenu } from "@/composables/useMenu";
import type { HttpError } from "@/services/http";
import {
  isDrinkItem,
  type MenuItem,
  type OptionMenuItem,
} from "@/services/menu/types";
import { ref } from "vue";
import type { CartSelectedOption, ICartItem } from "./types";

const cart = ref<ICartItem[]>([]);
let isCartInitialized = false;

const { menu, options } = useMenu();

export function useCart() {
  async function fetchCart(): Promise<void> {
    try {
      const data = await cartService.fetchCartItems();
      cart.value = data.map((item) => normalizeCartItem(item));
      console.log("cart.value", cart.value);
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async function addToCart(dto: CreateCartItemDto): Promise<void> {
    try {
      const createdItem = await cartService.createCartItem(dto);

      cart.value.push(normalizeCartItem(createdItem));
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async function editCartItem(
    id: number,
    payload: UpdateCartItemDto
  ): Promise<void> {
    try {
      const updatedItemDto = await cartService.updateCartItem(id, payload);
      const updatedItem = normalizeCartItem(updatedItemDto);
      const currentItem = cart.value.find(({ id }) => id === updatedItem.id);

      if (!currentItem) {
        console.error("Ошибка обновления позиции в корзине:", currentItem);
        return;
      }

      Object.assign(currentItem, updatedItem);
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  async function removeCartItem(id: number): Promise<void> {
    try {
      await cartService.deleteCartItem(id);
      cart.value = cart.value.filter((item) => item.id === id);
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  if (!isCartInitialized) {
    isCartInitialized = true;
    fetchCart().catch(() => undefined);
  }

  return { cart, fetchCart, addToCart, editCartItem, removeCartItem };
}

function normalizeCartItem(item: CartItemResponseDto): ICartItem {
  const menuItem = findMenuItem(item.menuItemId);

  if (!menuItem) {
    throw Error(`Позиция с id ${item.menuItemId} в меню не найдена`);
  }
  const selectedOptions = resolveSelectedOptions(item.selectedOptions);

  const price = calculateItemPrice(menuItem, item.size, selectedOptions);

  return {
    id: item.id,
    menuItemId: item.menuItemId,
    name: menuItem.name,
    price,
    quantity: item.quantity,
    size: item.size ?? undefined,
    selectedOptions,
  };
}

function findMenuItem(menuItemId: number): MenuItem | null {
  for (const group of menu.value) {
    const item = group.items.find((groupItem) => groupItem.id === menuItemId);
    return item ?? null;
  }

  return null;
}

function resolveSelectedOptions(
  selectedOptionIds: number[] | null
): CartSelectedOption[] {
  if (!selectedOptionIds?.length) return [];

  return selectedOptionIds
    .map((id) => {
      const option = findOptionById(id);
      if (!option) return;
      return {
        id: option.id,
        name: option.name,
        price: option.price,
      };
    })
    .filter((value) => value !== undefined);
}

function findOptionById(id: number): OptionMenuItem | null {
  for (const group of options.value) {
    const option = group.items.find((item) => item.id === id);
    if (option) return option;
  }

  return null;
}

function calculateItemPrice(
  menuItem: MenuItem,
  size?: string | null,
  selectedOptions?: CartSelectedOption[]
): number {
  const optionsPrice = (selectedOptions ?? []).reduce(
    (acc, option) => acc + (option.price ?? 0),
    0
  );

  const basePrice = getMenuItemBasePrice(menuItem, size);
  if (basePrice == null) {
    return optionsPrice;
  }

  return basePrice + optionsPrice;
}

function getMenuItemBasePrice(
  menuItem: MenuItem,
  size: string | null | undefined
): number | null {
  if (isDrinkItem(menuItem)) {
    const sizeItem = size
      ? menuItem.sizes.find((variant) => variant.size === size)
      : menuItem.sizes[0];
    return sizeItem?.price ?? null;
  }

  if (typeof (menuItem as OptionMenuItem).price === "number") {
    return (menuItem as OptionMenuItem).price as number;
  }

  return null;
}

function handleError(error: unknown): void {
  const err = error as HttpError;
  console.error(err?.message ?? error);
}
