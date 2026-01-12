import { IsNotEmpty, IsString } from 'class-validator';

export class GetPostBySefDto {
  @IsString()
  @IsNotEmpty()
  categorySef: string;

  @IsString()
  @IsNotEmpty()
  postSef: string;
}
