import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import { CreateProductGroupDto } from './dto/create-product-group.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateProductPriceDto } from './dto/create-product-price.dto';
import { CreateAddonGroupDto } from './dto/create-addon-group.dto';
import { CreateAddonDto } from './dto/create-addon.dto';
import { LinkAddonGroupDto } from './dto/link-addon-group.dto';

@ApiTags('Каталог')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get()
  @ApiOperation({ summary: 'Получить каталог (группы, позиции, цены, допы)' })
  async getCatalog(): Promise<
    import('./entities/product-group.entity').ProductGroup[]
  > {
    return this.catalog.getCatalog();
  }

  @Get('products/:id')
  @ApiOperation({ summary: 'Получить позицию меню по id' })
  async getProductById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<import('./entities/product.entity').Product> {
    return this.catalog.getProductById(id);
  }

  @Post('product-groups')
  @ApiOperation({ summary: 'Создать группу позиций меню' })
  createProductGroup(@Body() dto: CreateProductGroupDto) {
    return this.catalog.createProductGroup(dto);
  }

  @Post('products')
  @ApiOperation({ summary: 'Создать позицию меню' })
  createProduct(@Body() dto: CreateProductDto) {
    return this.catalog.createProduct(dto);
  }

  @Post('product-prices')
  @ApiOperation({ summary: 'Создать цену позиции меню' })
  createProductPrice(@Body() dto: CreateProductPriceDto) {
    return this.catalog.createProductPrice(dto);
  }

  @Post('addon-groups')
  @ApiOperation({ summary: 'Создать группу допов' })
  createAddonGroup(@Body() dto: CreateAddonGroupDto) {
    return this.catalog.createAddonGroup(dto);
  }

  @Post('addons')
  @ApiOperation({ summary: 'Создать доп' })
  createAddon(@Body() dto: CreateAddonDto) {
    return this.catalog.createAddon(dto);
  }

  @Post('addon-groups/link')
  @ApiOperation({ summary: 'Связать группу допов с группой позиций меню' })
  linkAddonGroup(@Body() dto: LinkAddonGroupDto) {
    return this.catalog.linkAddonGroupToProductGroup(dto);
  }
}
