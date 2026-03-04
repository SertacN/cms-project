import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class EditCategoryDto {
  @ApiPropertyOptional({example: 'Blog'})
  @IsString()
  @IsOptional()
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  @MaxLength(50, { message: 'Title must be at most 50 characters long' })
  declare title?: string;

  @ApiPropertyOptional({example: 5})
  @IsNumber()
  @IsOptional()
  declare orderBy?: number;

  @ApiPropertyOptional({example: true})
  @IsBoolean()
  @IsOptional()
  declare isActive?: boolean;

  @ApiPropertyOptional({example: 'blog-details'})
  @IsString()
  @IsOptional()
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  @MaxLength(50, { message: 'Title must be at most 50 characters long' })
  declare sefUrl?: string;
}
