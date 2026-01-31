import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AddonGroup } from './addon-group.entity';

@Entity('addons')
export class Addon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AddonGroup, (group) => group.addons, { nullable: false })
  @JoinColumn({ name: 'addon_group_id' })
  addonGroup: AddonGroup;

  @Column({ length: 120 })
  name: string;

  @Column({ name: 'price_rub', type: 'integer', default: 0 })
  priceRub: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}
