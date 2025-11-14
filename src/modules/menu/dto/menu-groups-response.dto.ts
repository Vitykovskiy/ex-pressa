import { ApiProperty } from '@nestjs/swagger';

export class MenuGroupItemSizeDto {
  @ApiProperty({ example: 'M' })
  size: string;

  @ApiProperty({ example: 4.5 })
  price: number;
}

export class MenuGroupItemDto {
  @ApiProperty({ example: 101 })
  id: number;

  @ApiProperty({ example: 'Americano' })
  name: string;

  @ApiProperty({ required: false, nullable: true, example: 'Freshly brewed espresso with water' })
  description: string | null;

  @ApiProperty({ enum: ['drink', 'option', 'other'] })
  type: 'drink' | 'option' | 'other';

  @ApiProperty({ required: false, nullable: true, example: 'OPTIONS_GROUP_1' })
  optionsGroupKey?: string | null;

  @ApiProperty({ required: false, nullable: true, example: 3.0 })
  price?: number | null;

  @ApiProperty({ required: false, type: () => [MenuGroupItemSizeDto] })
  sizes?: MenuGroupItemSizeDto[];
}

export class MenuGroupResponseDto {
  @ApiProperty({ example: 10 })
  id: number;

  @ApiProperty({ example: 'DRINKS_HOT' })
  key: string;

  @ApiProperty({ example: 'Hot drinks' })
  name: string;

  @ApiProperty({ enum: ['drinks_group', 'options_group', 'other_group'] })
  type: 'drinks_group' | 'options_group' | 'other_group';

  @ApiProperty({ example: true })
  available: boolean;

  @ApiProperty({ type: () => [MenuGroupItemDto] })
  items: MenuGroupItemDto[];
}
