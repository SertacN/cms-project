import { IsInt } from 'class-validator';

export class GetAllPostDto {
  @IsInt()
  categoryId: number;
}
