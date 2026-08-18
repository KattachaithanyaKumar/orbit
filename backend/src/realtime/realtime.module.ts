import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RealTimeGateway } from './realtime.gateway';

@Module({
  imports: [UsersModule],
  providers: [JwtService, RealTimeGateway, JwtAuthGuard],
  exports: [RealTimeGateway],
})
export class RealTimeModule {}