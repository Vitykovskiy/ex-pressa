import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { User } from '../user.entity';
import { RoleCode } from './role-code.enum';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: RoleCode, unique: true })
  code: RoleCode;

  @Column({ length: 120 })
  name: string;

  @ManyToMany(() => User, (user) => user.roles)
  users: User[];
}
