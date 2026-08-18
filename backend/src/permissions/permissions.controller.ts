import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsService } from './permissions.service';
import { Role } from './roles.enum';

@Controller('workspaces/:workspaceId/members')
@UseGuards(JwtAuthGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  findAll(@Param('workspaceId') workspaceId: number, @Request() req) {
    return this.permissionsService.getMembers(workspaceId);
  }

  @Get('my-role')
  getMyRole(@Param('workspaceId') workspaceId: number, @Request() req) {
    return this.permissionsService.getMemberRole(workspaceId, req.user.id);
  }

  @Post()
  addMember(
    @Param('workspaceId') workspaceId: number,
    @Body() body: { userId: number; role: Role },
    @Request() req,
  ) {
    return this.permissionsService.addMember(workspaceId, body.userId, body.role);
  }

  @Patch('role')
  updateMemberRole(
    @Param('workspaceId') workspaceId: number,
    @Body() body: { userId: number; role: Role },
    @Request() req,
  ) {
    return this.permissionsService.updateMemberRole(workspaceId, body.userId, body.role);
  }

  @Delete(':userId')
  removeMember(
    @Param('workspaceId') workspaceId: number,
    @Param('userId') userId: number,
    @Request() req,
  ) {
    return this.permissionsService.removeMember(workspaceId, userId);
  }
}