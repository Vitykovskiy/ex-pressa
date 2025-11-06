import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './customers.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly repo: Repository<Customer>,
  ) {}

  async create(dto: CreateCustomerDto): Promise<Customer> {
    const customer = this.repo.create(dto);
    return this.repo.save(customer);
  }

  async findAll(): Promise<Customer[]> {
    return this.repo.find();
  }

  async findByTgId(tgId: string): Promise<Customer | null> {
    return this.repo.findOne({ where: { tgId } });
  }

  async createOrFindByTgId(dto: CreateCustomerDto): Promise<Customer> {
    const existing = await this.findByTgId(dto.tgId!);
    if (existing) return existing;
    return this.create(dto);
  }
}
