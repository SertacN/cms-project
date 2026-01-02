import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly validApiKey = process.env.API_KEY; // ENV’dan al

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key']; // Header üzerinden al

    if (!apiKey || apiKey !== this.validApiKey) {
      throw new UnauthorizedException('Invalid or missing API key');
    }

    return true;
  }
}
