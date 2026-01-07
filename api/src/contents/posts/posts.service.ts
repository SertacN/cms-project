import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CategoriesService } from '../categories/categories.service';
import { CreatePostDto } from './dto';
import { generateUniqueUrl } from 'src/common/utils';
import { ApiResponse, Public } from 'src/common/types';
import { Content } from '@prisma/client';

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly categoriesService: CategoriesService,
  ) {}

  async createPost(dto: CreatePostDto): Promise<ApiResponse<Public<Content>>> {
    const categoryExist = await this.categoriesService.getCategoryById(
      dto.categoryId,
    );
    if (!categoryExist) {
      throw new NotFoundException(
        `${dto.categoryId} ID'li Kategori Bulunamadı`,
      );
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
      throw new InternalServerErrorException(
        `İçerik oluşturulurken teknik bir hata oluştu: ${error.message}`,
      );
    }
  }

  async getAllPost() {
    return 'get all post service';
  }

  async getPostById() {
    return 'get post by id service';
  }

  async updatePostById() {
    return 'update post by id service';
  }

  async deletePostById() {
    return 'delete post by id service';
  }
}
