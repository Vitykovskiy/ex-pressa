import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Product } from './product.entity';
import { ProductGroupAddonGroup } from './product-group-addon-group.entity';

@Entity('product_groups')
export class ProductGroup {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1 })
  id: number;

  @Column({ length: 120 })
  @ApiProperty({ example: 'Кофе' })
  name: string;

  @Column({ name: 'sort_order', type: 'integer', nullable: true })
  @ApiPropertyOptional({ example: 1 })
  sortOrder?: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  @ApiProperty({ example: true })
  isActive: boolean;

  @OneToMany(() => Product, (product) => product.group)
  @ApiProperty({
    type: () => [Product],
    example: [{ id: 5, name: 'Латте', type: 'DRINK' }],
  })
  products: Product[];

  @OneToMany(() => ProductGroupAddonGroup, (link) => link.productGroup)
  @ApiProperty({
    type: () => [ProductGroupAddonGroup],
    example: [{ productGroupId: 1, addonGroupId: 4 }],
  })
  addonLinks: ProductGroupAddonGroup[];
}
