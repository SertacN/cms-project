import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto, GetAllPostDto } from './dto';
import { ApiResponse, Public } from 'src/common/types';
import { Content } from '@prisma/client';
import { JwtGuard } from 'src/auth/guard';
import { ApiKeyGuard } from 'src/common/guards';
import { PaginationDto } from 'src/common/dto';

@UseGuards(JwtGuard, ApiKeyGuard)
@Controller('contents/posts')
export class PostsController {
  constructor(private readonly postService: PostsService) {}

  @Post()
  async createPost(
    @Body() dto: CreatePostDto,
  ): Promise<ApiResponse<Public<Content>>> {
    return this.postService.createPost(dto);
  }

  @Get()
  async getAllPosts(
    @Query() paginationDto: PaginationDto,
    @Body() postDto: GetAllPostDto,
  ): Promise<ApiResponse<Public<Content>[]>> {
    return this.postService.getAllPost(paginationDto, postDto);
  }
}
