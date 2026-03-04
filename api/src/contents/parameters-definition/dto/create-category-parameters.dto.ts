import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ParameterType } from '@prisma/client';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateParametersDefinitionDto {
  @ApiProperty({example: 'Fabric Length'})
  @IsString()
  @IsNotEmpty()
  declare name: string; // DB name: 'color', 'size'

  @ApiProperty({example: 'fabric-length'})
  @IsString()
  @IsNotEmpty()
  declare label: string; // UI label: 'Product Color', 'Screen Size'

  @ApiProperty({enum: ParameterType})
  @IsNotEmpty()
  @IsEnum(ParameterType, {
    message:
      'Invalid parameter type. Options: TEXT, NUMBER, SELECT, CHECKBOX, DATE, TEXTAREA',
  })
  declare type: ParameterType;

  @ApiPropertyOptional()
  @IsArray({ message: 'Options must be an array.' })
  @IsOptional()
  declare options?: string[]; // If type is select, e.g. 'Red,Blue,Green'

  @ApiPropertyOptional({example: false})
  @IsBoolean()
  @IsOptional()
  declare isRequired?: boolean;

  @ApiPropertyOptional({example: 5})
  @IsInt()
  @IsOptional()
  declare orderBy?: number;

  @ApiProperty({example: 3, description: 'Which category this belongs to'})
  @IsInt()
  @IsNotEmpty()
  declare categoryId: number;
}
