import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto';
import { ApiResponse, Public } from 'src/common/types';
import { Content } from '@prisma/client';
import { JwtGuard } from 'src/auth/guard';
import { ApiKeyGuard } from 'src/common/guards';

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
}
