import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MenuService } from '../services/menu.service';
import { Menu } from '../entities/menu.entity';
import { MenuItem } from '../entities/menu-item.entity';
import { MenuGroupResponseDto } from '../dto/menu-groups-response.dto';

@ApiTags('Menu')
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @ApiOperation({ summary: 'Get currently active menu with its items' })
  @ApiOkResponse({ type: Menu })
  @Get('active')
  getActiveMenu(): Promise<Menu> {
    return this.menuService.getActiveMenu();
  }

  @ApiOperation({ summary: 'List available menus (without items)' })
  @ApiOkResponse({ type: Menu, isArray: true })
  @Get()
  getMenus(): Promise<Menu[]> {
    return this.menuService.listMenus();
  }

  @ApiOperation({ summary: 'Fetch menu by id along with its items' })
  @ApiOkResponse({ type: Menu })
  @Get(':id')
  getMenu(@Param('id', ParseIntPipe) id: number): Promise<Menu> {
    return this.menuService.findMenuById(id);
  }

  @ApiOperation({ summary: 'List grouped menu items ready for the storefront' })
  @ApiOkResponse({ type: MenuGroupResponseDto, isArray: true })
  @Get('items/all')
  getItems(): Promise<MenuGroupResponseDto[]> {
    return this.menuService.listItems();
  }

  @ApiOperation({ summary: 'Fetch menu item by id' })
  @ApiOkResponse({ type: MenuItem })
  @Get('items/:id')
  getItem(@Param('id', ParseIntPipe) id: number): Promise<MenuItem> {
    return this.menuService.findItemById(id);
  }
}
