import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogService } from './catalog.service';
import { CatalogController } from './catalog.controller';
import { ProductGroup } from './entities/product-group.entity';
import { Product } from './entities/product.entity';
import { ProductPrice } from './entities/product-price.entity';
import { AddonGroup } from './entities/addon-group.entity';
import { Addon } from './entities/addon.entity';
import { ProductGroupAddonGroup } from './entities/product-group-addon-group.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductGroup,
      Product,
      ProductPrice,
      AddonGroup,
      Addon,
      ProductGroupAddonGroup,
    ]),
  ],
  providers: [CatalogService],
  controllers: [CatalogController],
  exports: [CatalogService],
})
export class CatalogModule {}
