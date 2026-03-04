import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class DeleteParameterValueDto {
  @ApiProperty({example: 1, description: 'Content ID'})
  @IsInt()
  @IsNotEmpty()
  declare contentId: number;

  @ApiProperty({example: 1, description: 'Parameter definition ID'})
  @IsInt()
  @IsNotEmpty()
  declare definitionId: number;
}
