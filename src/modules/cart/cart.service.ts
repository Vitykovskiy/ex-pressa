import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CartItem } from './entities/cart-item.entity';
import type {
  CartItemSelectedOption,
  CartItemSize,
} from './entities/cart-item.entity';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import type { CartItemResponseDto } from './dto/cart-item-response.dto';
import { MenuItem } from '../menu/entities/menu-item.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartItemsRepository: Repository<CartItem>,
    @InjectRepository(MenuItem)
    private readonly menuItemsRepository: Repository<MenuItem>,
  ) {}

  async createItem(dto: CreateCartItemDto): Promise<CartItemResponseDto> {
    const menuItem = await this.findMenuItem(dto.id);
    const groupId = await this.resolveGroupId(menuItem.parentKey);
    const selectedOptions = await this.loadSelectedOptions(dto.selectedOptions);
    const unitPrice = this.calculateUnitPrice(menuItem.price, selectedOptions);

    const cartItem = this.cartItemsRepository.create({
      menuItemId: menuItem.id,
      groupId,
      name: menuItem.name ?? '',
      price: unitPrice,
      quantity: dto.quantity,
      size: this.resolveSize(menuItem.size, dto.size),
      selectedOptions,
    });

    const saved = await this.cartItemsRepository.save(cartItem);
    return this.toResponseDto(saved);
  }

  async listItems(): Promise<CartItemResponseDto[]> {
    const items = await this.cartItemsRepository.find({
      order: { createdAt: 'ASC' },
    });
    return items.map((item) => this.toResponseDto(item));
  }

  async clear(): Promise<void> {
    await this.cartItemsRepository.clear();
  }

  private async findMenuItem(id: number): Promise<MenuItem> {
    const menuItem = await this.menuItemsRepository.findOne({ where: { id } });
    if (!menuItem) {
      throw new NotFoundException('Menu item not found');
    }
    if (
      menuItem.type === 'drinks_group' ||
      menuItem.type === 'options_group' ||
      menuItem.type === 'other_group'
    ) {
      throw new BadRequestException('Groups cannot be added to cart');
    }
    return menuItem;
  }

  private async resolveGroupId(
    parentKey: string | null,
  ): Promise<number | null> {
    if (!parentKey) return null;
    const group = await this.menuItemsRepository.findOne({
      where: { key: parentKey },
    });
    return group?.id ?? null;
  }

  private async loadSelectedOptions(
    optionIds?: number[],
  ): Promise<CartItemSelectedOption[] | null> {
    if (!optionIds || optionIds.length === 0) return null;

    const uniqueIds = Array.from(new Set(optionIds));
    const optionEntities = await this.menuItemsRepository.find({
      where: { id: In(uniqueIds) },
    });

    if (optionEntities.length !== uniqueIds.length) {
      throw new NotFoundException(
        'One or more selected options were not found',
      );
    }

    return optionIds.map((optionId) => {
      const option = optionEntities.find((entity) => entity.id === optionId);
      if (!option) {
        throw new NotFoundException(`Selected option ${optionId} not found`);
      }
      if (option.type !== 'option') {
        throw new BadRequestException(
          'Only option items can be used as selected options',
        );
      }

      return {
        id: option.id,
        name: option.name ?? '',
        description: option.description ?? null,
        price: option.price ?? null,
        type: option.type,
      } satisfies CartItemSelectedOption;
    });
  }

  private calculateUnitPrice(
    itemPrice: number | null,
    options: CartItemSelectedOption[] | null,
  ): number {
    const optionTotal =
      options?.reduce((sum, option) => sum + (option.price ?? 0), 0) ?? 0;
    return (itemPrice ?? 0) + optionTotal;
  }

  private resolveSize(
    menuItemSize: string | null,
    requestedSize?: CartItemSize,
  ): CartItemSize | null {
    const normalizedItemSize = (menuItemSize as CartItemSize | null) ?? null;
    if (
      normalizedItemSize &&
      requestedSize &&
      normalizedItemSize !== requestedSize
    ) {
      throw new BadRequestException('Selected size does not match menu item');
    }

    return requestedSize ?? normalizedItemSize ?? null;
  }

  private toResponseDto(item: CartItem): CartItemResponseDto {
    return {
      id: item.id,
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      size: item.size,
      selectedOptions: item.selectedOptions
        ? item.selectedOptions.map((option) => option.id)
        : null,
    };
  }
}

