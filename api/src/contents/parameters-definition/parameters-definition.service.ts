import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateParametersDefinitionDto, EditCategoryParametersDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ContentParameterDefinition } from '@prisma/client';
import { ApiResponse } from 'src/common/types';

@Injectable()
export class ParametersDefinitionService {
  constructor(private readonly prisma: PrismaService) {}

  async createCategoryParameters(
    dto: CreateParametersDefinitionDto | CreateParametersDefinitionDto[],
  ): Promise<ApiResponse<ContentParameterDefinition[]>> {
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
        success: true,
        message: `${results.length} adet parametre başarıyla oluşturuldu.`,
        data: results, // Public tipi sayesinde hassas alanlar filtrelenmiş olur
      };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Bu kategori altında aynı isimde bir parametre zaten mevcut.');
      }
      throw new NotFoundException('Kategori Bulunamadı');
    }
  }

  async getCategoryParametersById(categoryId: number): Promise<ApiResponse<ContentParameterDefinition[]>> {
    const categoryParams = await this.prisma.contentParameterDefinition.findMany({
      where: {
        categoryId,
      },
    });
    if (categoryParams.length <= 0) {
      throw new NotFoundException('Kategoriye ait parametre bulunamadı');
    }
    return {
      success: true,
      message: 'Parametreler başarıyla listelendi.',
      data: categoryParams,
    };
  }

  async editCategoryParametersById(
    categoryId: number,
    dto: EditCategoryParametersDto,
  ): Promise<ApiResponse<ContentParameterDefinition[]>> {
    try {
      // 1. Önce kategorinin gerçekten var olup olmadığını kontrol et
      const categoryExists = await this.prisma.contentCategory.findUnique({
        where: { id: categoryId },
      });
      if (!categoryExists) {
        throw new NotFoundException('Kategori bulunamadı');
      }

      // 2. Transaction başlat (Ya hepsi güncellenir ya hiçbiri)
      const results = await this.prisma.$transaction(
        dto.parameters.map((param) => {
          return this.prisma.contentParameterDefinition.upsert({
            where: {
              // Bileşik unique anahtarımız: categoryId ve name
              categoryId_name: {
                categoryId: categoryId,
                name: param.name,
              },
            },
            update: {
              label: param.label,
              type: param.type,
              options: param.options,
              orderBy: param.orderBy ?? 0,
            },
            create: {
              ...param,
              categoryId: categoryId,
            },
          });
        }),
      );

      return {
        success: true,
        message: 'Parametreler başarıyla güncellendi.',
        data: results,
      };
    } catch (error) {
      throw new NotFoundException('Güncelleme sırasında bir hata oluştu: ' + error.message);
    }
  }

  async deleteCategoryParametersById(parameterId: number): Promise<ApiResponse<ContentParameterDefinition>> {
    try {
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
        success: true,
        message: 'Parametre başarıyla silindi.',
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Parametre silinirken bir hata oluştu: ' + error.message);
    }
  }
}
