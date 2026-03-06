import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';
import { DrinkSizeCode } from '../enums/drink-size-code.enum';

export class ProductPriceItemDto {
  @ApiPropertyOptional({ enum: DrinkSizeCode })
  @IsOptional()
  @IsEnum(DrinkSizeCode)
  sizeCode?: DrinkSizeCode;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  priceRub?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ReplaceProductPricesDto {
  @ApiProperty({ type: [ProductPriceItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductPriceItemDto)
  prices: ProductPriceItemDto[];
}
