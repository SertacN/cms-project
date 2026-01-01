import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly categoriesService: CategoriesService,
  ) {}

  async createPost() {
    return 'create post service';
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
