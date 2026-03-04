import { Controller, Delete, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { type Cache } from 'cache-manager';
import { JwtGuard } from 'src/auth/guard';
import { Roles } from 'src/common/decorators';
import { ApiKeyGuard, RolesGuard } from 'src/common/guards';
import {  ServiceResponse } from 'src/common/types';
import { SettingsService } from './settings.service';

@UseGuards(JwtGuard, ApiKeyGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('settings')
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Delete('cache/clear')
  @HttpCode(HttpStatus.OK)
  async clearCache() {
    return this.settingsService.clearCache();
  }
}
