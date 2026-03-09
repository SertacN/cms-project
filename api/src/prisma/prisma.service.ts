import { Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { Prisma, PrismaClient } from '@prisma/client';

// Soft delete desteği olan modeller (isDeleted alanı olanlar)
const SOFT_DELETE_MODELS: Prisma.ModelName[] = [
  Prisma.ModelName.User,
  Prisma.ModelName.ContentCategory,
  Prisma.ModelName.Content,
];

const softDeleteExtension = Prisma.defineExtension({
  name: 'softDelete',
  query: {
    $allModels: {
      async findMany({ model, args, query }) {
        if (SOFT_DELETE_MODELS.includes(model as Prisma.ModelName)) {
          args.where = { ...args.where, isDeleted: false };
        }
        return query(args);
      },
      async findFirst({ model, args, query }) {
        if (SOFT_DELETE_MODELS.includes(model as Prisma.ModelName)) {
          args.where = { ...args.where, isDeleted: false };
        }
        return query(args);
      },
    },
  },
});

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });
    super({ adapter });
    // Soft delete extension'ı uygula ve genişletilmiş client'ı döndür.
    // Constructor'da nesne döndürmek JavaScript'te geçerlidir;
    // NestJS DI tüm injection noktalarına bu genişletilmiş client'ı enjekte eder.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.$extends(softDeleteExtension) as unknown as PrismaService;
  }
}
