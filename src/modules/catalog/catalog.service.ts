import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductGroup } from './entities/product-group.entity';
import { Product } from './entities/product.entity';
import { ProductPrice } from './entities/product-price.entity';
import { AddonGroup } from './entities/addon-group.entity';
import { Addon } from './entities/addon.entity';
import { ProductGroupAddonGroup } from './entities/product-group-addon-group.entity';
import { UpdateProductGroupDto } from './dto/update-product-group.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateAddonGroupDto } from './dto/update-addon-group.dto';
import { UpdateAddonDto } from './dto/update-addon.dto';
import { ReplaceProductPricesDto } from './dto/replace-product-prices.dto';

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

  async setProductAvailability(
    id: number,
    isAvailable: boolean,
  ): Promise<Product> {
    const product = await this.products.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Позиция меню не найдена');
    product.isAvailable = isAvailable;
    return this.products.save(product);
  }

  async updateProductGroup(
    id: number,
    dto: UpdateProductGroupDto,
  ): Promise<ProductGroup> {
    const group = await this.productGroups.findOne({ where: { id } });
    if (!group) throw new NotFoundException('Группа продукта не найдена');
    Object.assign(group, dto);
    return this.productGroups.save(group);
  }

  async deleteProductGroup(id: number): Promise<void> {
    const group = await this.productGroups.findOne({ where: { id } });
    if (!group) throw new NotFoundException('Группа продукта не найдена');
    await this.productGroups.remove(group);
  }

  async updateProduct(id: number, dto: UpdateProductDto): Promise<Product> {
    const product = await this.products.findOne({
      where: { id },
      relations: { group: true },
    });
    if (!product) throw new NotFoundException('Позиция меню не найдена');

    if (dto.groupId !== undefined) {
      const group = await this.productGroups.findOne({
        where: { id: dto.groupId },
      });
      if (!group) throw new NotFoundException('Группа продукта не найдена');
      product.group = group;
    }

    const { groupId: _, ...rest } = dto;
    Object.assign(product, rest);
    return this.products.save(product);
  }

  async deleteProduct(id: number): Promise<void> {
    const product = await this.products.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Позиция меню не найдена');
    await this.products.remove(product);
  }

  async replaceProductPrices(
    productId: number,
    dto: ReplaceProductPricesDto,
  ): Promise<ProductPrice[]> {
    const product = await this.products.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Позиция меню не найдена');

    await this.prices.delete({ product: { id: productId } });

    const newPrices = dto.prices.map((p) =>
      this.prices.create({
        product,
        sizeCode: p.sizeCode ?? null,
        priceRub: p.priceRub ?? null,
        isActive: p.isActive ?? true,
      }),
    );
    return this.prices.save(newPrices);
  }

  async updateAddonGroup(
    id: number,
    dto: UpdateAddonGroupDto,
  ): Promise<AddonGroup> {
    const group = await this.addonGroups.findOne({ where: { id } });
    if (!group) throw new NotFoundException('Группа аддонов не найдена');
    Object.assign(group, dto);
    return this.addonGroups.save(group);
  }

  async deleteAddonGroup(id: number): Promise<void> {
    const group = await this.addonGroups.findOne({ where: { id } });
    if (!group) throw new NotFoundException('Группа аддонов не найдена');
    await this.addonGroups.remove(group);
  }

  async updateAddon(id: number, dto: UpdateAddonDto): Promise<Addon> {
    const addon = await this.addons.findOne({ where: { id } });
    if (!addon) throw new NotFoundException('Аддон не найден');
    Object.assign(addon, dto);
    return this.addons.save(addon);
  }

  async deleteAddon(id: number): Promise<void> {
    const addon = await this.addons.findOne({ where: { id } });
    if (!addon) throw new NotFoundException('Аддон не найден');
    await this.addons.remove(addon);
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

  async getAddonGroups(): Promise<AddonGroup[]> {
    return this.addonGroups.find({
      relations: {
        addons: true,
      },
      order: {
        sortOrder: 'ASC',
        addons: { name: 'ASC' },
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
