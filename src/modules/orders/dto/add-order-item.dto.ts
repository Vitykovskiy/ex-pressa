import { IsInt, Min } from 'class-validator';

export class AddOrderItemDto {
  @IsInt()
  @Min(1)
  orderId: number;

  @IsInt()
  @Min(1)
  menuItemId: number;

  @IsInt()
  @Min(1)
  qty: number;
}
