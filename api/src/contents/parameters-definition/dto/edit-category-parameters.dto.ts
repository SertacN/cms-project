import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ParameterType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class EditParameterItemDto {
  @ApiPropertyOptional({example: 3, description: 'Update if exists, otherwise create'})
  @IsOptional()
  @IsInt()
  declare id?: number;


  @ApiProperty({example: 'fabric-length'})
  @IsString()
  @IsNotEmpty()
  declare name: string;

  @ApiProperty({example: 'Fabric Length'})
  @IsString()
  @IsNotEmpty()
  declare label: string;

  @ApiProperty({enum: ParameterType})
  @IsEnum(ParameterType, {
    message:
      'Invalid parameter type. Options: TEXT, NUMBER, SELECT, CHECKBOX, DATE, TEXTAREA',
  })
  @IsNotEmpty()
  declare type: ParameterType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray({ message: 'Options must be an array.' })
  declare options?: string[];

  @ApiPropertyOptional({example: 5})
  @IsOptional()
  @IsInt()
  declare orderBy?: number;
}

export class EditCategoryParametersDto {
  @ApiProperty({ type: [EditParameterItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EditParameterItemDto)
  parameters: EditParameterItemDto[];
}
