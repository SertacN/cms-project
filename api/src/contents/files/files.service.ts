import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ContentFile } from '@prisma/client';
import { randomUUID } from 'crypto';
import path from 'path';
import { ApiResponse } from 'src/common/types';
import { deleteFileFromDisk, getFileTypeFromMime, saveFileToDisk } from 'src/common/utils';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateFileOrderDto } from './dto';

@Injectable()
export class FilesService {
  constructor(private prisma: PrismaService) {}

  // All error using Global Exception Filter with Winston
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
      // Winston hatayı yakalıyor
      throw error;
    }
  }

  async setThumbnail(contentId: number, fileId: number): Promise<ApiResponse<ContentFile>> {
    const file = await this.prisma.contentFile.findUnique({
      where: {
        id: fileId,
        deletedAt: null,
        isActive: true,
      },
    });
    if (!file || file.contentId !== contentId) {
      throw new NotFoundException('Dosya bulunamadı veya içerik uyuşmuyor');
    }
    // true olan varsa onları false yap ki her zaman tek bir thumbnail olsun
    await this.prisma.contentFile.updateMany({
      where: {
        contentId,
        isThumbnail: true,
      },
      data: {
        isThumbnail: false,
      },
    });
    // thumbnail güncelle
    await this.prisma.contentFile.update({
      where: {
        id: fileId,
      },
      data: {
        isThumbnail: true,
      },
    });

    return {
      success: true,
      message: 'Thumbnail başarıyla ayarlandı',
    };
  }

  // Drag & Drop uyumlu fileIds: [3,1,2]
  async updateFileOrder(contentId: number, dto: UpdateFileOrderDto): Promise<ApiResponse<ContentFile>> {
    const files = await this.prisma.contentFile.findMany({
      where: {
        contentId,
        id: { in: dto.fileIds },
        isActive: true,
        deletedAt: null,
      },
    });

    if (files.length !== dto.fileIds.length) {
      throw new BadRequestException('Bazı dosyalar bu içeriğe ait değil');
    }
    // transaction -> yarım kalmış sıralama olamaz
    await this.prisma.$transaction(
      dto.fileIds.map((fileId, index) =>
        this.prisma.contentFile.update({
          where: { id: fileId },
          data: { orderBy: index },
        }),
      ),
    );

    return {
      success: true,
      message: 'Dosya sıralaması güncellendi',
    };
  }

  async deleteFile(contentId: number, fileId: number): Promise<ApiResponse<ContentFile>> {
    // 1. Dosya var mı & bu content’e mi ait?
    const file = await this.prisma.contentFile.findFirst({
      where: {
        id: fileId,
        contentId,
        isActive: true,
        deletedAt: null,
      },
    });

    if (!file) {
      throw new NotFoundException('Dosya bulunamadı');
    }

    // 2. Diskten sil
    deleteFileFromDisk(file.path);

    // 3. Soft delete
    await this.prisma.contentFile.update({
      where: { id: fileId },
      data: {
        isActive: false,
        deletedAt: new Date(),
        isThumbnail: false,
      },
    });

    // 4. Eğer silinen dosya thumbnail ise → yenisini ata
    if (file.isThumbnail) {
      const nextThumbnail = await this.prisma.contentFile.findFirst({
        where: {
          contentId,
          isActive: true,
          deletedAt: null,
        },
        orderBy: {
          orderBy: 'asc',
        },
      });

      if (nextThumbnail) {
        await this.prisma.contentFile.update({
          where: { id: nextThumbnail.id },
          data: { isThumbnail: true },
        });
      }
    }

    return {
      success: true,
      message: 'Dosya başarıyla silindi',
    };
  }
}
