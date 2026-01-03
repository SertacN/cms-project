import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class EditCategoryDto {
  @IsString()
  @IsOptional()
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  @MaxLength(50, { message: 'Title must be at most 50 characters long' })
  title?: string;

  @IsNumber()
  @IsOptional()
  orderBy?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  @MaxLength(50, { message: 'Title must be at most 50 characters long' })
  sefUrl?: string;
}
