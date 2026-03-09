import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ContentFile } from '@prisma/client';
import { fromBuffer } from 'file-type';
import { randomUUID } from 'crypto';
import path from 'path';
import { ServiceResponse } from 'src/common/types';
import { deleteFileFromDisk, getFileTypeFromMime, saveFileToDisk } from 'src/common/utils';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateFileOrderDto } from './dto';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'application/pdf'] as const;

@Injectable()
export class FilesService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  // All error using Global Exception Filter with Winston
  async uploadFile(contentId: number, file: Express.Multer.File): Promise<ServiceResponse<ContentFile>> {
    // 1. Dosya boyutu kontrolü (env'den konfigüre edilebilir)
    const maxSizeMB = this.configService.get<number>('FILE_MAX_SIZE_MB', 9);
    if (file.size > maxSizeMB * 1024 * 1024) {
      throw new BadRequestException(`Dosya boyutu ${maxSizeMB}MB sınırını aşıyor`);
    }

    // 2. Magic bytes doğrulaması — gerçek MIME type kontrolü (spoofing önleme)
    const detectedType = await fromBuffer(file.buffer);
    if (!detectedType || !ALLOWED_MIME_TYPES.includes(detectedType.mime as (typeof ALLOWED_MIME_TYPES)[number])) {
      throw new BadRequestException('Dosya içeriği desteklenmiyor veya zararlı olabilir');
    }
    if (detectedType.mime !== file.mimetype) {
      throw new BadRequestException('Dosya türü uyuşmazlığı: bildirilen MIME gerçek içerikle eşleşmiyor');
    }

    // 3. Content var mı?
    const content = await this.prisma.content.findUnique({
      where: {
        id: contentId,
      },
    });
    if (!content) {
      throw new NotFoundException(`${contentId} ID'li içerik bulunamadı`);
    }
    // 4. type belirle (IMAGE / VIDEO / DOCUMENT)
    const fileType = getFileTypeFromMime(file.mimetype);
    // 5. fileName üret (uuid)
    const extension = path.extname(file.originalname);
    const fileName = `${randomUUID()}${extension}`;
    // 6. Disk path hesapla
    const destination = `uploads/content/${contentId}`;
    const relativePath = `${destination}/${fileName}`;
    try {
      // 7. diske yaz
      saveFileToDisk(file.buffer, fileName, destination);

      // 8. db kaydı
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

  async setThumbnail(contentId: number, fileId: number): Promise<ServiceResponse<ContentFile>> {
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
      message: 'Thumbnail başarıyla ayarlandı',
    };
  }

  // Drag & Drop uyumlu fileIds: [3,1,2]
  async updateFileOrder(contentId: number, dto: UpdateFileOrderDto): Promise<ServiceResponse<ContentFile>> {
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
      message: 'Dosya sıralaması güncellendi',
    };
  }

  async deleteFile(contentId: number, fileId: number): Promise<ServiceResponse<ContentFile>> {
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
      message: 'Dosya başarıyla silindi',
    };
  }
}
