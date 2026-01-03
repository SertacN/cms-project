import { Module } from '@nestjs/common';
import { CategoriesModule } from './categories/categories.module';
import { PostsModule } from './posts/posts.module';
import { ParametersModule } from './parameters/parameters.module';

@Module({
  imports: [CategoriesModule, PostsModule, ParametersModule],
})
export class ContentsModule {}

/*
1. Kategori Modülü (categories.module.ts)
Bu modül sadece kategorilere odaklanır ve servisini dışarıya açar (export).

2. Post Modülü (posts.module.ts)
Bu modül sadece postlara odaklanır ve servisini dışarıya açar (export).

3. İçerik Modülü (contents.module.ts)
Bu modül kategorileri ve postları bir araya getirir ve dışarıya servisleri açar.
*/
