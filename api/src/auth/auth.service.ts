import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AuthDto, UserResponseDto } from './dto';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/wasm-compiler-edge';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}
  async register(dto: AuthDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
        },
      });
      return {
        message: 'User created successfully',
        data: plainToInstance(UserResponseDto, user),
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
      throw error;
    }
  }
  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshToken: null, // DB’den refresh token kaldır
      },
    });
    return true;
  }
  async login(dto: AuthDto): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (!user) {
      throw new NotFoundException('User Not Found');
    }
    const pwMatch = await bcrypt.compare(dto.password, user.password);
    if (!pwMatch) {
      throw new ForbiddenException('Credentials incorrect');
    }
    // Generate token
    const tokens = await this.getTokens(user.id, user.email);
    // Store hashed refresh token
    await this.updateRefreshToken(user.id, tokens.refresh_token, user.updatedAt);
    return tokens;
  }
  private async getTokens(userId: string, email: string): Promise<{ access_token: string; refresh_token: string }> {
    const payload = { sub: userId, email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: this.config.get('JWT_EXPIRES_IN'),
      }),
      this.jwt.signAsync(payload, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN'),
      }),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
  private async updateRefreshToken(userId: string, refreshToken: string, currentUpdatedAt: Date) {
    // Hash refresh token before storing
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshToken: hash,
        updatedAt: currentUpdatedAt,
      },
    });
  }
  async refreshTokens(refreshToken: string) {
    try {
      // Verify refresh token
      const payload = await this.jwt.verifyAsync<{
        sub: string;
        email: string;
      }>(refreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new ForbiddenException('Access Denied');
      }

      // Since refreshToken is optional in the schema, use type assertion
      const storedToken = user.refreshToken;
      if (!storedToken) {
        throw new ForbiddenException('Access Denied');
      }

      // Validate stored refresh token
      const refreshTokenMatches = await bcrypt.compare(refreshToken, storedToken);

      if (!refreshTokenMatches) {
        // Possible token reuse - revoke all tokens for security
        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            refreshToken: null,
          },
        });
        throw new ForbiddenException('Access Denied');
      }

      // Generate new tokens
      const tokens = await this.getTokens(user.id, user.email);
      // Update refresh token
      await this.updateRefreshToken(user.id, tokens.refresh_token, user.updatedAt);

      return tokens;
    } catch (error) {
      throw new ForbiddenException('Access Denied');
    }
  }
}
