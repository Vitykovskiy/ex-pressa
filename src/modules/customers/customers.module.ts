import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from './customers.entity';
import { CustomersBotController } from './controllers/customers.bot.controller';
import { CustomersService } from './customers.service';

@Module({
  imports: [TypeOrmModule.forFeature([Customer])],
  controllers: [],
  providers: [CustomersService, CustomersBotController],
  exports: [CustomersService],
})
export class CustomersModule {}
