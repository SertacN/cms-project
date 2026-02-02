import { Body, Controller, ForbiddenException, HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';
import { AuthDto } from './dto';
import { AuthService } from './auth.service';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Cookies, GetUser } from '../common/decorators';
import { JwtGuard } from './guard';
import { Throttle } from '@nestjs/throttler';
import { clearAuthCookies, setAuthCookies } from './common';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private config: ConfigService,
  ) {}
  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 300000 } })
  register(@Body() dto: AuthDto) {
    return this.authService.register(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  async login(@Body() dto: AuthDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.login(dto);
    setAuthCookies(res, tokens, this.config);
    return { success: 1, message: 'Login successful' };
  }

  @UseGuards(JwtGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@GetUser('id') userId: number, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(userId);

    // Clear both cookies
    clearAuthCookies(res, this.config);
    return { success: 1, message: 'Logout successful' };
  }
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(@Cookies('refresh_token') refreshToken: string, @Res({ passthrough: true }) res: Response) {
    if (!refreshToken) {
      throw new ForbiddenException('Refresh token not found');
    }
    const tokens = await this.authService.refreshTokens(refreshToken);

    // Set new access token cookie
    setAuthCookies(res, tokens, this.config);
    return { success: 1, message: 'Tokens refreshed successfully' };
  }
}
