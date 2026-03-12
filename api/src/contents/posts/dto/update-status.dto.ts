import { ApiProperty } from '@nestjs/swagger';
import { ContentStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateStatusDto {
  @ApiProperty({ enum: ContentStatus, example: ContentStatus.PUBLISHED })
  @IsEnum(ContentStatus)
  @IsNotEmpty()
  status: ContentStatus;
}
