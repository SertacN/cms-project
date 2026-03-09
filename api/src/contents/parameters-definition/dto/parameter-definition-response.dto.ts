import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ParameterType } from '@prisma/client';

export class ParameterDefinitionResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'color' })
  name: string;

  @ApiProperty({ example: 'Product Color' })
  label: string;

  @ApiProperty({ enum: ParameterType, example: ParameterType.TEXT })
  type: ParameterType;

  @ApiPropertyOptional({ type: [String], example: ['Red', 'Blue', 'Green'] })
  options: string[] | null;

  @ApiProperty({ example: false })
  isRequired: boolean;

  @ApiProperty({ example: 0 })
  orderBy: number;

  @ApiProperty({ example: 1 })
  categoryId: number;
}
