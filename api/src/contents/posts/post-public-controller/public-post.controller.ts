import { Body, Controller, Get, Param, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiKeyGuard } from 'src/common/guards';
import { PostsService } from '../posts.service';
import { GetAllPostDto } from '../dto';
import { type Pagination, Public, ServiceResponse } from 'src/common/types';
import { Content } from '@prisma/client';
import { parseIdentifier } from 'src/common/utils';
import { PaginationInterceptor } from 'src/common/interceptors';
import { PaginationParam } from 'src/common/decorators';
import { HttpCacheInterceptor } from 'src/common/interceptors/http-cache.interceptor';
import { CacheTTL } from '@nestjs/cache-manager';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Public Post API')
@UseGuards(ApiKeyGuard)
@Controller('contents/posts')
@UseInterceptors(HttpCacheInterceptor)
export class PublicPostController {
  constructor(private readonly postService: PostsService) {}

  @ApiOperation({summary: 'Get all posts'})
  @UseInterceptors(PaginationInterceptor)
  @Get()
  async getAllPosts(
    @PaginationParam() pagination: Pagination,
    @Body() postDto: GetAllPostDto,
  ): Promise<ServiceResponse<Public<Content>[]>> {
    return this.postService.getAllPosts(pagination, postDto);
  }

  @ApiOperation({summary: 'Get post By ID or URL'})
  @Get(':identifier')
  @CacheTTL(900000)
  async getPostDetils(@Param('identifier') identifier: string) {
    const parsedIdentifier = parseIdentifier(identifier);
    return this.postService.getPostDetails(parsedIdentifier);
  }
}
