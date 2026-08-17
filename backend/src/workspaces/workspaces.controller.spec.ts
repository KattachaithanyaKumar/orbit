import { Test, TestingModule } from '@nestjs/testing';
import { WorkspacesController } from './workspaces.controller';
import { WorkspacesService } from './workspaces.service';

describe('WorkspacesController', () => {
  let controller: WorkspacesController;
  let service: WorkspacesService;

  const mockUser = { id: 1, email: 'test@test.com' };

  const mockWorkspace = {
    id: 1,
    name: 'My Workspace',
    description: 'A test workspace',
    icon: '🚀',
    accentColor: '#ff0000',
    owner: mockUser,
    createdAt: new Date(),
  };

  const mockWorkspacesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkspacesController],
      providers: [
        {
          provide: WorkspacesService,
          useValue: mockWorkspacesService,
        },
      ],
    }).compile();

    controller = module.get<WorkspacesController>(WorkspacesController);
    service = module.get<WorkspacesService>(WorkspacesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a workspace', async () => {
      const dto = { name: 'My Workspace', description: 'A test workspace' };
      mockWorkspacesService.create.mockResolvedValue(mockWorkspace);

      const result = await controller.create(dto, { user: mockUser });

      expect(service.create).toHaveBeenCalledWith(dto, mockUser.id);
      expect(result).toEqual(mockWorkspace);
    });
  });

  describe('findAll', () => {
    it('should return workspaces for the authenticated user', async () => {
      mockWorkspacesService.findAll.mockResolvedValue([mockWorkspace]);

      const result = await controller.findAll({ user: mockUser });

      expect(service.findAll).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual([mockWorkspace]);
    });

    it('should return empty array when no workspaces', async () => {
      mockWorkspacesService.findAll.mockResolvedValue([]);

      const result = await controller.findAll({ user: mockUser });

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a single workspace', async () => {
      mockWorkspacesService.findOne.mockResolvedValue(mockWorkspace);

      const result = await controller.findOne('1', { user: mockUser });

      expect(service.findOne).toHaveBeenCalledWith('1', mockUser.id);
      expect(result).toEqual(mockWorkspace);
    });
  });

  describe('update', () => {
    it('should update a workspace', async () => {
      const dto = { name: 'Updated Name' };
      const updatedWorkspace = { ...mockWorkspace, name: 'Updated Name' };
      mockWorkspacesService.update.mockResolvedValue(updatedWorkspace);

      const result = await controller.update('1', dto, { user: mockUser });

      expect(service.update).toHaveBeenCalledWith('1', dto, mockUser.id);
      expect(result).toEqual(updatedWorkspace);
    });
  });

  describe('remove', () => {
    it('should remove a workspace', async () => {
      mockWorkspacesService.remove.mockResolvedValue(undefined);

      await controller.remove('1', { user: mockUser });

      expect(service.remove).toHaveBeenCalledWith('1', mockUser.id);
    });
  });
});
