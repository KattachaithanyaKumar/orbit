import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { WorkspaceMember } from '../permissions/entities/workspace-member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, WorkspaceMember])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
