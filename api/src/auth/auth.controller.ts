import {
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthDto } from './dto';
import { AuthService } from './auth.service';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Cookies, GetUser } from '../common/decorators';
import { JwtGuard } from './guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private config: ConfigService,
  ) {}
  @Post('register')
  register(@Body() dto: AuthDto) {
    return this.authService.register(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: AuthDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.login(dto);
    res.cookie('access_token', tokens.access_token, {
      httpOnly: true, // JS erişemez
      secure: this.config.get('NODE_ENV') === 'production', // development için false, production'da true
      sameSite: 'lax', // CSRF önlemi
      maxAge: 5000, // 15 dakika
    });
    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: this.config.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return { success: 1, message: 'Login successful' };
  }

  @UseGuards(JwtGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @GetUser('id') userId: number,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(userId);

    // Clear both cookies
    res.cookie('access_token', '', { maxAge: 0 });
    res.cookie('refresh_token', '', { maxAge: 0 });

    return { success: 1, message: 'Logout successful' };
  }
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @Cookies('refresh_token') refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!refreshToken) {
      throw new ForbiddenException('Refresh token not found');
    }
    const tokens = await this.authService.refreshTokens(refreshToken);

    // Set new access token cookie
    res.cookie('access_token', tokens.access_token, {
      httpOnly: true,
      secure: this.config.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    // Set new refresh token cookie
    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: this.config.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return { success: 1, message: 'Tokens refreshed successfully' };
  }
}
