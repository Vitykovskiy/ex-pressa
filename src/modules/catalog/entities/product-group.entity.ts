import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Product } from './product.entity';
import { ProductGroupAddonGroup } from './product-group-addon-group.entity';

@Entity('product_groups')
export class ProductGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 120 })
  name: string;

  @Column({ name: 'sort_order', type: 'integer', nullable: true })
  sortOrder?: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => Product, (product) => product.group)
  products: Product[];

  @OneToMany(() => ProductGroupAddonGroup, (link) => link.productGroup)
  addonLinks: ProductGroupAddonGroup[];
}
