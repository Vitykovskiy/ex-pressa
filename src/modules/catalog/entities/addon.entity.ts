import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { AddonGroup } from './addon-group.entity';

@Entity('addons')
export class Addon {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 3 })
  id: number;

  @ManyToOne(() => AddonGroup, (group) => group.addons, { nullable: false })
  @JoinColumn({ name: 'addon_group_id' })
  @ApiProperty({ type: () => AddonGroup, example: { id: 4, name: 'Сиропы' } })
  addonGroup: AddonGroup;

  @Column({ length: 120 })
  @ApiProperty({ example: 'Ванильный сироп' })
  name: string;

  @Column({ name: 'price_rub', type: 'integer', default: 0 })
  @ApiProperty({ example: 30 })
  priceRub: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  @ApiProperty({ example: true })
  isActive: boolean;
}
