import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto, EditCategoryDto } from './dto';
import { generateUniqueUrl, getByIdentifier } from 'src/common/utils';
import { ServiceResponse, Public, Pagination } from 'src/common/types';
import { ContentCategory, ContentParameterDefinition } from '@prisma/client';

// Parametre çözümleme: parent.parameters + child.parameters birleştirilir
function resolveParameters(
  ownParams: ContentParameterDefinition[],
  parentParams?: ContentParameterDefinition[],
): ContentParameterDefinition[] {
  if (!parentParams?.length) return ownParams;
  return [...parentParams, ...ownParams];
}

const CATEGORY_PUBLIC_SELECT = {
  id: true,
  title: true,
  sefUrl: true,
  orderBy: true,
  isActive: true,
  parentId: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  // All error using Global Exception Filter with Winston
  async createCategory(dto: CreateCategoryDto): Promise<ServiceResponse<Public<ContentCategory>>> {
    // Parent kontrolü: maksimum 2 seviye
    if (dto.parentId) {
      const parent = await this.prisma.contentCategory.findUnique({
        where: { id: dto.parentId, isDeleted: false },
        select: { id: true, parentId: true },
      });
      if (!parent) {
        throw new NotFoundException(`${dto.parentId} ID'li üst kategori bulunamadı`);
      }
      if (parent.parentId !== null) {
        throw new BadRequestException('Maksimum 2 seviyeli hiyerarşi desteklenmektedir. Seçilen kategori zaten bir alt kategoridir.');
      }
    }

    const finalUrl = await generateUniqueUrl(dto.title, this.prisma.contentCategory);
    const category = await this.prisma.contentCategory.create({
      data: {
        ...dto,
        sefUrl: finalUrl,
      },
      select: CATEGORY_PUBLIC_SELECT,
    });
    return {
      message: 'Category created successfully',
      data: category,
    };
  }

  // Hiyerarşik liste: sadece üst kategoriler döner, her biri children[] ile birlikte
  async getAllCategory(pagination: Pagination): Promise<ServiceResponse<any[]>> {
    const where = { isDeleted: false, parentId: null };

    const [categories, total] = await Promise.all([
      this.prisma.contentCategory.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        select: {
          ...CATEGORY_PUBLIC_SELECT,
          children: {
            where: { isDeleted: false },
            select: {
              ...CATEGORY_PUBLIC_SELECT,
              _count: { select: { content: true } },
            },
            orderBy: [{ orderBy: 'asc' }, { createdAt: 'desc' }],
          },
          _count: { select: { content: true, children: true } },
        },
        orderBy: [{ orderBy: 'asc' }, { createdAt: 'desc' }],
      }),
      this.prisma.contentCategory.count({ where }),
    ]);

    return {
      message: 'Categories fetched successfully',
      data: categories,
      meta: { total },
    };
  }

  // ID ve SefUrl ile birlikte çalışır — parameterler parent'tan miras alınır
  async getCategoryDetails(identifier: number | string): Promise<ServiceResponse<any>> {
    const category = await this.prisma.contentCategory.findFirst({
      where: getByIdentifier(identifier, { isDeleted: false }),
      select: {
        ...CATEGORY_PUBLIC_SELECT,
        parameterDefinitions: {
          orderBy: { orderBy: 'asc' },
        },
        parent: {
          select: {
            id: true,
            title: true,
            sefUrl: true,
            parameterDefinitions: {
              orderBy: { orderBy: 'asc' },
            },
          },
        },
        children: {
          where: { isDeleted: false },
          select: {
            ...CATEGORY_PUBLIC_SELECT,
            _count: { select: { content: true } },
          },
          orderBy: [{ orderBy: 'asc' }, { createdAt: 'desc' }],
        },
        _count: { select: { content: true, children: true } },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category ${identifier} not found`);
    }

    const resolvedParameters = resolveParameters(
      category.parameterDefinitions,
      category.parent?.parameterDefinitions,
    );

    return {
      message: 'Category fetched successfully',
      data: {
        ...category,
        resolvedParameters,
      },
    };
  }

  async editCategoryById(categoryId: number, dto: EditCategoryDto): Promise<ServiceResponse<Public<ContentCategory>>> {
    const category = await this.prisma.contentCategory.findUnique({
      where: { id: categoryId, isDeleted: false },
    });
    if (!category) {
      throw new NotFoundException(`Category ID ${categoryId} not found`);
    }
    if (dto.title) {
      const finalUrl = await generateUniqueUrl(dto.title, this.prisma.contentCategory);
      dto.sefUrl = finalUrl;
    }
    const updatedCategory = await this.prisma.contentCategory.update({
      where: { id: categoryId },
      data: dto,
      select: CATEGORY_PUBLIC_SELECT,
    });
    return {
      message: 'Category updated successfully',
      data: updatedCategory,
    };
  }

  // Alt kategorileri olan bir üst kategori silinemez
  async deleteCategoryById(categoryId: number): Promise<ServiceResponse<Public<ContentCategory>>> {
    const category = await this.prisma.contentCategory.findUnique({
      where: { id: categoryId, isDeleted: false },
      select: { id: true, _count: { select: { children: { where: { isDeleted: false } } } } },
    });
    if (!category) {
      throw new NotFoundException(`${categoryId} ID'li Kategori Bulunamadı`);
    }
    if (category._count.children > 0) {
      throw new BadRequestException('Alt kategorileri olan bir kategori silinemez. Önce alt kategorileri silin.');
    }

    await this.prisma.contentCategory.updateMany({
      where: { id: categoryId, isDeleted: false },
      data: { isDeleted: true, isActive: false, deletedAt: new Date() },
    });

    return {
      message: `${categoryId} ID'li Kategori Başarıyla Silindi`,
    };
  }
}
