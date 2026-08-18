import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { WorkspaceMember } from '../permissions/entities/workspace-member.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(WorkspaceMember) private workspaceMembersRepo: Repository<WorkspaceMember>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const exists = await this.usersRepo.findOne({
      where: { email: createUserDto.email },
    });
    if (exists) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.usersRepo.create({
      email: createUserDto.email,
      password: hashedPassword,
    });
    const saved = await this.usersRepo.save(user);

    const { password, ...result } = saved;
    return result;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { email } });
  }

  async findAll() {
    const users = await this.usersRepo.find();
    return users.map(({ password, ...user }) => user);
  }

  async findOne(id: number) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    const { password, ...result } = user;
    return result;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    Object.assign(user, updateUserDto);
    const saved = await this.usersRepo.save(user);
    const { password, ...result } = saved;
    return result;
  }

  async remove(id: number) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    await this.usersRepo.remove(user);
  }

  async searchUsers(email: string, workspaceId: number, requesterId: number) {
    const users = await this.usersRepo.find({
      where: { email: Like(`%${email}%`) },
    });

    const members = await this.workspaceMembersRepo.find({
      where: { workspace: { id: workspaceId } },
      relations: { user: true },
    });
    const memberUserIds = new Set(members.map((m) => m.user.id));

    return users
      .filter((user) => user.id !== requesterId)
      .map(({ password, ...user }) => ({
        ...user,
        isMember: memberUserIds.has(user.id),
      }));
  }
}