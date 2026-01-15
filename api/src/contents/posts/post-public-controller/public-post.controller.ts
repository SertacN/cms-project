import { Body, Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from 'src/common/guards';
import { PostsService } from '../posts.service';
import { GetAllPostDto, GetPostBySefDto } from '../dto';
import { ApiResponse, Public } from 'src/common/types';
import { Content } from '@prisma/client';
import { PaginationDto } from 'src/common/dto';
import { parseIdentifier } from 'src/common/utils';

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

  @Get(':identifier')
  async getPostDetils(@Param('identifier') identifier: string) {
    const parsedIdentifier = parseIdentifier(identifier);
    return this.postService.getPostDetails(parsedIdentifier);
  }
}
