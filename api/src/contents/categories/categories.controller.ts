import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, EditCategoryDto } from './dto';
import { Public, ServiceResponse, type Pagination } from 'src/common/types';
import { ContentCategory, Role } from '@prisma/client';
import { JwtGuard } from 'src/auth/guard';
import { ApiKeyGuard, RolesGuard } from 'src/common/guards';
import { parseIdentifier } from 'src/common/utils';
import { PaginationParam, Roles } from 'src/common/decorators';
import { PaginationInterceptor } from 'src/common/interceptors';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Content Categories')
@UseGuards(JwtGuard, ApiKeyGuard, RolesGuard)
@Controller('contents/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiOperation({ summary: 'Create new category' })
  @Roles(Role.ADMIN)
  @Post()
  async createCategory(@Body() dto: CreateCategoryDto): Promise<ServiceResponse<Public<ContentCategory>>> {
    return this.categoriesService.createCategory(dto);
  }

  @ApiOperation({ summary: 'Get all categories (paginated, hierarchical)' })
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(PaginationInterceptor)
  @Roles(Role.ADMIN, Role.USER)
  @Get()
  async getAllCategories(@PaginationParam() pagination: Pagination): Promise<ServiceResponse<any[]>> {
    return this.categoriesService.getAllCategory(pagination);
  }

  @ApiOperation({ summary: 'Get category details by ID or URL' })
  @Roles(Role.ADMIN, Role.USER)
  @Get(':identifier')
  async getCategoryDetails(@Param('identifier') identifier: string): Promise<ServiceResponse<Public<ContentCategory>>> {
    const parsedIdentifier = parseIdentifier(identifier);
    return this.categoriesService.getCategoryDetails(parsedIdentifier);
  }

  @ApiOperation({ summary: 'Update category by ID' })
  @Roles(Role.ADMIN)
  @Patch(':id')
  async editCategoryById(
    @Param('id', ParseIntPipe) categoryId: number,
    @Body() dto: EditCategoryDto,
  ): Promise<ServiceResponse<Public<ContentCategory>>> {
    return this.categoriesService.editCategoryById(categoryId, dto);
  }

  @ApiOperation({ summary: 'Delete category by ID (soft delete)' })
  @Roles(Role.ADMIN)
  @Delete(':id')
  async deleteCategoryById(
    @Param('id', ParseIntPipe) categoryId: number,
  ): Promise<ServiceResponse<Public<ContentCategory>>> {
    return this.categoriesService.deleteCategoryById(categoryId);
  }
}
