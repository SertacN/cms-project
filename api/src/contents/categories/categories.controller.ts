import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, EditCategoryDto } from './dto';
import { Public, ServiceResponse, type Pagination } from 'src/common/types';
import { ContentCategory } from '@prisma/client';
import { JwtGuard } from 'src/auth/guard';
import { ApiKeyGuard } from 'src/common/guards';
import { parseIdentifier } from 'src/common/utils';
import { PaginationParam } from 'src/common/decorators';
import { PaginationInterceptor } from 'src/common/interceptors';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Content Categories')
@UseGuards(JwtGuard, ApiKeyGuard)
@Controller('contents/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiOperation({ summary: 'Create new category' })
  @Post()
  async createCategory(@Body() dto: CreateCategoryDto): Promise<ServiceResponse<Public<ContentCategory>>> {
    return this.categoriesService.createCategory(dto);
  }

  @ApiOperation({ summary: 'Get all categories (paginated, hierarchical)' })
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(PaginationInterceptor)
  @Get()
  async getAllCategories(@PaginationParam() pagination: Pagination): Promise<ServiceResponse<any[]>> {
    return this.categoriesService.getAllCategory(pagination);
  }

  @ApiOperation({ summary: 'Get category details by ID or URL' })
  @Get(':identifier')
  async getCategoryDetails(@Param('identifier') identifier: string): Promise<ServiceResponse<Public<ContentCategory>>> {
    const parsedIdentifier = parseIdentifier(identifier);
    return this.categoriesService.getCategoryDetails(parsedIdentifier);
  }

  @ApiOperation({ summary: 'Update category by ID' })
  @Patch(':id')
  async editCategoryById(
    @Param('id', ParseIntPipe) categoryId: number,
    @Body() dto: EditCategoryDto,
  ): Promise<ServiceResponse<Public<ContentCategory>>> {
    return this.categoriesService.editCategoryById(categoryId, dto);
  }

  @ApiOperation({ summary: 'Delete category by ID (soft delete)' })
  @Delete(':id')
  async deleteCategoryById(
    @Param('id', ParseIntPipe) categoryId: number,
  ): Promise<ServiceResponse<Public<ContentCategory>>> {
    return this.categoriesService.deleteCategoryById(categoryId);
  }
}
