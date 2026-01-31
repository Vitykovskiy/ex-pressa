import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateAddonDto {
  @IsString()
  addonGroupId: string;

  @IsString()
  @Length(1, 120)
  name: string;

  @IsOptional()
  @IsInt()
  priceRub?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
