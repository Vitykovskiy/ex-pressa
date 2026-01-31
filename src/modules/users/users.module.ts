import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Role } from './roles/role.entity';
import { UsersBotController } from './controllers/users.bot.controller';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role])],
  controllers: [],
  providers: [UsersService, UsersBotController],
  exports: [UsersService],
})
export class UsersModule {}
