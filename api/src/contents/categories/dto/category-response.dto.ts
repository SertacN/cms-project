import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class CategoryResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Blog' })
  title: string;

  @ApiProperty({ example: 'blog' })
  sefUrl: string;

  @ApiProperty({ example: 0 })
  orderBy: number;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @Exclude()
  isDeleted: boolean;

  @Exclude()
  deletedAt: Date | null;
}
