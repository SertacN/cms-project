import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Patch,
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
import { ServiceResponse } from 'src/common/types';
import { UpdateFileOrderDto } from './dto';

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
  ): Promise<ServiceResponse<ContentFile>> {
    if (!file) {
      throw new BadRequestException('Dosya bulunamadı');
    }
    return this.filesService.uploadFile(contentId, file);
  }

  @Post('content/:contentId/thumbnail/:fileId')
  async setThumbnail(
    @Param('contentId', ParseIntPipe) contentId: number,
    @Param('fileId', ParseIntPipe) fileId: number,
  ): Promise<ServiceResponse<ContentFile>> {
    return this.filesService.setThumbnail(contentId, fileId);
  }

  @Patch('order/:contentId')
  async updateFileOrder(@Param('contentId', ParseIntPipe) contentId: number, @Body() dto: UpdateFileOrderDto) {
    return this.filesService.updateFileOrder(contentId, dto);
  }

  @Delete('content/:contentId/file/:fileId')
  async deleteFile(@Param('contentId', ParseIntPipe) contentId: number, @Param('fileId', ParseIntPipe) fileId: number) {
    return this.filesService.deleteFile(contentId, fileId);
  }
}
