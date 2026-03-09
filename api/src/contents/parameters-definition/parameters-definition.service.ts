import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateParametersDefinitionDto, EditCategoryParametersDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ContentParameterDefinition, Prisma } from '@prisma/client';
import { ServiceResponse } from 'src/common/types';

@Injectable()
export class ParametersDefinitionService {
  constructor(private readonly prisma: PrismaService) {}

  // All error using Global Exception Filter with Winston
  async createCategoryParameters(
    dto: CreateParametersDefinitionDto | CreateParametersDefinitionDto[],
  ): Promise<ServiceResponse<ContentParameterDefinition[]>> {
    const dataArray = Array.isArray(dto) ? dto : [dto];
    try {
      const results = await this.prisma.$transaction(
        dataArray.map((item) =>
          this.prisma.contentParameterDefinition.create({
            data: item,
          }),
        ),
      );

      return {
        message: `${results.length} adet parametre başarıyla oluşturuldu.`,
        data: results, // Public tipi sayesinde hassas alanlar filtrelenmiş olur
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('Bu kategori altında aynı isimde bir parametre zaten mevcut.');
        }

        if (error.code === 'P2003') {
          throw new NotFoundException('Kategori bulunamadı');
        }
      }

      // Global filter
      throw error;
    }
  }

  async getCategoryParametersById(categoryId: number): Promise<ServiceResponse<ContentParameterDefinition[]>> {
    const categoryParams = await this.prisma.contentParameterDefinition.findMany({
      where: {
        categoryId,
      },
    });
    return {
      message: 'Parametreler başarıyla listelendi.',
      data: categoryParams,
    };
  }

  async editCategoryParametersById(
    categoryId: number,
    dto: EditCategoryParametersDto,
  ): Promise<ServiceResponse<ContentParameterDefinition[]>> {
    // 1. Önce kategorinin gerçekten var olup olmadığını kontrol et
    const categoryExists = await this.prisma.contentCategory.findUnique({
      where: {
        id: categoryId,
      },
    });
    if (!categoryExists) {
      throw new NotFoundException('Kategori bulunamadı');
    }
    try {
      // 2. Transaction başlat (Ya hepsi güncellenir ya hiçbiri)
      const results = await this.prisma.$transaction(
        dto.parameters.map((param) => {
          if (param.id) {
            return this.prisma.contentParameterDefinition.update({
              where: { id: param.id },
              data: {
                name: param.name,
                label: param.label,
                type: param.type,
                options: param.options,
                isRequired: param.isRequired,
                orderBy: param.orderBy ?? 0,
              },
            });
          }
          return this.prisma.contentParameterDefinition.create({
            data: {
              name: param.name,
              label: param.label,
              type: param.type,
              options: param.options,
              isRequired: param.isRequired,
              orderBy: param.orderBy ?? 0,
              categoryId: categoryId,
            },
          });
        }),
      );

      return {
        message: 'Parametreler başarıyla güncellendi.',
        data: results,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('Bu kategori altında aynı isimde bir parametre zaten mevcut.');
        }

        if (error.code === 'P2003') {
          throw new NotFoundException('Kategori bulunamadı');
        }
      }
      // Global filter
      throw error;
    }
  }

  async deleteCategoryParametersById(parameterId: number): Promise<ServiceResponse<ContentParameterDefinition>> {
    const parameter = await this.prisma.contentParameterDefinition.findUnique({
      where: {
        id: parameterId,
      },
    });
    if (!parameter) {
      throw new NotFoundException(`${parameterId} id'li parametre bulunamadı`);
    }
    await this.prisma.contentParameterDefinition.delete({
      where: {
        id: parameterId,
      },
    });
    return {
      message: 'Parametre başarıyla silindi.',
    };
  }
}
