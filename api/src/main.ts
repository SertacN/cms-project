import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import helmet from 'helmet';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AllExceptionsFilter } from './common/filters';
import { ResponseTransformInterceptor } from './common/interceptors';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.enableCors({
    origin: configService.get<string>('FRONTEND_URL') as string,
    credentials: true,
  });
  app.use(
    session({
      secret: configService.get<string>('SESSION_SECRET') as string,
      resave: false,
      saveUninitialized: true,
      cookie: {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
      },
    }),
  );
  const isProduction = configService.get<string>('NODE_ENV') === 'production';
  app.use(helmet({ contentSecurityPolicy: isProduction ? undefined : false }));
  app.setGlobalPrefix('api');
  app.use(cookieParser());

  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);
  app.useGlobalFilters(new AllExceptionsFilter(logger));
  app.useGlobalInterceptors(new ResponseTransformInterceptor());
  if (configService.get<string>('NODE_ENV') !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Sertaç Can Dashboard API')
      .setDescription('Sertaç Can backend API documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
  }
  await app.listen(configService.get('PORT') ?? 3000);
}
bootstrap();
