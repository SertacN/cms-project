import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  IsInt,
  Min,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({example: 'Blog'})
  @IsNotEmpty()
  @IsString()
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  @MaxLength(50, { message: 'Title must be at most 50 characters long' })
  declare title: string;

  @ApiPropertyOptional({example: 5})
  @IsOptional()
  @IsNumber()
  declare orderBy?: number;

  @ApiPropertyOptional({example: true})
  @IsOptional()
  @IsBoolean()
  declare isActive?: boolean;

  @ApiPropertyOptional({ example: 1, description: 'Üst kategori ID — maksimum 2 seviye hiyerarşi' })
  @IsOptional()
  @IsInt()
  @Min(1)
  declare parentId?: number;
}
