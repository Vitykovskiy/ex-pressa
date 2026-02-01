import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class LinkAddonGroupDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  productGroupId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  addonGroupId: number;
}
