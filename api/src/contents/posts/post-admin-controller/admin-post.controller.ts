import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Content, Role } from '@prisma/client';
import { JwtGuard } from 'src/auth/guard';
import { PaginationParam, Roles } from 'src/common/decorators';
import { ApiKeyGuard, RolesGuard } from 'src/common/guards';
import { CreatePostDto, EditPostDto, GetAllPostDto } from '../dto';
import { type Pagination, Public, ServiceResponse } from 'src/common/types';
import { PostsService } from '../posts.service';
import { PaginationInterceptor } from 'src/common/interceptors';

@UseGuards(JwtGuard, ApiKeyGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('contents/posts/admin')
export class AdminPostController {
  constructor(private postService: PostsService) {}
  @Post()
  async createPost(@Body() dto: CreatePostDto): Promise<ServiceResponse<Public<Content>>> {
    return this.postService.createPost(dto);
  }

  @UseInterceptors(PaginationInterceptor)
  @Get()
  async getAllPostsAdmin(@PaginationParam() pagination: Pagination, @Body() postDto: GetAllPostDto) {
    return this.postService.getAllPostsAdmin(pagination, postDto);
  }

  @Get(':id')
  async getPostById(@Param('id', ParseIntPipe) postId: number): Promise<ServiceResponse<Content>> {
    return this.postService.getPostById(postId);
  }

  @Patch(':id')
  async editPostById(
    @Param('id', ParseIntPipe) postId: number,
    @Body() dto: EditPostDto,
  ): Promise<ServiceResponse<Content>> {
    return this.postService.editPostById(postId, dto);
  }

  @Delete(':id')
  async deletePostById(@Param('id', ParseIntPipe) postId: number) {
    return this.postService.deletePostById(postId);
  }
}
