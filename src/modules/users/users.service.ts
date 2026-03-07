import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
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

  async findById(id: number): Promise<User | null> {
    return this.repo.findOne({ where: { id }, relations: { roles: true } });
  }

  async ensureSkipAuthUser(): Promise<User> {
    const existing = await this.repo.findOne({
      where: { tgUsername: 'dev_user' },
    });
    if (existing) {
      return existing;
    }

    const user = this.repo.create({
      name: 'Dev User',
      tgUsername: 'dev_user',
      isActive: true,
      isConfirmed: true,
    });
    return this.repo.save(user);
  }

  async createOrFindByTgId(dto: CreateUserDto): Promise<User> {
    const user = await this.findByTgId(dto.tgId!);

    if (user) {
      return user;
    }

    return this.create(dto);
  }

  async requestConfirmation(userId: number): Promise<User> {
    const user = await this.repo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Пользователь не найден');
    if (user.isConfirmed)
      throw new BadRequestException('Аккаунт уже подтверждён');

    user.confirmationRequestedAt = new Date();
    return this.repo.save(user);
  }

  async confirmUser(userId: number): Promise<User> {
    const user = await this.repo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Пользователь не найден');

    user.isConfirmed = true;
    return this.repo.save(user);
  }

  async getPendingConfirmation(): Promise<User[]> {
    return this.repo
      .createQueryBuilder('user')
      .where('user.confirmationRequestedAt IS NOT NULL')
      .andWhere('user.isConfirmed = false')
      .orderBy('user.confirmationRequestedAt', 'ASC')
      .getMany();
  }
}
