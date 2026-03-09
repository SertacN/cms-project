import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto, EditCategoryDto } from './dto';
import { generateUniqueUrl, getByIdentifier } from 'src/common/utils';
import { ServiceResponse, Public } from 'src/common/types';
import { ContentCategory } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  // All error using Global Exception Filter with Winston
  // TODO: Kategorinin alt kategorisi oluşturma denensin
  async createCategory(dto: CreateCategoryDto): Promise<ServiceResponse<Public<ContentCategory>>> {
    const finalUrl = await generateUniqueUrl(dto.title, this.prisma.contentCategory);
    const category = await this.prisma.contentCategory.create({
      data: {
        ...dto,
        sefUrl: finalUrl,
      },
      select: {
        id: true,
        title: true,
        sefUrl: true,
        isActive: true,
        orderBy: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return {
      message: 'Category created successfully',
      data: category,
    };
  }

  async getAllCategory(): Promise<ServiceResponse<Public<ContentCategory>[]>> {
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
      orderBy: [{ orderBy: 'asc' }, { createdAt: 'desc' }],
    });
    return {
      message: 'Categories fetched successfully',
      data: categories,
    };
  }
  // ID ve SefUrl ile birlikte çalışır(hangisi gönderilirse)
  async getCategoryDetails(identifier: number | string): Promise<ServiceResponse<Public<ContentCategory>>> {
    const category = await this.prisma.contentCategory.findFirst({
      where: getByIdentifier(identifier, { isDeleted: false }),
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
      throw new NotFoundException(`Category ${identifier} not found`);
    }
    return {
      message: 'Category fetched successfully',
      data: category,
    };
  }
  // Tekil tablo işlemi. Transaction kullanılmadı.
  async editCategoryById(categoryId: number, dto: EditCategoryDto): Promise<ServiceResponse<Public<ContentCategory>>> {
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
      select: {
        id: true,
        title: true,
        sefUrl: true,
        orderBy: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return {
      message: 'Category updated successfully',
      data: updatedCategory,
    };
  }
  // Data geri döndürülmediği için UpdateMany ile Soft Delete
  async deleteCategoryById(categoryId: number): Promise<ServiceResponse<Public<ContentCategory>>> {
    const result = await this.prisma.contentCategory.updateMany({
      where: {
        id: categoryId,
        isDeleted: false,
      },
      data: {
        isDeleted: true,
        isActive: false,
        deletedAt: new Date(),
      },
    });
    if (result.count === 0) {
      throw new NotFoundException(`${categoryId} ID'li Kategori Bulunamadı`);
    }
    return {
      message: `${categoryId} ID'li Kategori Başarıyla Silindi`,
    };
  }
}
