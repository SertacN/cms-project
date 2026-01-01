import { Controller } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('contents/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}
}
