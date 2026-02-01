import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Addon } from './addon.entity';
import { ProductGroupAddonGroup } from './product-group-addon-group.entity';

@Entity('addon_groups')
export class AddonGroup {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 4 })
  id: number;

  @Column({ length: 120 })
  @ApiProperty({ example: 'Сиропы' })
  name: string;

  @Column({ name: 'sort_order', type: 'integer', nullable: true })
  @ApiPropertyOptional({ example: 1 })
  sortOrder?: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  @ApiProperty({ example: true })
  isActive: boolean;

  @OneToMany(() => Addon, (addon) => addon.addonGroup)
  @ApiProperty({
    type: () => [Addon],
    example: [{ id: 3, name: 'Ванильный сироп', priceRub: 30 }],
  })
  addons: Addon[];

  @OneToMany(() => ProductGroupAddonGroup, (link) => link.addonGroup)
  @ApiProperty({
    type: () => [ProductGroupAddonGroup],
    example: [{ productGroupId: 1, addonGroupId: 4 }],
  })
  productGroupLinks: ProductGroupAddonGroup[];
}
