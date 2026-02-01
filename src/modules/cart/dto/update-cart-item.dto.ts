import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class UpdateCartItemDto {
  @ApiProperty({ example: 2 })
  @IsInt()
  quantity: number;
}
