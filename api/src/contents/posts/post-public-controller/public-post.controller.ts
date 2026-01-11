import { Body, Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from 'src/common/guards';
import { PostsService } from '../posts.service';
import { CreatePostDto, GetAllPostDto } from '../dto';
import { ApiResponse, Public } from 'src/common/types';
import { Content } from '@prisma/client';
import { PaginationDto } from 'src/common/dto';

@UseGuards(ApiKeyGuard)
@Controller('contents/posts')
export class PublicPostController {
  constructor(private readonly postService: PostsService) {}

  @Get()
  async getAllPosts(
    @Query() paginationDto: PaginationDto,
    @Body() postDto: GetAllPostDto,
  ): Promise<ApiResponse<Public<Content>[]>> {
    return this.postService.getAllPosts(paginationDto, postDto);
  }
}
