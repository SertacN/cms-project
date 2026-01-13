import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto, EditCategoryDto } from './dto';
import { generateUniqueUrl } from 'src/common/utils';
import { ApiResponse, Public } from 'src/common/types';
import { ContentCategory } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async createCategory(dto: CreateCategoryDto): Promise<ApiResponse<Public<ContentCategory>>> {
    const finalUrl = await generateUniqueUrl(dto.title, this.prisma.contentCategory);
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

  async getAllCategory(): Promise<ApiResponse<Public<ContentCategory>[]>> {
    const categories = await this.prisma.contentCategory.findMany({
      where: {
        isDeleted: false,
      },
      select: {
        id: true,
        title: true,
        sefUrl: true,
        orderBy: true,
        isActive: true,
        content: false,
        parameterDefinitions: false,
        createdAt: true,
        updatedAt: true,
      },
    });
    return {
      success: true,
      message: 'Categories fetched successfully',
      data: categories,
    };
  }

  async getCategoryById(categoryId: number): Promise<ApiResponse<Public<ContentCategory>>> {
    const category = await this.prisma.contentCategory.findUnique({
      where: {
        id: categoryId,
        isDeleted: false,
      },
      select: {
        id: true,
        title: true,
        sefUrl: true,
        orderBy: true,
        isActive: true,
        content: true,
        parameterDefinitions: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!category) {
      throw new NotFoundException(`Category ID ${categoryId} not found`);
    }
    return {
      success: true,
      message: 'Category fetched successfully',
      data: category,
    };
  }
  // TODO: Transaction dene
  async editCategoryById(categoryId: number, dto: EditCategoryDto): Promise<ApiResponse<Public<ContentCategory>>> {
    const category = await this.prisma.contentCategory.findUnique({
      where: {
        id: categoryId,
        isDeleted: false,
      },
    });
    if (!category) {
      throw new NotFoundException(`Category ID ${categoryId} not found`);
    }
    if (dto.title) {
      const finalUrl = await generateUniqueUrl(dto.title, this.prisma.contentCategory);
      dto.sefUrl = finalUrl;
    }
    const updatedCategory = await this.prisma.contentCategory.update({
      where: {
        id: categoryId,
      },
      data: dto,
    });
    return {
      success: true,
      message: 'Category updated successfully',
      data: updatedCategory,
    };
  }

  // TODO: UpdateMany ile değiştir. bulma silme işlemi tek bir sorguda olsun
  async deleteCategoryById(categoryId: number): Promise<ApiResponse<Public<ContentCategory>>> {
    const category = await this.prisma.contentCategory.findUnique({
      where: {
        id: categoryId,
        isDeleted: false,
      },
    });
    if (!category) {
      throw new NotFoundException(`Category ID ${categoryId} not found`);
    }
    await this.prisma.contentCategory.update({
      where: {
        id: categoryId,
      },
      data: {
        isDeleted: true,
        isActive: false,
        deletedAt: new Date(),
      },
    });
    return {
      success: true,
      message: 'Category deleted successfully',
    };
  }

  // TODO: Get Category By SefUrl
}
