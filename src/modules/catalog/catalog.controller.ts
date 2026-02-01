import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import { CreateProductGroupDto } from './dto/create-product-group.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateProductPriceDto } from './dto/create-product-price.dto';
import { CreateAddonGroupDto } from './dto/create-addon-group.dto';
import { CreateAddonDto } from './dto/create-addon.dto';
import { LinkAddonGroupDto } from './dto/link-addon-group.dto';
import { ProductGroup } from './entities/product-group.entity';
import { Product } from './entities/product.entity';
import { ProductPrice } from './entities/product-price.entity';
import { AddonGroup } from './entities/addon-group.entity';
import { Addon } from './entities/addon.entity';
import { ProductGroupAddonGroup } from './entities/product-group-addon-group.entity';

@ApiTags('Каталог')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get()
  @ApiOperation({ summary: 'Получить каталог (группы, позиции, цены, допы)' })
  @ApiOkResponse({ type: ProductGroup, isArray: true })
  async getCatalog(): Promise<
    import('./entities/product-group.entity').ProductGroup[]
  > {
    return this.catalog.getCatalog();
  }

  @Get('products/:id')
  @ApiOperation({ summary: 'Получить позицию меню по id' })
  @ApiOkResponse({ type: Product })
  async getProductById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<import('./entities/product.entity').Product> {
    return this.catalog.getProductById(id);
  }

  @Post('product-groups')
  @ApiOperation({ summary: 'Создать группу позиций меню' })
  @ApiOkResponse({ type: ProductGroup })
  createProductGroup(@Body() dto: CreateProductGroupDto) {
    return this.catalog.createProductGroup(dto);
  }

  @Post('products')
  @ApiOperation({ summary: 'Создать позицию меню' })
  @ApiOkResponse({ type: Product })
  createProduct(@Body() dto: CreateProductDto) {
    return this.catalog.createProduct(dto);
  }

  @Post('product-prices')
  @ApiOperation({ summary: 'Создать цену позиции меню' })
  @ApiOkResponse({ type: ProductPrice })
  createProductPrice(@Body() dto: CreateProductPriceDto) {
    return this.catalog.createProductPrice(dto);
  }

  @Post('addon-groups')
  @ApiOperation({ summary: 'Создать группу допов' })
  @ApiOkResponse({ type: AddonGroup })
  createAddonGroup(@Body() dto: CreateAddonGroupDto) {
    return this.catalog.createAddonGroup(dto);
  }

  @Post('addons')
  @ApiOperation({ summary: 'Создать доп' })
  @ApiOkResponse({ type: Addon })
  createAddon(@Body() dto: CreateAddonDto) {
    return this.catalog.createAddon(dto);
  }

  @Post('addon-groups/link')
  @ApiOperation({ summary: 'Связать группу допов с группой позиций меню' })
  @ApiOkResponse({ type: ProductGroupAddonGroup })
  linkAddonGroup(@Body() dto: LinkAddonGroupDto) {
    return this.catalog.linkAddonGroupToProductGroup(dto);
  }
}
