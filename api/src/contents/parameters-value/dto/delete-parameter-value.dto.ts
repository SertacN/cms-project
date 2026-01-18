import { IsInt, IsNotEmpty } from 'class-validator';

export class DeleteParameterValueDto {
  @IsInt()
  @IsNotEmpty()
  contentId: number;

  @IsInt()
  @IsNotEmpty()
  definationId: number;
}
