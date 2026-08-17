import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { Workspace } from './entities/workspace.entity';

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectRepository(Workspace)
    private workspacesRepo: Repository<Workspace>,
  ) {}

  async create(createWorkspaceDto: CreateWorkspaceDto, userId: number): Promise<Workspace> {
    const workspace = this.workspacesRepo.create({
      ...createWorkspaceDto,
      owner: { id: userId },
    });
    return this.workspacesRepo.save(workspace);
  }

  async findAll(userId: number): Promise<Workspace[]> {
    return this.workspacesRepo.find({
      where: { owner: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number, userId: number): Promise<Workspace> {
    const workspace = await this.workspacesRepo.findOne({
      where: { id },
      relations: { owner: true },
    });
    if (!workspace) throw new NotFoundException('Workspace not found');
    if (workspace.owner.id !== userId) throw new ForbiddenException('Access denied');
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
