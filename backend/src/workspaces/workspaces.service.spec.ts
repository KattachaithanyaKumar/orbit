import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkspacesService } from './workspaces.service';
import { Workspace } from './entities/workspace.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const createMockRepository = <T = any>(): MockRepository<T> => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
});

describe('WorkspacesService', () => {
  let service: WorkspacesService;
  let repository: MockRepository<Workspace>;

  const mockUser = { id: 1, email: 'test@test.com' };

  const mockWorkspace: Workspace = {
    id: 1,
    name: 'My Workspace',
    description: 'A test workspace',
    icon: '🚀',
    accentColor: '#ff0000',
    owner: mockUser as any,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspacesService,
        {
          provide: getRepositoryToken(Workspace),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<WorkspacesService>(WorkspacesService);
    repository = module.get(getRepositoryToken(Workspace));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a workspace', async () => {
      const dto = { name: 'My Workspace', description: 'A test workspace', icon: '🚀', accentColor: '#ff0000' };
      repository.create!.mockReturnValue(mockWorkspace);
      repository.save!.mockReturnValue(mockWorkspace);

      const result = await service.create(dto, mockUser.id);

      expect(repository.create).toHaveBeenCalledWith({
        ...dto,
        owner: { id: mockUser.id },
      });
      expect(repository.save).toHaveBeenCalledWith(mockWorkspace);
      expect(result).toEqual(mockWorkspace);
    });

    it('should create a workspace with only name', async () => {
      const dto = { name: 'Minimal Workspace' };
      const minimalWorkspace = { ...mockWorkspace, description: null, icon: '📁', accentColor: '#6366f1' };
      repository.create!.mockReturnValue(minimalWorkspace);
      repository.save!.mockReturnValue(minimalWorkspace);

      const result = await service.create(dto, mockUser.id);

      expect(repository.create).toHaveBeenCalledWith({
        ...dto,
        owner: { id: mockUser.id },
      });
      expect(result).toEqual(minimalWorkspace);
    });
  });

  describe('findAll', () => {
    it('should return workspaces for a user', async () => {
      repository.find!.mockReturnValue([mockWorkspace]);

      const result = await service.findAll(mockUser.id);

      expect(repository.find).toHaveBeenCalledWith({
        where: { owner: { id: mockUser.id } },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual([mockWorkspace]);
    });

    it('should return empty array when no workspaces exist', async () => {
      repository.find!.mockReturnValue([]);

      const result = await service.findAll(mockUser.id);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a workspace by id', async () => {
      repository.findOne!.mockReturnValue(mockWorkspace);

      const result = await service.findOne(1, mockUser.id);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { owner: true },
      });
      expect(result).toEqual(mockWorkspace);
    });

    it('should throw NotFoundException when workspace does not exist', async () => {
      repository.findOne!.mockReturnValue(null);

      await expect(service.findOne(999, mockUser.id)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not the owner', async () => {
      const otherUserWorkspace = { ...mockWorkspace, owner: { id: 2 } };
      repository.findOne!.mockReturnValue(otherUserWorkspace);

      await expect(service.findOne(1, mockUser.id)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    it('should update a workspace', async () => {
      const updatedWorkspace = { ...mockWorkspace, name: 'Updated Name' };
      jest.spyOn(service, 'findOne').mockResolvedValue(mockWorkspace);
      repository.save!.mockReturnValue(updatedWorkspace);

      const result = await service.update(1, { name: 'Updated Name' }, mockUser.id);

      expect(service.findOne).toHaveBeenCalledWith(1, mockUser.id);
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(updatedWorkspace);
    });

    it('should throw if workspace not found', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());

      await expect(service.update(999, { name: 'X' }, mockUser.id)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw if user is not the owner', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new ForbiddenException());

      await expect(service.update(1, { name: 'X' }, 2)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should remove a workspace', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockWorkspace);
      repository.remove!.mockReturnValue(undefined as any);

      await service.remove(1, mockUser.id);

      expect(service.findOne).toHaveBeenCalledWith(1, mockUser.id);
      expect(repository.remove).toHaveBeenCalledWith(mockWorkspace);
    });

    it('should throw if workspace not found', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());

      await expect(service.remove(999, mockUser.id)).rejects.toThrow(NotFoundException);
    });
  });
});
