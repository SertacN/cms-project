import {
  BadRequestException,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtGuard } from 'src/auth/guard';
import { ApiKeyGuard, RolesGuard } from 'src/common/guards';
import { Roles } from 'src/common/decorators';
import { ContentFile, Role } from '@prisma/client';
import { ApiResponse } from 'src/common/types';

@UseGuards(JwtGuard, ApiKeyGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('contents/files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  // Upload files
  @Post(':id')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 9 * 1024 * 1024, // 9MB
      },
      fileFilter: (req, file, callback) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'application/pdf'];

        if (!allowedMimeTypes.includes(file.mimetype)) {
          return callback(new BadRequestException('Desteklenmeyen dosya türü'), false);
        }

        callback(null, true);
      },
    }),
  )
  async uploadContentFile(
    @Param('id', ParseIntPipe) contentId: number,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ApiResponse<ContentFile>> {
    if (!file) {
      throw new BadRequestException('Dosya bulunamadı');
    }
    return this.filesService.uploadFile(contentId, file);
  }

  @Post('thumbnail/:fileId/:contentId')
  async setThumbnail(
    @Param('fileId', ParseIntPipe) fileId: number,
    @Param('contentId', ParseIntPipe) contentId: number,
  ): Promise<ApiResponse<ContentFile>> {
    return this.filesService.setThumbnail(fileId, contentId);
  }
}
