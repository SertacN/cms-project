import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  providers: [PostsService],
  controllers: [PostsController],
  imports: [CategoriesModule],
  exports: [PostsService],
})
export class PostsModule {}
