import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsOptional } from 'class-validator';
import { DrinkSizeCode } from '../enums/drink-size-code.enum';

export class CreateProductPriceDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  productId: number;

  @ApiPropertyOptional({ enum: DrinkSizeCode, example: 'M' })
  @IsOptional()
  @IsEnum(DrinkSizeCode)
  sizeCode?: DrinkSizeCode | null;

  @ApiPropertyOptional({ example: 250 })
  @IsOptional()
  @IsInt()
  priceRub?: number | null;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
