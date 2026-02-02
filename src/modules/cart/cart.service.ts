import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './cart.entity';
import { CartItem } from './cart-item.entity';
import { CartItemAddon } from './cart-item-addon.entity';
import { User } from '@modules/users';

import { AddCartItemDto } from './dto/add-cart-item.dto';
import { Product, Addon } from '@modules/catalog';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly carts: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly items: Repository<CartItem>,
    @InjectRepository(CartItemAddon)
    private readonly itemAddons: Repository<CartItemAddon>,
    @InjectRepository(User)
    private readonly users: Repository<User>,
    @InjectRepository(Product)
    private readonly products: Repository<Product>,
    @InjectRepository(Addon)
    private readonly addons: Repository<Addon>,
  ) {}

  async getCartByUserId(userId: number): Promise<Cart> {
    let cart = await this.carts.findOne({
      where: { user: { id: userId } },
      relations: {
        user: true,
        items: { product: true, addons: { addon: true } },
      },
    });

    if (!cart) {
      const user = await this.users.findOne({ where: { id: userId } });
      if (!user) throw new NotFoundException('Пользователь не найден');
      cart = this.carts.create({ user, items: [] });
      cart = await this.carts.save(cart);
    }

    return cart;
  }

  async addItem(userId: number, dto: AddCartItemDto): Promise<Cart> {
    const cart = await this.getCartByUserId(userId);

    const product = await this.products.findOne({
      where: { id: dto.productId },
    });
    if (!product) throw new NotFoundException('Позиция меню не найдена');

    const item = this.items.create({
      cart,
      product,
      productName: product.name,
      sizeCode: dto.sizeCode ?? null,
      quantity: dto.quantity,
    });

    const savedItem = await this.items.save(item);

    if (dto.addons?.length) {
      const addonEntities: CartItemAddon[] = [];
      for (const addonDto of dto.addons) {
        const addon = await this.addons.findOne({
          where: { id: addonDto.addonId },
        });
        if (!addon) throw new NotFoundException('Доп не найден');
        addonEntities.push(
          this.itemAddons.create({
            cartItem: savedItem,
            addon,
            addonName: addon.name,
            quantity: addonDto.quantity,
          }),
        );
      }
      await this.itemAddons.save(addonEntities);
    }

    return this.getCartByUserId(userId);
  }

  async updateItemQuantity(itemId: number, quantity: number): Promise<Cart> {
    const item = await this.items.findOne({
      where: { id: itemId },
      relations: { cart: { user: true } },
    });
    if (!item) throw new NotFoundException('Позиция корзины не найдена');

    item.quantity = quantity;
    await this.items.save(item);
    return this.getCartByUserId(item.cart.user.id);
  }

  async removeItem(itemId: number): Promise<Cart> {
    const item = await this.items.findOne({
      where: { id: itemId },
      relations: { cart: { user: true } },
    });
    if (!item) throw new NotFoundException('Позиция корзины не найдена');

    await this.items.remove(item);
    return this.getCartByUserId(item.cart.user.id);
  }

  async clearCart(userId: number): Promise<Cart> {
    const cart = await this.getCartByUserId(userId);
    if (cart.items?.length) {
      await this.items.remove(cart.items);
    }
    return this.getCartByUserId(userId);
  }
}
