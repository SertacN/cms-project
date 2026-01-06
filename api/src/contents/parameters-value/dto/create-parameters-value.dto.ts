import { IsInt, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ParameterValueItemDto {
  @IsInt()
  definitionId: number; // Hangi parametre tanımı (Örn: Renk'in ID'si)

  @IsString()
  value: string; // Seçilen veya yazılan değer (Örn: "Mavi")
}

export class CreateParameterValuesDto {
  @IsInt()
  contentId: number; // Hangi içeriğe (Ürün/İlan) ait olduğu

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParameterValueItemDto)
  values: ParameterValueItemDto[];
}
