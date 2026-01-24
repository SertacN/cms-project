import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateParameterValuesDto, DeleteParameterValueDto } from './dto';
import { ApiResponse } from 'src/common/types';
import { ContentParameterValue, Prisma } from '@prisma/client';

@Injectable()
export class ParametersValueService {
  constructor(private readonly prisma: PrismaService) {}

  // All error using Global Exception Filter with Winston
  async createOrUpdateValues(dto: CreateParameterValuesDto): Promise<ApiResponse<any>> {
    // ADIM 0: Önce İçerik Var mı Kontrol Et!
    const contentExists = await this.prisma.content.findUnique({
      where: {
        id: dto.contentId,
      },
    });

    if (!contentExists) {
      throw new NotFoundException(`ID'si ${dto.contentId} olan içerik bulunamadı. Lütfen önce içeriği oluşturun.`);
    }

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // ... (transaction kodların aynı kalacak) ...
        await tx.contentParameterValue.deleteMany({
          where: {
            contentId: dto.contentId,
          },
        });

        const createdValues = await tx.contentParameterValue.createMany({
          data: dto.values.map((v) => ({
            contentId: dto.contentId,
            definitionId: v.definitionId,
            value: v.value,
          })),
        });
        return createdValues;
      });

      return {
        success: true,
        message: 'İçerik parametreleri başarıyla kaydedildi.',
        data: result,
      };
    } catch (error) {
      // Buraya düşüyorsa artık sorun contentId değildir, muhtemelen definitionId yanlıştır veya veritabanı kilitlenmiştir.
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new NotFoundException('Geçersiz bir parametre tanımı (Definition ID) gönderdiniz.');
        }
      }
      throw error;
    }
  }

  async deleteParamValue(dto: DeleteParameterValueDto): Promise<ApiResponse<ContentParameterValue>> {
    const result = await this.prisma.contentParameterValue.deleteMany({
      where: {
        contentId: dto.contentId,
        definitionId: dto.definitionId,
      },
    });
    if (result.count === 0) {
      throw new NotFoundException(`Siliniecek parametre değeri bulunamadı`);
    }

    return {
      success: true,
      message: 'Parametre değeri başarıyla silindi',
    };
  }
}
