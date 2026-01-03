import { ParameterType } from '@prisma/client';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateParametersDefinitionDto {
  @IsString()
  name: string; // Veritabanı adı: 'renk', 'boyut'

  @IsString()
  label: string; // Arayüz adı: 'Ürün Rengi', 'Ekran Boyutu'

  @IsEnum(ParameterType, {
    message:
      'Geçersiz parametre tipi. Seçenekler: TEXT, NUMBER, SELECT, CHECKBOX, DATE, TEXTAREA',
  })
  type: ParameterType; // 'text', 'select', 'number'

  @IsArray({ message: 'Options bir dizi (array) formatında olmalıdır.' })
  @IsOptional()
  options?: string[]; // Eğer select ise 'Kırmızı,Mavi,Yeşil' gibi

  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @IsInt()
  @IsOptional()
  orderBy?: number;

  @IsInt()
  categoryId: number; // Hangi kategoriye ait olduğu
}
