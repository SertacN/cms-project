import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class EditPostDto {
  @ApiPropertyOptional({example: 'My First Blog Post'})
  @IsString()
  @IsOptional()
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  declare title?: string;

  @ApiPropertyOptional({example: 'Short description'})
  @IsString()
  @IsOptional()
  declare summary?: string;

  @ApiPropertyOptional({example: 'Long description'})
  @IsString()
  @IsOptional()
  declare content?: string;

  @ApiPropertyOptional({example: 'ilk-blog-yazim'})
  @IsString()
  @IsOptional()
  declare sefUrl?: string;

  @ApiPropertyOptional({example: 5})
  @IsInt()
  @IsOptional()
  declare orderBy?: number;

  @ApiPropertyOptional({example: 1})
  @IsNotEmpty()
  @IsInt()
  declare categoryId: number;

  @ApiPropertyOptional({example: true})
  @IsOptional()
  @IsBoolean()
  declare isActive?: boolean;
}
