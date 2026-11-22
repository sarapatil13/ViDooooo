import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { FirebaseAdminService } from './firebase-admin.service';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private readonly firebaseAdmin: FirebaseAdminService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.split('Bearer ')[1].trim();
    if (!token) {
      throw new UnauthorizedException('Bearer token missing');
    }

    const user = await this.firebaseAdmin.verifyIdToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired Firebase ID token');
    }

    request.user = user;
    return true;
  }
}
