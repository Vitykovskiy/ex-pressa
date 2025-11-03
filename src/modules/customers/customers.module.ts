import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from './customers.entity';
import { CustomersController } from './controllers/customers.controller';
import { CustomersBotController } from './controllers/customers.bot.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Customer])],
  controllers: [CustomersController],
  providers: [CustomersService, CustomersBotController],
  exports: [CustomersService],
})
export class CustomersModule {}
