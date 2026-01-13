import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class EditPostDto {
  @IsString()
  @IsOptional()
  @MinLength(3, { message: 'Başlık en az 3 karakter olmalı' })
  title?: string;

  @IsString()
  @IsOptional()
  summary?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  sefUrl?: string;

  @IsInt()
  @IsOptional()
  orderBy?: number;

  @IsNotEmpty()
  @IsInt()
  categoryId: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
