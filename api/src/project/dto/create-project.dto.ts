import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  title: string;
  @IsString()
  @IsOptional()
  summary?: string;
  @IsString()
  @IsOptional()
  content?: string;
  @IsString()
  @IsOptional()
  tech?: string;
  @IsString()
  @IsOptional()
  version?: string;
  @IsString()
  @IsOptional()
  imageUrl?: string;
  @IsString()
  @IsOptional()
  techLogoImageUrl?: string[];
}
