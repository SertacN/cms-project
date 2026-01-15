import { ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CategoriesService } from '../categories/categories.service';
import { CreatePostDto, EditPostDto, GetAllPostDto, GetPostBySefDto } from './dto';
import { generateUniqueUrl, getByIdentifier } from 'src/common/utils';
import { ApiResponse, Pagination, Public } from 'src/common/types';
import { Content } from '@prisma/client';

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly categoriesService: CategoriesService,
  ) {}

  // Admin
  async createPost(dto: CreatePostDto): Promise<ApiResponse<Public<Content>>> {
    const categoryExist = await this.categoriesService.getCategoryDetails(dto.categoryId);
    if (!categoryExist) {
      throw new NotFoundException(`${dto.categoryId} ID'li Kategori Bulunamadı`);
    }
    const sefUrl = await generateUniqueUrl(dto.title, this.prisma.content);
    try {
      const result = await this.prisma.content.create({
        data: {
          ...dto,
          sefUrl: sefUrl,
        },
        select: {
          id: true,
          title: true,
          summary: true,
          content: true,
          sefUrl: true,
          orderBy: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          categoryId: true,
        },
      });
      return {
        success: true,
        message: 'İçerik Başarıyla Oluşturuldu',
        data: result,
      };
    } catch (error) {
      throw new InternalServerErrorException(`İçerik oluşturulurken teknik bir hata oluştu: ${error.message}`);
    }
  }

  async getAllPostsAdmin(pagination: Pagination, postDto: GetAllPostDto) {
    const [contents, total] = await Promise.all([
      this.prisma.content.findMany({
        skip: pagination.skip,
        take: pagination.take,
        where: { isDeleted: false, categoryId: postDto.categoryId },
        orderBy: [{ orderBy: 'asc' }, { createdAt: 'desc' }],
        select: {
          id: true,
          title: true,
          sefUrl: true,
          isActive: true,
          orderBy: true,
          categoryId: true,
        },
      }),
      this.prisma.content.count({
        where: { isDeleted: false, categoryId: postDto.categoryId }, // Filter count
      }),
    ]);
    return {
      success: true,
      message: 'Content Fetched successfully',
      data: contents,
      meta: {
        total,
      },
    };
  }

  async getPostById(postId: number): Promise<ApiResponse<Content>> {
    const content = await this.prisma.content.findFirst({
      where: {
        id: postId,
        isDeleted: false,
      },
      include: {
        category: false,
        files: true,
        parameters: {
          include: {
            definition: true,
          },
        },
      },
    });

    if (!content) {
      throw new NotFoundException('Content not found');
    }

    return {
      success: true,
      message: `${postId} ID'li içerik bilgileri başarıyla çekildi`,
      data: content,
    };
  }

  async editPostById(postId: number, dto: EditPostDto): Promise<ApiResponse<Content>> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const content = await tx.content.findUnique({
          where: {
            id: postId,
          },
        });
        if (!content) throw new NotFoundException('Content not found');
        const categoryChanged = dto.categoryId && dto.categoryId !== content.categoryId;
        if (dto.title) {
          const finalUrl = await generateUniqueUrl(dto.title, this.prisma.content);
          dto.sefUrl = finalUrl;
        }
        const updated = await tx.content.update({
          where: {
            id: postId,
          },
          data: dto,
        });

        // Kategori değiştiyse parametreleri sil
        if (categoryChanged) {
          await tx.contentParameterValue.deleteMany({
            where: {
              contentId: postId,
            },
          });
        }

        return {
          success: true,
          message: `${postId} ID'li içerik başarıyla güncellendi`,
          data: updated,
        };
      });
    } catch (error) {
      // Prisma foreign key veya unique hatalar
      if (error.code === 'P2002') {
        throw new ConflictException('SefUrl zaten mevcut. Lütfen farklı bir sefUrl girin.');
      }
      if (error.code === 'P2003') {
        throw new NotFoundException('Geçersiz categoryId gönderdiniz.');
      }

      // Diğer tüm hatalar için generic Internal Server Error
      throw new NotFoundException(error.message);
    }
  }

  async deletePostById(postId: number): Promise<ApiResponse<Content>> {
    const result = await this.prisma.content.updateMany({
      where: {
        id: postId,
        isDeleted: false,
      },
      data: {
        isDeleted: true,
        isActive: false,
        deletedAt: new Date(),
      },
    });

    if (result.count === 0) {
      throw new NotFoundException(`${postId}' ID'li kayıt bulunamadı`);
    }

    return {
      success: true,
      message: `${postId}' ID'li kayıt başarıyla silindi.`,
    };
  }

  // Public
  async getAllPosts(pagination: Pagination, postDto: GetAllPostDto): Promise<ApiResponse<Public<Content>[]>> {
    const [contents, total] = await Promise.all([
      this.prisma.content.findMany({
        skip: pagination.skip,
        take: pagination.take,
        where: { isDeleted: false, categoryId: postDto.categoryId, isActive: true },
        orderBy: [{ orderBy: 'asc' }, { createdAt: 'desc' }],
        select: {
          id: true,
          title: true,
          summary: true,
          content: true,
          sefUrl: true,
          isActive: true,
          orderBy: true,
          createdAt: true,
          updatedAt: true,
          categoryId: true,
        },
      }),
      this.prisma.content.count({
        where: { isDeleted: false, categoryId: postDto.categoryId, isActive: true }, // Filter count
      }),
    ]);
    return {
      success: true,
      message: 'Content Fetched successfully',
      data: contents,
      meta: {
        total,
      },
    };
  }

  async getPostDetails(identifier: number | string): Promise<ApiResponse<Public<Content>>> {
    const post = await this.prisma.content.findFirst({
      where: getByIdentifier(identifier, { isDeleted: false, isActive: true }),
      select: {
        id: true,
        title: true,
        content: true,
        summary: true,
        sefUrl: true,
        orderBy: true,
        isActive: true,
        categoryId: true,
        category: true,
        parameters: true,
        files: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!post) {
      throw new NotFoundException(`${identifier} İçeriği bulunamadı`);
    }

    return {
      success: true,
      message: `${identifier} İçerik Bilgileri Başarıyla Çekildi`,
      data: post,
    };
  }
}
