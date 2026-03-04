import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({example: 'My First Blog Post'})
  @IsString()
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  @IsNotEmpty()
  declare title: string;

  @ApiProperty({example: 1})
  @IsInt()
  @IsNotEmpty()
  declare categoryId: number;

  @ApiPropertyOptional({example: 'Short description'})
  @IsString()
  @IsOptional()
  declare summary?: string;

  @ApiPropertyOptional({example: 'Long description'})
  @IsString()
  @IsOptional()
  declare content?: string;
  
  @ApiPropertyOptional({example: true})
  @IsBoolean()
  @IsOptional()
  declare isActive?: boolean;

  @ApiPropertyOptional({example: 5})
  @IsInt()
  @IsOptional()
  declare orderBy?: number;
}
