import { Body, Controller, Post } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto';

@Controller('contents/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  async createCategory(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.createCategory(dto);
  }
}
