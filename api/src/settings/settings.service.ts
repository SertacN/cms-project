import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { type Cache } from 'cache-manager';
import { ServiceResponse } from 'src/common/types';

@Injectable()
export class SettingsService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  // Redis Clear Cache
  async clearCache(): Promise<ServiceResponse> {
    const REDIS_TIMEOUT_MS = 3000;
    try {
      await Promise.race([
        this.cacheManager.clear(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Redis Timeout')), REDIS_TIMEOUT_MS)),
      ]);

      return { message: 'Cache temizlendi.' };
    } catch {
      throw new InternalServerErrorException('Cache temizlenemedi: Redis yanıt vermiyor.');
    }
  }
}
