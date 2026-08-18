import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { Folder } from './entities/folder.entity';
import { Workspace } from '../workspaces/entities/workspace.entity';
import { Role } from '../permissions/roles.enum';
import { PermissionsService } from '../permissions/permissions.service';

@Injectable()
export class FoldersService {
  constructor(
    @InjectRepository(Folder)
    private foldersRepo: Repository<Folder>,
    @InjectRepository(Workspace)
    private workspacesRepo: Repository<Workspace>,
    private readonly permissionsService: PermissionsService,
  ) {}

  private async verifyWorkspaceAccess(
    workspaceId: number,
    userId: number,
    requiredRole: Role,
  ): Promise<Workspace> {
    const hasAccess = await this.permissionsService.verifyRoleAccess(
      workspaceId,
      userId,
      requiredRole,
    );
    if (!hasAccess) throw new ForbiddenException('Access denied');

    const workspace = await this.workspacesRepo.findOne({
      where: { id: workspaceId },
      relations: { owner: true },
    });
    if (!workspace) throw new NotFoundException('Workspace not found');
    return workspace;
  }

  async create(
    workspaceId: number,
    dto: CreateFolderDto,
    userId: number,
  ): Promise<Folder> {
    const workspace = await this.verifyWorkspaceAccess(workspaceId, userId, Role.EDITOR);
    const folder = this.foldersRepo.create({
      ...dto,
      workspace: { id: workspaceId },
    });
    return this.foldersRepo.save(folder);
  }

  async findAll(workspaceId: number, userId: number): Promise<Folder[]> {
    await this.verifyWorkspaceAccess(workspaceId, userId, Role.VIEWER);
    return this.foldersRepo.find({
      where: { workspace: { id: workspaceId } },
      order: { position: 'ASC', createdAt: 'DESC' },
    });
  }

  async findOne(
    id: number,
    workspaceId: number,
    userId: number,
  ): Promise<Folder> {
    await this.verifyWorkspaceAccess(workspaceId, userId, Role.VIEWER);
    const folder = await this.foldersRepo.findOne({
      where: { id, workspace: { id: workspaceId } },
    });
    if (!folder) throw new NotFoundException('Folder not found');
    return folder;
  }

  async update(
    id: number,
    workspaceId: number,
    dto: UpdateFolderDto,
    userId: number,
  ): Promise<Folder> {
    const workspace = await this.verifyWorkspaceAccess(workspaceId, userId, Role.EDITOR);
    const folder = await this.findOne(id, workspaceId, userId);
    Object.assign(folder, dto);
    return this.foldersRepo.save(folder);
  }

  async remove(
    id: number,
    workspaceId: number,
    userId: number,
  ): Promise<void> {
    const workspace = await this.verifyWorkspaceAccess(workspaceId, userId, Role.EDITOR);
    const folder = await this.findOne(id, workspaceId, userId);
    await this.foldersRepo.remove(folder);
  }
}
