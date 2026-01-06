import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateParameterValuesDto } from './dto';

@Injectable()
export class ParametersValueService {
  constructor(private readonly prisma: PrismaService) {}
  async createOrUpdateValues(dto: CreateParameterValuesDto) {
    // ADIM 0: Önce İçerik Var mı Kontrol Et!
    const contentExists = await this.prisma.content.findUnique({
      where: { id: dto.contentId },
    });

    if (!contentExists) {
      throw new NotFoundException(
        `ID'si ${dto.contentId} olan içerik bulunamadı. Lütfen önce içeriği oluşturun.`,
      );
    }

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // ... (transaction kodların aynı kalacak) ...
        await tx.contentParameterValue.deleteMany({
          where: { contentId: dto.contentId },
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
      if (error.code === 'P2003') {
        throw new NotFoundException(
          'Geçersiz bir parametre tanımı (Definition ID) gönderdiniz.',
        );
      }
      throw new InternalServerErrorException(error.message);
    }
  }
}
