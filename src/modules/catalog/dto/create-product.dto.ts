import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { ProductType } from '../enums/product-type.enum';

export class CreateProductDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  groupId: number;

  @ApiProperty({ example: 'Капучино' })
  @IsString()
  @Length(1, 200)
  name: string;

  @ApiPropertyOptional({ example: 'Классический капучино' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ProductType, example: 'DRINK' })
  @IsEnum(ProductType)
  type: ProductType;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
