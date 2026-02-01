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

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Role } from './roles/role.entity';

@Entity('users')
@Index(['tgId'], { unique: true, where: 'tg_id IS NOT NULL' })
export class User {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 7 })
  id: number;

  @Column({ length: 120 })
  @ApiProperty({ example: 'Алексей Иванов' })
  name: string;

  @Column({ name: 'tg_id', type: 'text', nullable: true })
  @ApiPropertyOptional({ example: '123456789' })
  tgId?: string;

  @Column({ name: 'tg_username', type: 'text', nullable: true })
  @ApiPropertyOptional({ example: 'алексей' })
  tgUsername?: string;

  @Column({ default: true })
  @ApiProperty({ example: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty({ example: '2026-02-01T08:00:00.000Z' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @ApiProperty({ example: '2026-02-01T08:10:00.000Z' })
  updatedAt: Date;

  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable({ name: 'user_roles' })
  @ApiProperty({
    type: () => [Role],

    example: [{ id: 1, code: 'USER', name: 'Пользователь' }],
  })
  roles: Role[];
}
