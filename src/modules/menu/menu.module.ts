import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Menu } from './entities/menu.entity';
import { MenuItem } from './entities/menu-item.entity';
import { MenuService } from './services/menu.service';
import { MenuBotController } from './controllers/menu.bot.controller';
import { MenuController } from './controllers/menu.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Menu, MenuItem])],
  providers: [MenuService, MenuBotController],
  controllers: [MenuController],
  exports: [MenuService],
})
export class MenuModule {}
