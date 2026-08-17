import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    console.log('[JwtAuthGuard] canActivate called');
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    console.log('[JwtAuthGuard] handleRequest - err:', err?.message, 'user:', user, 'info:', info);
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
