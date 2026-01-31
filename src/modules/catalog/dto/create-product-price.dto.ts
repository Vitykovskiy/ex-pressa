import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { DrinkSizeCode } from '../enums/drink-size-code.enum';

export class CreateProductPriceDto {
  @IsString()
  productId: string;

  @IsOptional()
  @IsEnum(DrinkSizeCode)
  sizeCode?: DrinkSizeCode | null;

  @IsOptional()
  @IsInt()
  priceRub?: number | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
