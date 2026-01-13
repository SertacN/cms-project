import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Content, Role } from '@prisma/client';
import { JwtGuard } from 'src/auth/guard';
import { Roles } from 'src/common/decorators';
import { ApiKeyGuard, RolesGuard } from 'src/common/guards';
import { CreatePostDto, EditPostDto, GetAllPostDto } from '../dto';
import { ApiResponse, Public } from 'src/common/types';
import { PostsService } from '../posts.service';
import { PaginationDto } from 'src/common/dto';

@UseGuards(JwtGuard, ApiKeyGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('contents/posts/admin')
export class AdminPostController {
  constructor(private postService: PostsService) {}
  @Post()
  async createPost(@Body() dto: CreatePostDto): Promise<ApiResponse<Public<Content>>> {
    return this.postService.createPost(dto);
  }

  @Get()
  async getAllPostsAdmin(@Query() paginationDto: PaginationDto, @Body() postDto: GetAllPostDto) {
    return this.postService.getAllPostsAdmin(paginationDto, postDto);
  }

  @Get(':id')
  async getPostById(@Param('id', ParseIntPipe) postId: number): Promise<ApiResponse<Content>> {
    return this.postService.getPostById(postId);
  }

  @Patch(':id')
  async editPostById(
    @Param('id', ParseIntPipe) postId: number,
    @Body() dto: EditPostDto,
  ): Promise<ApiResponse<Content>> {
    return this.postService.editPostById(postId, dto);
  }
}
