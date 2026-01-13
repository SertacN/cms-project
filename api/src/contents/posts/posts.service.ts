import { ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CategoriesService } from '../categories/categories.service';
import { CreatePostDto, EditPostDto, GetAllPostDto, GetPostBySefDto } from './dto';
import { generateUniqueUrl } from 'src/common/utils';
import { ApiResponse, Public } from 'src/common/types';
import { Content } from '@prisma/client';
import { PaginationDto } from 'src/common/dto';

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly categoriesService: CategoriesService,
  ) {}

  // Admin
  async createPost(dto: CreatePostDto): Promise<ApiResponse<Public<Content>>> {
    const categoryExist = await this.categoriesService.getCategoryById(dto.categoryId);
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

  async getAllPostsAdmin(paginationDto: PaginationDto, postDto: GetAllPostDto) {
    const page = paginationDto.page || 1;
    const limit = paginationDto.limit || 10;
    const skip = (page - 1) * limit;

    const [contents, total] = await Promise.all([
      this.prisma.content.findMany({
        skip,
        take: limit,
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
        page,
        limit,
        lastPage: Math.ceil(total / limit),
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

  async deletePostById() {
    return 'delete post by id service';
  }

  // Public
  async getAllPosts(paginationDto: PaginationDto, postDto: GetAllPostDto): Promise<ApiResponse<Public<Content>[]>> {
    const page = paginationDto.page || 1;
    const limit = paginationDto.limit || 10;
    const skip = (page - 1) * limit;

    const [contents, total] = await Promise.all([
      this.prisma.content.findMany({
        skip,
        take: limit,
        where: { isDeleted: false, categoryId: postDto.categoryId },
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
        where: { isDeleted: false, categoryId: postDto.categoryId }, // Filter count
      }),
    ]);
    return {
      success: true,
      message: 'Content Fetched successfully',
      data: contents,
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async getPostBySefUrl(dto: GetPostBySefDto): Promise<ApiResponse<Public<Content>>> {
    const content = await this.prisma.content.findFirst({
      where: {
        sefUrl: dto.postSef,
        isActive: true,
        isDeleted: false,
        category: {
          sefUrl: dto.categorySef,
          isActive: true,
          isDeleted: false,
        },
      },
      include: {
        files: true,
        parameters: {
          include: { definition: true },
        },
      },
    });
    if (!content) {
      throw new NotFoundException(`${dto.postSef} içeriği veya ${dto.categorySef} kategorisi bulunamadı`);
    }

    const { isDeleted, deletedAt, ...contentResult } = content;
    return {
      success: true,
      message: `${dto.postSef} içeriği başarıyla çekildi`,
      data: contentResult,
    };
  }

  //TODO: GetAllContent By Category SEF
}
