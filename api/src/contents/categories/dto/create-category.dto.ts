import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
} from 'class-validator';

export class CreateCategoryDto {
  @IsNotEmpty()
  @IsString()
  title: string;
  @IsOptional()
  @IsNumber()
  orderBy?: number;
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
