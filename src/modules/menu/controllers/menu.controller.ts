import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { MenuService } from '../services/menu.service';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  // Активное меню с позициями
  @Get('active')
  getActiveMenu() {
    return this.menuService.getActiveMenu();
  }

  // Все меню (без фильтра по датам)
  @Get()
  getMenus() {
    return this.menuService.listMenus();
  }

  // Конкретное меню по id (с позициями)
  @Get(':id')
  getMenu(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.findMenuById(id);
  }

  // Все доступные позиции (для витрины)
  @Get('items/all')
  getItems() {
    return this.menuService.listItems();
  }

  // Конкретная позиция меню по id
  @Get('items/:id')
  getItem(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.findItemById(id);
  }
}
