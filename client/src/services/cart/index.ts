import { http } from "@/services/http";
import type {
  CartItemResponseDto,
  CreateCartItemDto,
  UpdateCartItemDto,
} from "./types";

const baseUrl = "/cart/items";

async function fetchCartItems(): Promise<CartItemResponseDto[]> {
  return http.get<CartItemResponseDto[]>(baseUrl);
}

async function createCartItem(
  payload: CreateCartItemDto
): Promise<CartItemResponseDto> {
  return http.post<CartItemResponseDto, CreateCartItemDto>(baseUrl, payload);
}

async function updateCartItem(
  cartItemId: number,
  payload: UpdateCartItemDto
): Promise<CartItemResponseDto> {
  return http.put<CartItemResponseDto, UpdateCartItemDto>(
    `${baseUrl}/${cartItemId}`,
    payload
  );
}

async function deleteCartItem(cartItemId: number): Promise<void> {
  return http.delete<void>(`${baseUrl}/${cartItemId}`);
}

export default {
  fetchCartItems,
  createCartItem,
  updateCartItem,
  deleteCartItem,
};
