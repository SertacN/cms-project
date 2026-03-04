import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, EditCategoryDto } from './dto';
import { Public, ServiceResponse } from 'src/common/types';
import { ContentCategory } from '@prisma/client';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard';
import { ApiKeyGuard } from 'src/common/guards';
import { parseIdentifier } from 'src/common/utils';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Content Categories')
@UseGuards(JwtGuard, ApiKeyGuard)
@Controller('contents/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiOperation({summary: 'Create new category'})
  @Post()
  async createCategory(@Body() dto: CreateCategoryDto): Promise<ServiceResponse<Public<ContentCategory>>> {
    return this.categoriesService.createCategory(dto);
  }
  @ApiOperation({summary: 'Get all categories'})
  @HttpCode(HttpStatus.OK)
  @Get()
  async getAllCategories(): Promise<ServiceResponse<Public<ContentCategory>[]>> {
    return this.categoriesService.getAllCategory();
  }

  @ApiOperation({summary: 'Get category details by ID or URL'})
  @Get(':identifier')
  async getCategoryDetails(@Param('identifier') identifier: string): Promise<ServiceResponse<Public<ContentCategory>>> {
    const parsedIdentifier = parseIdentifier(identifier);
    return this.categoriesService.getCategoryDetails(parsedIdentifier);
  }

  @ApiOperation({summary: 'Update category by ID'})
  @Patch(':id')
  async editCategoryById(
    @Param('id', ParseIntPipe) categoryId: number,
    @Body() dto: EditCategoryDto,
  ): Promise<ServiceResponse<Public<ContentCategory>>> {
    return this.categoriesService.editCategoryById(categoryId, dto);
  }

  @ApiOperation({summary: 'Delete category by ID (not a soft delete!)'})
  @Delete(':id')
  async deleteCategoryById(
    @Param('id', ParseIntPipe) categoryId: number,
  ): Promise<ServiceResponse<Public<ContentCategory>>> {
    return this.categoriesService.deleteCategoryById(categoryId);
  }
}
