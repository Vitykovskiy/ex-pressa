import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateAddonDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  addonGroupId: number;

  @ApiProperty({ example: 'Сироп ваниль' })
  @IsString()
  @Length(1, 120)
  name: string;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsInt()
  priceRub?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
