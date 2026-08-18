import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { File } from './entities/file.entity';
import { Workspace } from '../workspaces/entities/workspace.entity';
import { Folder } from '../folders/entities/folder.entity';
import { PermissionsService } from '../permissions/permissions.service';
import { Role } from '../permissions/roles.enum';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File)
    private filesRepo: Repository<File>,
    @InjectRepository(Workspace)
    private workspacesRepo: Repository<Workspace>,
    @InjectRepository(Folder)
    private foldersRepo: Repository<Folder>,
    private readonly permissionsService: PermissionsService,
  ) {}

  private async verifyRoleAccess(
    workspaceId: number,
    userId: number,
    requiredRole: Role,
  ): Promise<boolean> {
    return this.permissionsService.verifyRoleAccess(workspaceId, userId, requiredRole);
  }

  private async verifyWorkspaceAccess(
    workspaceId: number,
    userId: number,
    requiredRole: Role,
  ): Promise<boolean> {
    return this.verifyRoleAccess(workspaceId, userId, requiredRole);
  }

  async create(
    workspaceId: number,
    folderId: number,
    dto: CreateFileDto,
    userId: number,
  ): Promise<File> {
    const folder = await this.foldersRepo.findOne({
      where: { id: folderId, workspace: { id: workspaceId } },
    });
    if (!folder) throw new NotFoundException('Folder not found');

    const hasAccess = await this.verifyWorkspaceAccess(workspaceId, userId, Role.EDITOR);
    if (!hasAccess) throw new ForbiddenException('Access denied');

    const file = this.filesRepo.create({
      ...dto,
      folder: { id: folder.id },
    });
    return this.filesRepo.save(file);
  }

  async findAll(
    workspaceId: number,
    folderId: number,
    userId: number,
  ): Promise<File[]> {
    const hasAccess = await this.verifyWorkspaceAccess(workspaceId, userId, Role.VIEWER);
    if (!hasAccess) throw new ForbiddenException('Access denied');

    return this.filesRepo.find({
      where: { folder: { id: folderId } },
      order: { position: 'ASC', createdAt: 'DESC' },
    });
  }

  async findOne(
    id: number,
    workspaceId: number,
    folderId: number,
    userId: number,
  ): Promise<File> {
    const hasAccess = await this.verifyWorkspaceAccess(workspaceId, userId, Role.VIEWER);
    if (!hasAccess) throw new ForbiddenException('Access denied');

    const file = await this.filesRepo.findOne({
      where: { id, folder: { id: folderId } },
    });
    if (!file) throw new NotFoundException('File not found');
    return file;
  }

  async update(
    id: number,
    workspaceId: number,
    folderId: number,
    dto: UpdateFileDto,
    userId: number,
  ): Promise<File> {
    const hasAccess = await this.verifyWorkspaceAccess(workspaceId, userId, Role.EDITOR);
    if (!hasAccess) throw new ForbiddenException('Access denied');

    const file = await this.findOne(id, workspaceId, folderId, userId);
    Object.assign(file, dto);
    return this.filesRepo.save(file);
  }

  async remove(
    id: number,
    workspaceId: number,
    folderId: number,
    userId: number,
  ): Promise<void> {
    const hasAccess = await this.verifyWorkspaceAccess(workspaceId, userId, Role.EDITOR);
    if (!hasAccess) throw new ForbiddenException('Access denied');

    const file = await this.findOne(id, workspaceId, folderId, userId);
    await this.filesRepo.remove(file);
  }
}
