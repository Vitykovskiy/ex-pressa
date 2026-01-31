import { Entity, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { ProductGroup } from './product-group.entity';
import { AddonGroup } from './addon-group.entity';

@Entity('product_group_addon_groups')
export class ProductGroupAddonGroup {
  @PrimaryColumn({ name: 'product_group_id', type: 'uuid' })
  productGroupId: string;

  @PrimaryColumn({ name: 'addon_group_id', type: 'uuid' })
  addonGroupId: string;

  @ManyToOne(() => ProductGroup, (group) => group.addonLinks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_group_id' })
  productGroup: ProductGroup;

  @ManyToOne(() => AddonGroup, (group) => group.productGroupLinks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'addon_group_id' })
  addonGroup: AddonGroup;
}
