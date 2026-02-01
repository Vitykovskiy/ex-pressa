import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductGroup } from './entities/product-group.entity';
import { Product } from './entities/product.entity';
import { ProductPrice } from './entities/product-price.entity';
import { AddonGroup } from './entities/addon-group.entity';
import { Addon } from './entities/addon.entity';
import { ProductGroupAddonGroup } from './entities/product-group-addon-group.entity';

@Injectable()
export class CatalogService {
  constructor(
    @InjectRepository(ProductGroup)
    private readonly productGroups: Repository<ProductGroup>,
    @InjectRepository(Product)
    private readonly products: Repository<Product>,
    @InjectRepository(ProductPrice)
    private readonly prices: Repository<ProductPrice>,
    @InjectRepository(AddonGroup)
    private readonly addonGroups: Repository<AddonGroup>,
    @InjectRepository(Addon)
    private readonly addons: Repository<Addon>,
    @InjectRepository(ProductGroupAddonGroup)
    private readonly groupAddonLinks: Repository<ProductGroupAddonGroup>,
  ) {}

  async createProductGroup(data: {
    name: string;
    sortOrder?: number;
    isActive?: boolean;
  }): Promise<ProductGroup> {
    const group = this.productGroups.create({
      name: data.name,
      sortOrder: data.sortOrder,
      isActive: data.isActive ?? true,
    });
    return this.productGroups.save(group);
  }

  async createProduct(data: {
    groupId: number;
    name: string;
    description?: string;
    type: Product['type'];
    isActive?: boolean;
    isAvailable?: boolean;
    sortOrder?: number;
  }): Promise<Product> {
    const group = await this.productGroups.findOne({
      where: { id: data.groupId },
    });
    if (!group) throw new NotFoundException('Группа продукта не найдена');

    const product = this.products.create({
      group,
      name: data.name,
      description: data.description,
      type: data.type,
      isActive: data.isActive ?? true,
      isAvailable: data.isAvailable ?? true,
      sortOrder: data.sortOrder,
    });
    return this.products.save(product);
  }

  async createProductPrice(data: {
    productId: number;
    sizeCode?: ProductPrice['sizeCode'] | null;
    priceRub?: number | null;
    isActive?: boolean;
  }): Promise<ProductPrice> {
    const product = await this.products.findOne({
      where: { id: data.productId },
    });
    if (!product) throw new NotFoundException('Продукт не найден');

    const price = this.prices.create({
      product,
      sizeCode: data.sizeCode ?? null,
      priceRub: data.priceRub ?? null,
      isActive: data.isActive ?? true,
    });
    return this.prices.save(price);
  }

  async createAddonGroup(data: {
    name: string;
    sortOrder?: number;
    isActive?: boolean;
  }): Promise<AddonGroup> {
    const group = this.addonGroups.create({
      name: data.name,
      sortOrder: data.sortOrder,
      isActive: data.isActive ?? true,
    });
    return this.addonGroups.save(group);
  }

  async createAddon(data: {
    addonGroupId: number;
    name: string;
    priceRub?: number;
    isActive?: boolean;
  }): Promise<Addon> {
    const addonGroup = await this.addonGroups.findOne({
      where: { id: data.addonGroupId },
    });
    if (!addonGroup) throw new NotFoundException('Группа аддонов не найдена');

    const addon = this.addons.create({
      addonGroup,
      name: data.name,
      priceRub: data.priceRub ?? 0,
      isActive: data.isActive ?? true,
    });
    return this.addons.save(addon);
  }

  async linkAddonGroupToProductGroup(data: {
    productGroupId: number;
    addonGroupId: number;
  }): Promise<ProductGroupAddonGroup> {
    const productGroup = await this.productGroups.findOne({
      where: { id: data.productGroupId },
    });
    if (!productGroup)
      throw new NotFoundException('Группа продукта не найдена');

    const addonGroup = await this.addonGroups.findOne({
      where: { id: data.addonGroupId },
    });
    if (!addonGroup) throw new NotFoundException('Группа аддонов не найдена');

    const link = this.groupAddonLinks.create({
      productGroupId: productGroup.id,
      addonGroupId: addonGroup.id,
      productGroup,
      addonGroup,
    });
    return this.groupAddonLinks.save(link);
  }

  async getCatalog(): Promise<ProductGroup[]> {
    return this.productGroups.find({
      relations: {
        products: { prices: true },
        addonLinks: { addonGroup: { addons: true } },
      },
      order: {
        sortOrder: 'ASC',
        products: { sortOrder: 'ASC' },
      },
    });
  }

  async getProductById(id: number): Promise<Product> {
    const product = await this.products.findOne({
      where: { id },
      relations: { group: true, prices: true },
    });
    if (!product) throw new NotFoundException('Позиция меню не найдена');
    return product;
  }
}
