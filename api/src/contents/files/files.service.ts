import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ContentFile } from '@prisma/client';
import { randomUUID } from 'crypto';
import path from 'path';
import { ApiResponse } from 'src/common/types';
import { deleteFileFromDisk, getFileTypeFromMime, saveFileToDisk } from 'src/common/utils';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FilesService {
  constructor(private prisma: PrismaService) {}

  async uploadFile(contentId: number, file: Express.Multer.File): Promise<ApiResponse<ContentFile>> {
    // 1. Content var mı?
    const content = await this.prisma.content.findUnique({
      where: {
        id: contentId,
      },
    });
    if (!content) {
      throw new NotFoundException(`${contentId} ID'li içerik bulunamadı`);
    }
    // 2. type belirle (IMAGE / VIDEO / DOCUMENT)
    const fileType = getFileTypeFromMime(file.mimetype);
    // 3. fileName üret (uuid)
    const extension = path.extname(file.originalname);
    const fileName = `${randomUUID()}${extension}`;
    // 4. Disk path hesapla
    const destination = `uploads/content/${contentId}`;
    const relativePath = `${destination}/${fileName}`;
    try {
      // 5. diske yaz
      saveFileToDisk(file.buffer, fileName, destination);

      // 6. db kaydı
      const contentFile = await this.prisma.contentFile.create({
        data: {
          fileName,
          originalName: file.originalname,
          path: relativePath,
          mimeType: file.mimetype,
          size: file.size,
          type: fileType,
          contentId,
        },
      });

      return {
        success: true,
        message: 'Dosya oluşturuldu',
        data: contentFile,
      };
    } catch (error) {
      // ❗ rollback: diskten sil
      deleteFileFromDisk(relativePath);

      console.error('Upload rollback çalıştı:', error);

      throw new InternalServerErrorException('Dosya yüklenirken bir hata oluştu');
    }
  }
}
