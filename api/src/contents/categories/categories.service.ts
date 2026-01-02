import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto } from './dto';
import { generateUniqueUrl } from 'src/common/utils';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async createCategory(dto: CreateCategoryDto) {
    const finalUrl = await generateUniqueUrl(
      dto.title,
      this.prisma.contentCategory,
    );
    try {
      const category = await this.prisma.contentCategory.create({
        data: {
          ...dto,
          sefUrl: finalUrl,
        },
      });
      const { isDeleted, deletedAt, ...categoryData } = category;
      return {
        success: true,
        message: 'Category created successfully',
        data: categoryData,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
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
