import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CategoriesService } from '../categories/categories.service';
import { CreatePostDto, EditPostDto, GetAllPostDto, UpdateStatusDto } from './dto';
import { generateUniqueUrl, getByIdentifier } from 'src/common/utils';
import { ServiceResponse, Pagination, Public } from 'src/common/types';
import { Content, ContentStatus, Prisma } from '@prisma/client';

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly categoriesService: CategoriesService,
  ) {}

  // All error using Global Exception Filter with Winston
  // Admin
  async createPost(dto: CreatePostDto): Promise<ServiceResponse<Public<Content>>> {
    // getCategoryDetails içerisinde NotFoundException mevcut
    await this.categoriesService.getCategoryDetails(dto.categoryId);
    const sefUrl = await generateUniqueUrl(dto.title, this.prisma.content);
    const result = await this.prisma.content.create({
      data: {
        ...dto,
        sefUrl,
        status: ContentStatus.DRAFT,
      },
      select: {
        id: true,
        title: true,
        summary: true,
        content: true,
        sefUrl: true,
        orderBy: true,
        status: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        categoryId: true,
      },
    });
    return {
      message: 'İçerik başarıyla oluşturuldu (Taslak)',
      data: result,
    };
  }

  async getAllPostsAdmin(pagination: Pagination, query: GetAllPostDto): Promise<ServiceResponse<any[]>> {
    const where: Prisma.ContentWhereInput = {
      isDeleted: false,
      ...(query.categoryId && { categoryId: query.categoryId }),
      ...(query.status && { status: query.status }),
    };

    const [contents, total] = await Promise.all([
      this.prisma.content.findMany({
        skip: pagination.skip,
        take: pagination.take,
        where,
        orderBy: [{ orderBy: 'asc' }, { createdAt: 'desc' }],
        select: {
          id: true,
          title: true,
          sefUrl: true,
          status: true,
          isActive: true,
          orderBy: true,
          categoryId: true,
          category: { select: { id: true, title: true, sefUrl: true } },
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.content.count({ where }),
    ]);

    return {
      message: 'İçerikler başarıyla getirildi',
      data: contents,
      meta: { total },
    };
  }

  async getPostById(postId: number): Promise<ServiceResponse<Content>> {
    const content = await this.prisma.content.findFirst({
      where: { id: postId, isDeleted: false },
      include: {
        category: false,
        files: { where: { deletedAt: null } },
        parameters: { include: { definition: true } },
      },
    });
    if (!content) throw new NotFoundException('Content not found');
    return {
      message: `${postId} ID'li içerik bilgileri başarıyla çekildi`,
      data: content,
    };
  }

  async editPostById(postId: number, dto: EditPostDto): Promise<ServiceResponse<Content>> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const content = await tx.content.findUnique({ where: { id: postId } });
        if (!content) throw new NotFoundException('Content Bulunamadı.');

        const categoryChanged = dto.categoryId && dto.categoryId !== content.categoryId;
        if (dto.title) {
          const finalUrl = await generateUniqueUrl(dto.title, tx.content);
          dto.sefUrl = finalUrl;
        }
        const updated = await tx.content.update({ where: { id: postId }, data: dto });

        // Kategori değiştiyse parametreleri sil
        if (categoryChanged) {
          await tx.contentParameterValue.deleteMany({ where: { contentId: postId } });
        }

        return {
          message: `${postId} ID'li içerik başarıyla güncellendi`,
          data: updated,
        };
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') throw new ConflictException('SefUrl zaten mevcut.');
        if (error.code === 'P2003') throw new NotFoundException('Geçersiz categoryId gönderdiniz.');
      }
      throw error;
    }
  }

  async updatePostStatus(postId: number, dto: UpdateStatusDto): Promise<ServiceResponse<any>> {
    const content = await this.prisma.content.findFirst({
      where: { id: postId, isDeleted: false },
    });
    if (!content) throw new NotFoundException(`${postId} ID'li içerik bulunamadı`);

    const updated = await this.prisma.content.update({
      where: { id: postId },
      data: { status: dto.status },
      select: {
        id: true, title: true, sefUrl: true, status: true,
        isActive: true, categoryId: true, updatedAt: true,
      },
    });

    return {
      message: `İçerik durumu ${dto.status} olarak güncellendi`,
      data: updated,
    };
  }

  async deletePostById(postId: number): Promise<ServiceResponse<Public<Content>>> {
    const result = await this.prisma.content.updateMany({
      where: { id: postId, isDeleted: false },
      data: { isDeleted: true, isActive: false, deletedAt: new Date() },
    });
    if (result.count === 0) throw new NotFoundException(`${postId} ID'li kayıt bulunamadı`);
    return { message: `${postId} ID'li kayıt başarıyla silindi.` };
  }

  // Public — sadece PUBLISHED içerikler
  async getAllPosts(pagination: Pagination, query: GetAllPostDto): Promise<ServiceResponse<any[]>> {
    const where: Prisma.ContentWhereInput = {
      isDeleted: false,
      status: ContentStatus.PUBLISHED,
      ...(query.categoryId && { categoryId: query.categoryId }),
    };

    const [contents, total] = await Promise.all([
      this.prisma.content.findMany({
        skip: pagination.skip,
        take: pagination.take,
        where,
        orderBy: [{ orderBy: 'asc' }, { createdAt: 'desc' }],
        select: {
          id: true,
          title: true,
          summary: true,
          sefUrl: true,
          status: true,
          isActive: true,
          orderBy: true,
          createdAt: true,
          updatedAt: true,
          categoryId: true,
          files: { where: { isActive: true, deletedAt: null, isThumbnail: true } },
        },
      }),
      this.prisma.content.count({ where }),
    ]);

    return {
      message: 'İçerikler başarıyla getirildi',
      data: contents,
      meta: { total },
    };
  }

  async getPostDetails(identifier: number | string): Promise<ServiceResponse<Public<Content>>> {
    const post = await this.prisma.content.findFirst({
      where: getByIdentifier(identifier, { isDeleted: false, isActive: true }),
      select: {
        id: true,
        title: true,
        content: true,
        summary: true,
        sefUrl: true,
        status: true,
        orderBy: true,
        isActive: true,
        categoryId: true,
        category: true,
        parameters: true,
        files: { where: { isActive: true, deletedAt: null } },
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!post) throw new NotFoundException(`${identifier} İçeriği bulunamadı`);
    return {
      message: `${identifier} İçerik Bilgileri Başarıyla Çekildi`,
      data: post,
    };
  }
}
