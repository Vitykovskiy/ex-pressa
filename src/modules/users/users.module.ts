import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Role } from './roles/role.entity';
import { UsersBotController } from './controllers/users.bot.controller';
import { UsersHttpController } from './controllers/users.http.controller';
import { MultiBotRuntimeService } from './multi-bot-runtime.service';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role])],
  controllers: [UsersHttpController],
  providers: [UsersService, UsersBotController, MultiBotRuntimeService],
  exports: [UsersService],
})
export class UsersModule {
  constructor(private readonly _multiBotRuntimeService: MultiBotRuntimeService) {}
}
