import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { Workspace } from './entities/workspace.entity';
import { PermissionsService } from '../permissions/permissions.service';
import { Role } from '../permissions/roles.enum';

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectRepository(Workspace)
    private workspacesRepo: Repository<Workspace>,
    private readonly permissionsService: PermissionsService,
  ) {}

  async create(createWorkspaceDto: CreateWorkspaceDto, userId: number): Promise<Workspace> {
    const workspace = this.workspacesRepo.create({
      ...createWorkspaceDto,
      owner: { id: userId },
    });
    const saved = await this.workspacesRepo.save(workspace);

    // Auto-add creator as OWNER member
    await this.permissionsService.addMember(
      saved.id,
      userId,
      Role.OWNER,
    );

    return saved;
  }

  async findAll(userId: number): Promise<Workspace[]> {
    return this.workspacesRepo
      .createQueryBuilder('workspace')
      .leftJoin('workspace.owner', 'owner')
      .leftJoin('workspace.workspaceMembers', 'member')
      .leftJoin('member.user', 'memberUser')
      .where('owner.id = :userId OR memberUser.id = :userId', { userId })
      .orderBy('workspace.createdAt', 'DESC')
      .getMany();
  }

  async findOne(id: number, userId: number): Promise<Workspace> {
    const workspace = await this.workspacesRepo.findOne({
      where: { id },
      relations: { owner: true },
    });
    if (!workspace) throw new NotFoundException('Workspace not found');
    const hasAccess = await this.permissionsService.verifyRoleAccess(
      id,
      userId,
      Role.VIEWER,
    );
    if (!hasAccess) throw new ForbiddenException('Access denied');
    return workspace;
  }

  async update(id: number, updateWorkspaceDto: UpdateWorkspaceDto, userId: number): Promise<Workspace> {
    const workspace = await this.findOne(id, userId);
    Object.assign(workspace, updateWorkspaceDto);
    return this.workspacesRepo.save(workspace);
  }

  async remove(id: number, userId: number): Promise<void> {
    const workspace = await this.findOne(id, userId);
    await this.workspacesRepo.remove(workspace);
  }
}
