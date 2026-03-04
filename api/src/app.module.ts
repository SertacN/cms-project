import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { envValidationSchema } from './config/env.validation';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProjectModule } from './project/project.module';
import { ContentsModule } from './contents/contents.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { WinstonModule } from 'nest-winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import winston from 'winston';
import { utilities as nestWinstonModuleUtilites } from 'nest-winston';
import { CacheModule } from '@nestjs/cache-manager';
import { SettingsModule } from './settings/settings.module';
import KeyvRedis from '@keyv/redis';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),
    PrismaModule,
    AuthModule,
    ProjectModule,
    ContentsModule,
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'), // proje köküne göre
      serveRoot: '/uploads',
      serveStaticOptions: {
        index: false,
      },
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000, // 1 dakika
          limit: 100, // 100 istek
        },
      ],
    }),
    WinstonModule.forRoot({
      transports: [
        // Console loglar
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            nestWinstonModuleUtilites.format.nestLike('api', {
              prettyPrint: true,
              colors: true,
            }),
          ),
        }),
        // Dosya ile error loglar
        new DailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
          level: 'error',
          format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        }),
      ],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        stores: new KeyvRedis('redis://localhost:6379'),
        ttl: Number(configService.get('CACHE_TTL')),
      }),
      inject: [ConfigService],
    }),
    SettingsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
