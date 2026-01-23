import { ArrayNotEmpty, IsArray, IsInt } from 'class-validator';

export class UpdateFileOrderDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  fileIds: number[];
}
