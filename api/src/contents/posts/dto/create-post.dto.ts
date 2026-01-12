import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @MinLength(3, { message: 'Başlık en az 3 karakter olmalı' })
  @IsNotEmpty()
  title: string;

  @IsInt()
  @IsNotEmpty()
  categoryId: number;

  @IsString()
  @IsOptional()
  summary?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsInt()
  @IsOptional()
  orderBy?: number;
}
