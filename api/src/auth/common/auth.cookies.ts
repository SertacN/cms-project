import { ConfigService } from '@nestjs/config';
import { msFromJwtExpires } from 'src/common/utils';
import { Response } from 'express';

export const getAccessTokenCookieOptions = (config: ConfigService) => ({
  httpOnly: true,
  secure: config.get('NODE_ENV') === 'production',
  sameSite: 'lax' as const,
  maxAge: msFromJwtExpires(config.get('JWT_EXPIRES_IN') || '15m'),
});

export const getRefreshTokenCookieOptions = (config: ConfigService) => ({
  httpOnly: true,
  secure: config.get('NODE_ENV') === 'production',
  sameSite: 'lax' as const,
  path: 'auth/refresh',
  maxAge: msFromJwtExpires(config.get('JWT_REFRESH_EXPIRES_IN') || '7d'),
});

export const setAuthCookies = (
  res: Response,
  tokens: { access_token: string; refresh_token: string },
  config: ConfigService,
) => {
  res.cookie('access_token', tokens.access_token, getAccessTokenCookieOptions(config));

  res.cookie('refresh_token', tokens.refresh_token, getRefreshTokenCookieOptions(config));
};

export const clearAuthCookies = (res: Response, config: ConfigService) => {
  res.cookie('access_token', '', {
    ...getAccessTokenCookieOptions(config),
    maxAge: 0,
  });

  res.cookie('refresh_token', '', {
    ...getRefreshTokenCookieOptions(config),
    maxAge: 0,
  });
};
