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
    const payload = await this.buildCartItemState(dto);
    const cartItem = this.cartItemsRepository.create({
      ...payload,
      quantity: dto.quantity,
    });

    const saved = await this.cartItemsRepository.save(cartItem);
    return this.toResponseDto(saved);
  }

  async updateItem(
    cartItemId: number,
    dto: CreateCartItemDto,
  ): Promise<CartItemResponseDto> {
    const existing = await this.cartItemsRepository.findOne({
      where: { id: cartItemId },
    });
    if (!existing) {
      throw new NotFoundException('Позиция корзины не найдена');
    }

    const payload = await this.buildCartItemState(dto);
    const saved = await this.cartItemsRepository.save({
      ...existing,
      ...payload,
      quantity: dto.quantity,
    });

    return this.toResponseDto(saved);
  }

  async removeItem(cartItemId: number): Promise<void> {
    const result = await this.cartItemsRepository.delete(cartItemId);
    if (!result.affected) {
      throw new NotFoundException('Позиция корзины не найдена');
    }
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
      throw new NotFoundException('Позиция меню не найдена');
    }
    if (
      menuItem.type === 'drinks_group' ||
      menuItem.type === 'options_group' ||
      menuItem.type === 'other_group'
    ) {
      throw new BadRequestException('Группы нельзя добавлять в корзину');
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
        'Один или несколько выбранных вариантов не найдены',
      );
    }

    return optionIds.map((optionId) => {
      const option = optionEntities.find((entity) => entity.id === optionId);
      if (!option) {
        throw new NotFoundException(`Выбранный вариант  не найден`);
      }
      if (option.type !== 'option') {
        throw new BadRequestException(
          'В качестве опций можно выбирать только элементы типа option',
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
      throw new BadRequestException(
        'Выбранный размер не совпадает с размером позиции меню',
      );
    }

    return requestedSize ?? normalizedItemSize ?? null;
  }

  private async buildCartItemState(dto: CreateCartItemDto): Promise<{
    menuItemId: number;
    groupId: number | null;
    name: string;
    price: number;
    size: CartItemSize | null;
    selectedOptions: CartItemSelectedOption[] | null;
  }> {
    const menuItem = await this.findMenuItem(dto.id);
    const groupId = await this.resolveGroupId(menuItem.parentKey);
    const selectedOptions = await this.loadSelectedOptions(dto.selectedOptions);
    const unitPrice = this.calculateUnitPrice(menuItem.price, selectedOptions);

    return {
      menuItemId: menuItem.id,
      groupId,
      name: menuItem.name ?? '',
      price: unitPrice,
      size: this.resolveSize(menuItem.size, dto.size),
      selectedOptions,
    };
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
