import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, EditCategoryDto } from './dto';
import { Public, ServiceResponse } from 'src/common/types';
import { ContentCategory } from '@prisma/client';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard';
import { ApiKeyGuard } from 'src/common/guards';
import { parseIdentifier } from 'src/common/utils';

@UseGuards(JwtGuard, ApiKeyGuard)
@Controller('contents/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  async createCategory(@Body() dto: CreateCategoryDto): Promise<ServiceResponse<Public<ContentCategory>>> {
    return this.categoriesService.createCategory(dto);
  }
  @HttpCode(HttpStatus.OK)
  @Get()
  async getAllCategories(): Promise<ServiceResponse<Public<ContentCategory>[]>> {
    return this.categoriesService.getAllCategory();
  }

  @Get(':identifier')
  async getCategoryDetails(@Param('identifier') identifier: string): Promise<ServiceResponse<Public<ContentCategory>>> {
    const parsedIdentifier = parseIdentifier(identifier);
    return this.categoriesService.getCategoryDetails(parsedIdentifier);
  }

  @Patch(':id')
  async editCategoryById(
    @Param('id', ParseIntPipe) categoryId: number,
    @Body() dto: EditCategoryDto,
  ): Promise<ServiceResponse<Public<ContentCategory>>> {
    return this.categoriesService.editCategoryById(categoryId, dto);
  }

  @Delete(':id')
  async deleteCategoryById(
    @Param('id', ParseIntPipe) categoryId: number,
  ): Promise<ServiceResponse<Public<ContentCategory>>> {
    return this.categoriesService.deleteCategoryById(categoryId);
  }
}
