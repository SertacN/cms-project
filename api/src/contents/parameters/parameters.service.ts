import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateParametersDefinitionDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ContentParameterDefinition } from '@prisma/client';
import { ApiResponse } from 'src/common/types';

@Injectable()
export class ParametersService {
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
        throw new BadRequestException(
          'Bu kategori altında aynı isimde bir parametre zaten mevcut.',
        );
      }
      throw new NotFoundException('Kategori Bulunamadı');
    }
  }
}
