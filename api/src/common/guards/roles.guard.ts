import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Handler (metot) veya Class üzerindeki rolleri oku
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Eğer o rotada hiçbir rol tanımlanmamışsa herkes girebilir
    if (!requiredRoles) {
      return true;
    }

    // 2. Request objesini al
    const { user } = context.switchToHttp().getRequest();

    // Güvenlik Önlemi: Eğer user objesi yoksa (AuthGuard çalışmamışsa) veya rolü yoksa reddet
    if (!user || !user.role) {
      return false;
    }

    // Kullanıcının rolü, gereken rollerden biri mi?
    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      throw new ForbiddenException(
        `Bu işlem için '${requiredRoles.join(', ')}' yetkisine sahip olmanız gerekir. Mevcut rolünüz: ${user.role}`,
      );
    }

    return true;
  }
}
