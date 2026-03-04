import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsInt } from 'class-validator';

export class UpdateFileOrderDto {
  @ApiProperty()
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  declare fileIds: number[];
}
