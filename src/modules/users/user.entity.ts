import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Role } from './roles/role.entity';

@Entity('users')
@Index(['tgId'], { unique: true, where: 'tg_id IS NOT NULL' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 120 })
  name: string;

  @Column({ name: 'tg_id', type: 'text', nullable: true })
  tgId?: string;

  @Column({ name: 'tg_username', type: 'text', nullable: true })
  tgUsername?: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable({ name: 'user_roles' })
  roles: Role[];
}
