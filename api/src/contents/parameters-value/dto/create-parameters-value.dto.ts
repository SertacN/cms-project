import { IsInt, IsString, IsArray, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ParameterValueItemDto {
  @ApiProperty({example: 1, description: 'Parameter definition ID'})
  @IsInt()
  @IsNotEmpty()
  declare definitionId: number;

  @ApiProperty({example: 'Red', description: 'Selected or entered value'})
  @IsString()
  @IsNotEmpty()
  declare value: string;
}

export class CreateParameterValuesDto {
  @ApiProperty({example: 1, description: 'Content ID this value belongs to'})
  @IsInt()
  @IsNotEmpty()
  declare contentId: number;

  @ApiProperty({ type: [ParameterValueItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParameterValueItemDto)
  values: ParameterValueItemDto[];
}
