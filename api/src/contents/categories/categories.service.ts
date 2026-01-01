import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async createCategory() {
    return 'create category service';
  }

  async getAllCategory() {
    return 'get all category service';
  }

  async getCategoryById() {
    return 'get category by id service';
  }

  async updateCategoryById() {
    return 'update category by id service';
  }

  async deleteCategoryById() {
    return 'delete category by id service';
  }
}
