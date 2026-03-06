import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import { CreateProductGroupDto } from './dto/create-product-group.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateProductPriceDto } from './dto/create-product-price.dto';
import { CreateAddonGroupDto } from './dto/create-addon-group.dto';
import { CreateAddonDto } from './dto/create-addon.dto';
import { LinkAddonGroupDto } from './dto/link-addon-group.dto';
import { UpdateProductGroupDto } from './dto/update-product-group.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateAddonGroupDto } from './dto/update-addon-group.dto';
import { UpdateAddonDto } from './dto/update-addon.dto';
import { ReplaceProductPricesDto } from './dto/replace-product-prices.dto';
import { SetProductAvailabilityDto } from './dto/set-product-availability.dto';
import { ProductGroup } from './entities/product-group.entity';
import { Product } from './entities/product.entity';
import { ProductPrice } from './entities/product-price.entity';
import { AddonGroup } from './entities/addon-group.entity';
import { Addon } from './entities/addon.entity';
import { ProductGroupAddonGroup } from './entities/product-group-addon-group.entity';
import { Roles } from '@modules/auth/roles.decorator';

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
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Создать группу позиций меню' })
  @ApiOkResponse({ type: ProductGroup })
  createProductGroup(@Body() dto: CreateProductGroupDto) {
    return this.catalog.createProductGroup(dto);
  }

  @Patch('product-groups/:id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Обновить группу позиций меню' })
  @ApiOkResponse({ type: ProductGroup })
  updateProductGroup(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductGroupDto,
  ) {
    return this.catalog.updateProductGroup(id, dto);
  }

  @Delete('product-groups/:id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить группу позиций меню' })
  @ApiNoContentResponse()
  deleteProductGroup(@Param('id', ParseIntPipe) id: number) {
    return this.catalog.deleteProductGroup(id);
  }

  @Post('products')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Создать позицию меню' })
  @ApiOkResponse({ type: Product })
  createProduct(@Body() dto: CreateProductDto) {
    return this.catalog.createProduct(dto);
  }

  @Patch('products/:id/availability')
  @Roles('BARISTA', 'ADMIN')
  @ApiOperation({ summary: 'Переключить доступность позиции меню (бариста)' })
  @ApiOkResponse({ type: Product })
  setProductAvailability(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SetProductAvailabilityDto,
  ) {
    return this.catalog.setProductAvailability(id, dto.isAvailable);
  }

  @Patch('products/:id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Обновить позицию меню' })
  @ApiOkResponse({ type: Product })
  updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
  ) {
    return this.catalog.updateProduct(id, dto);
  }

  @Delete('products/:id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить позицию меню' })
  @ApiNoContentResponse()
  deleteProduct(@Param('id', ParseIntPipe) id: number) {
    return this.catalog.deleteProduct(id);
  }

  @Put('products/:id/prices')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Заменить цены позиции меню' })
  @ApiOkResponse({ type: ProductPrice, isArray: true })
  replaceProductPrices(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReplaceProductPricesDto,
  ) {
    return this.catalog.replaceProductPrices(id, dto);
  }

  @Post('product-prices')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Создать цену позиции меню' })
  @ApiOkResponse({ type: ProductPrice })
  createProductPrice(@Body() dto: CreateProductPriceDto) {
    return this.catalog.createProductPrice(dto);
  }

  @Post('addon-groups')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Создать группу допов' })
  @ApiOkResponse({ type: AddonGroup })
  createAddonGroup(@Body() dto: CreateAddonGroupDto) {
    return this.catalog.createAddonGroup(dto);
  }

  @Get('addon-groups')
  @ApiOperation({ summary: 'Получить группы допов' })
  @ApiOkResponse({ type: AddonGroup, isArray: true })
  getAddonGroups(): Promise<AddonGroup[]> {
    return this.catalog.getAddonGroups();
  }

  @Patch('addon-groups/:id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Обновить группу допов' })
  @ApiOkResponse({ type: AddonGroup })
  updateAddonGroup(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAddonGroupDto,
  ) {
    return this.catalog.updateAddonGroup(id, dto);
  }

  @Delete('addon-groups/:id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить группу допов' })
  @ApiNoContentResponse()
  deleteAddonGroup(@Param('id', ParseIntPipe) id: number) {
    return this.catalog.deleteAddonGroup(id);
  }

  @Post('addons')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Создать доп' })
  @ApiOkResponse({ type: Addon })
  createAddon(@Body() dto: CreateAddonDto) {
    return this.catalog.createAddon(dto);
  }

  @Patch('addons/:id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Обновить доп' })
  @ApiOkResponse({ type: Addon })
  updateAddon(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAddonDto,
  ) {
    return this.catalog.updateAddon(id, dto);
  }

  @Delete('addons/:id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить доп' })
  @ApiNoContentResponse()
  deleteAddon(@Param('id', ParseIntPipe) id: number) {
    return this.catalog.deleteAddon(id);
  }

  @Post('addon-groups/link')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Связать группу допов с группой позиций меню' })
  @ApiOkResponse({ type: ProductGroupAddonGroup })
  linkAddonGroup(@Body() dto: LinkAddonGroupDto) {
    return this.catalog.linkAddonGroupToProductGroup(dto);
  }
}
