import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Addon } from './addon.entity';
import { ProductGroupAddonGroup } from './product-group-addon-group.entity';

@Entity('addon_groups')
export class AddonGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 120 })
  name: string;

  @Column({ name: 'sort_order', type: 'integer', nullable: true })
  sortOrder?: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => Addon, (addon) => addon.addonGroup)
  addons: Addon[];

  @OneToMany(() => ProductGroupAddonGroup, (link) => link.addonGroup)
  productGroupLinks: ProductGroupAddonGroup[];
}
