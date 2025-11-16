import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MenuService } from '../services/menu.service';
import { Menu } from '../entities/menu.entity';
import { MenuItem } from '../entities/menu-item.entity';
import { MenuGroupResponseDto } from '../dto/menu-groups-response.dto';

@ApiTags('Меню')
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @ApiOperation({ summary: 'Получить активное меню со всеми позициями' })
  @ApiOkResponse({ type: Menu })
  @Get('active')
  getActiveMenu(): Promise<Menu> {
    return this.menuService.getActiveMenu();
  }

  @ApiOperation({ summary: 'Показать доступные меню (без позиций)' })
  @ApiOkResponse({ type: Menu, isArray: true })
  @Get()
  getMenus(): Promise<Menu[]> {
    return this.menuService.listMenus();
  }

  @ApiOperation({
    summary: 'Получить меню по идентификатору вместе с позициями',
  })
  @ApiOkResponse({ type: Menu })
  @Get(':id')
  getMenu(@Param('id', ParseIntPipe) id: number): Promise<Menu> {
    return this.menuService.findMenuById(id);
  }

  @ApiOperation({
    summary: 'Получить сгруппированный список позиций для витрины',
  })
  @ApiOkResponse({ type: MenuGroupResponseDto, isArray: true })
  @Get('items/all')
  getItems(): Promise<MenuGroupResponseDto[]> {
    return this.menuService.listItems();
  }

  @ApiOperation({ summary: 'Получить позицию меню по идентификатору' })
  @ApiOkResponse({ type: MenuItem })
  @Get('items/:id')
  getItem(@Param('id', ParseIntPipe) id: number): Promise<MenuItem> {
    return this.menuService.findItemById(id);
  }
}
