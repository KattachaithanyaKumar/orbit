import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './roles.enum';
import { WorkspaceMember } from '../permissions/entities/workspace-member.entity';
import { Workspace } from '../workspaces/entities/workspace.entity';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(WorkspaceMember)
    private workspaceMembersRepo: Repository<WorkspaceMember>,
    @InjectRepository(Workspace)
    private workspacesRepo: Repository<Workspace>,
  ) {}

  async getMembers(workspaceId: number) {
    return this.workspaceMembersRepo.find({
      where: { workspace: { id: workspaceId } },
      relations: { user: true },
    });
  }

  async getMemberRole(workspaceId: number, userId: number) {
    const member = await this.workspaceMembersRepo.findOne({
      where: { workspace: { id: workspaceId }, user: { id: userId } },
    });
    return member?.role;
  }

  async addMember(workspaceId: number, userId: number, role: Role) {
    const workspace = await this.workspacesRepo.findOne({
      where: { id: workspaceId },
    });
    if (!workspace) throw new NotFoundException('Workspace not found');

    const existing = await this.workspaceMembersRepo.findOne({
      where: { workspace: { id: workspaceId }, user: { id: userId } },
    });
    if (existing) {
      throw new Error('User is already a member of this workspace');
    }

    const member = this.workspaceMembersRepo.create({
      workspace: { id: workspaceId },
      user: { id: userId },
      role,
      joinedAt: new Date(),
    });
    return this.workspaceMembersRepo.save(member);
  }

  async updateMemberRole(workspaceId: number, userId: number, newRole: Role) {
    const member = await this.workspaceMembersRepo.findOne({
      where: { workspace: { id: workspaceId }, user: { id: userId } },
    });
    if (!member) throw new NotFoundException('Member not found');
    member.role = newRole;
    return this.workspaceMembersRepo.save(member);
  }

  async removeMember(workspaceId: number, userId: number) {
    const member = await this.workspaceMembersRepo.findOne({
      where: { workspace: { id: workspaceId }, user: { id: userId } },
    });
    if (!member) throw new NotFoundException('Member not found');
    await this.workspaceMembersRepo.remove(member);
  }

  async verifyRoleAccess(
    workspaceId: number,
    userId: number,
    requiredRole: Role,
  ): Promise<boolean> {
    const members = await this.getMembers(workspaceId);
    const member = members.find((m) => m.user.id === userId);
    
    // Check if user is the workspace owner
    const workspace = await this.workspacesRepo.findOne({ where: { id: workspaceId }, relations: { owner: true } });
    const isOwner = workspace?.owner?.id === userId;

    if (!member && !isOwner) return false;

    if (isOwner) return true; // Owner has access to everything

    if (!member) return false;

    const roleOrder: Role[] = [Role.OWNER, Role.ADMIN, Role.EDITOR, Role.VIEWER];
    const userIndex = roleOrder.indexOf(member.role);
    const requiredIndex = roleOrder.indexOf(requiredRole);

    return userIndex !== -1 && userIndex <= requiredIndex;
  }
}