import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CategoriesModule } from '../categories/categories.module';
import { AdminPostController } from './post-admin-controller/admin-post.controller';
import { PublicPostController } from './post-public-controller/public-post.controller';

@Module({
  providers: [PostsService],
  controllers: [AdminPostController, PublicPostController],
  imports: [CategoriesModule],
  exports: [PostsService],
})
export class PostsModule {}
