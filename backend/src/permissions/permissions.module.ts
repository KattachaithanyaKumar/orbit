import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { WorkspaceMember } from './entities/workspace-member.entity';
import { Workspace } from '../workspaces/entities/workspace.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WorkspaceMember, Workspace])],
  providers: [PermissionsService],
  controllers: [PermissionsController],
  exports: [PermissionsService],
})
export class PermissionsModule {}