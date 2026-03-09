import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class UserResponseDto {
  @ApiProperty({ example: 'uuid-v4' })
  id: string;

  @ApiProperty({ example: 'admin@cms.local' })
  email: string;

  @ApiPropertyOptional({ example: 'Sertaç' })
  firstName: string | null;

  @ApiPropertyOptional({ example: 'Can' })
  lastName: string | null;

  @ApiProperty({ enum: Role, example: Role.ADMIN })
  role: Role;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @Exclude()
  password: string;

  @Exclude()
  refreshToken: string | null;

  @Exclude()
  isDeleted: boolean;

  @Exclude()
  deletedAt: Date | null;
}
