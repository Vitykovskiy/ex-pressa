import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const user = this.repo.create(dto);
    return this.repo.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.repo.find();
  }

  async findByTgId(tgId: string): Promise<User | null> {
    return this.repo.findOne({ where: { tgId } });
  }

  async createOrFindByTgId(dto: CreateUserDto): Promise<User> {
    const existing = await this.findByTgId(dto.tgId!);
    if (existing) return existing;
    return this.create(dto);
  }
}
