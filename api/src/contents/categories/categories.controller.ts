import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, EditCategoryDto } from './dto';
import { ApiResponse, Public } from 'src/common/types';
import { ContentCategory } from '@prisma/client';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard';
import { ApiKeyGuard } from 'src/common/guards';

@UseGuards(JwtGuard, ApiKeyGuard)
@Controller('contents/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  async createCategory(@Body() dto: CreateCategoryDto): Promise<ApiResponse<Public<ContentCategory>>> {
    return this.categoriesService.createCategory(dto);
  }

  @Get()
  async getAllCategories(): Promise<ApiResponse<Public<ContentCategory>[]>> {
    return this.categoriesService.getAllCategory();
  }

  @Get(':id')
  async getCategoryById(@Param('id', ParseIntPipe) categoryId: number): Promise<ApiResponse<Public<ContentCategory>>> {
    return this.categoriesService.getCategoryById(categoryId);
  }

  @Patch(':id')
  async editCategoryById(
    @Param('id', ParseIntPipe) categoryId: number,
    @Body() dto: EditCategoryDto,
  ): Promise<ApiResponse<Public<ContentCategory>>> {
    return this.categoriesService.editCategoryById(categoryId, dto);
  }

  @Delete(':id')
  async deleteCategoryById(
    @Param('id', ParseIntPipe) categoryId: number,
  ): Promise<ApiResponse<Public<ContentCategory>>> {
    return this.categoriesService.deleteCategoryById(categoryId);
  }
}
