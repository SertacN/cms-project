import { Body, Controller, ForbiddenException, HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';
import { AccessTokenResponse, AuthDto } from './dto';
import { AuthService } from './auth.service';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Cookies, GetUser } from '../common/decorators';
import { JwtGuard } from './guard';
import { Throttle } from '@nestjs/throttler';
import { clearAuthCookies, setAuthCookies } from './common';
import { ApiTags,ApiOperation,ApiResponse } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private config: ConfigService,
  ) {}
  
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, type: AuthDto })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  @Throttle({ default: { limit: 5, ttl: 300000 } })
  @Post('register')
  register(@Body() dto: AuthDto) {
    return this.authService.register(dto);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, type: AuthDto })
  @ApiResponse({ status: 401, description: 'Invalid email or password' })
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  async login(@Body() dto: AuthDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.login(dto);
    setAuthCookies(res, tokens, this.config);
    return { success: 1, message: 'Login successful' };
  }
  
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Logout (revoke refresh token)' })
  @ApiResponse({ status: 204, description: 'Successfully logged out' })
  @Post('logout')
  async logout(@GetUser('id') userId: number, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(userId);

    // Clear both cookies
    clearAuthCookies(res, this.config);
    return { success: 1, message: 'Logout successful' };
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, type: AccessTokenResponse })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  @Post('refresh')
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
