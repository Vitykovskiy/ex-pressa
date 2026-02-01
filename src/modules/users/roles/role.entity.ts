import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';

import { User } from '../user.entity';

import { RoleCode } from './role-code.enum';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1 })
  id: number;

  @Column({ type: 'enum', enum: RoleCode, unique: true })
  @ApiProperty({ enum: RoleCode, example: 'USER' })
  code: RoleCode;

  @Column({ length: 120 })
  @ApiProperty({ example: 'Пользователь' })
  name: string;

  @ManyToMany(() => User, (user) => user.roles)
  @ApiProperty({
    type: () => [User],

    example: [{ id: 7, name: 'Алексей Иванов' }],
  })
  users: User[];
}
