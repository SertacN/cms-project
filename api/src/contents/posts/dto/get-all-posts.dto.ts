import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class GetAllPostDto {
  @ApiProperty({example: 1})
  @IsInt()
  @IsNotEmpty()
  categoryId: number;
}
