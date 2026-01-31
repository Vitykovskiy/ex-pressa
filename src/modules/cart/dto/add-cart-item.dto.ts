import {
  IsEnum,
  IsInt,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DrinkSizeCode } from '../../catalog/enums/drink-size-code.enum';

export class AddCartItemAddonDto {
  @IsUUID()
  addonId: string;

  @IsInt()
  quantity: number;
}

export class AddCartItemDto {
  @IsUUID()
  productId: string;

  @IsOptional()
  @IsEnum(DrinkSizeCode)
  sizeCode?: DrinkSizeCode | null;

  @IsInt()
  quantity: number;

  @IsOptional()
  @ValidateNested({ each: true })
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @Type(() => AddCartItemAddonDto)
  addons?: AddCartItemAddonDto[];
}
