import { ApiPropertyOptional } from '@nestjs/swagger';
import { ContentStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';

export class GetAllPostDto {
  @ApiPropertyOptional({ example: 1, description: 'Kategoriye göre filtrele' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId?: number;

  @ApiPropertyOptional({ enum: ContentStatus, description: 'Duruma göre filtrele' })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;
}
