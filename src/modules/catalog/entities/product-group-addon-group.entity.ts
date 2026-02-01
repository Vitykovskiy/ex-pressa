import { Entity, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ProductGroup } from './product-group.entity';
import { AddonGroup } from './addon-group.entity';

@Entity('product_group_addon_groups')
export class ProductGroupAddonGroup {
  @PrimaryColumn({ name: 'product_group_id', type: 'integer' })
  @ApiProperty({ example: 1 })
  productGroupId: number;

  @PrimaryColumn({ name: 'addon_group_id', type: 'integer' })
  @ApiProperty({ example: 4 })
  addonGroupId: number;

  @ManyToOne(() => ProductGroup, (group) => group.addonLinks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_group_id' })
  @ApiProperty({ type: () => ProductGroup, example: { id: 1, name: 'Кофе' } })
  productGroup: ProductGroup;

  @ManyToOne(() => AddonGroup, (group) => group.productGroupLinks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'addon_group_id' })
  @ApiProperty({ type: () => AddonGroup, example: { id: 4, name: 'Сиропы' } })
  addonGroup: AddonGroup;
}
