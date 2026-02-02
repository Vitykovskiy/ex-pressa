import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { DrinkSizeCode } from '@modules/catalog';

export class AddCartItemAddonDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  addonId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  quantity: number;
}

export class AddCartItemDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  productId: number;

  @ApiPropertyOptional({ enum: DrinkSizeCode, example: 'M' })
  @IsOptional()
  @IsEnum(DrinkSizeCode)
  sizeCode?: DrinkSizeCode | null;

  @ApiProperty({ example: 2 })
  @IsInt()
  quantity: number;

  @ApiPropertyOptional({
    type: [AddCartItemAddonDto],
    example: [{ addonId: 3, quantity: 1 }],
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => AddCartItemAddonDto)
  addons?: AddCartItemAddonDto[];
}
