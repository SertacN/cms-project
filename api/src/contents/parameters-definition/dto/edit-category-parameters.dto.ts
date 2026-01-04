import { ParameterType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class EditParameterItemDto {
  @IsOptional()
  @IsInt()
  id?: number; // Varsa Update, yoksa Create yapılacak

  @IsString()
  name: string;

  @IsString()
  label: string;

  @IsEnum(ParameterType)
  type: ParameterType;

  @IsOptional()
  options?: string[];

  @IsOptional()
  @IsInt()
  orderBy?: number;
}

export class EditCategoryParametersDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EditParameterItemDto)
  parameters: EditParameterItemDto[];
}
