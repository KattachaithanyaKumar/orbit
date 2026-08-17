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

@Injectable()
export class FoldersService {
  constructor(
    @InjectRepository(Folder)
    private foldersRepo: Repository<Folder>,
    @InjectRepository(Workspace)
    private workspacesRepo: Repository<Workspace>,
  ) {}

  private async verifyWorkspaceOwner(
    workspaceId: number,
    userId: number,
  ): Promise<Workspace> {
    const workspace = await this.workspacesRepo.findOne({
      where: { id: workspaceId },
      relations: { owner: true },
    });
    if (!workspace) throw new NotFoundException('Workspace not found');
    if (workspace.owner.id !== userId)
      throw new ForbiddenException('Access denied');
    return workspace;
  }

  async create(
    workspaceId: number,
    dto: CreateFolderDto,
    userId: number,
  ): Promise<Folder> {
    await this.verifyWorkspaceOwner(workspaceId, userId);
    const folder = this.foldersRepo.create({
      ...dto,
      workspace: { id: workspaceId },
    });
    return this.foldersRepo.save(folder);
  }

  async findAll(workspaceId: number, userId: number): Promise<Folder[]> {
    await this.verifyWorkspaceOwner(workspaceId, userId);
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
    await this.verifyWorkspaceOwner(workspaceId, userId);
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
    const folder = await this.findOne(id, workspaceId, userId);
    Object.assign(folder, dto);
    return this.foldersRepo.save(folder);
  }

  async remove(
    id: number,
    workspaceId: number,
    userId: number,
  ): Promise<void> {
    const folder = await this.findOne(id, workspaceId, userId);
    await this.foldersRepo.remove(folder);
  }
}
