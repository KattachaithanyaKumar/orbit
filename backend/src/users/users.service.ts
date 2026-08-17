import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  private users: User[] = [];
  private idCounter = 1;

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const exists = this.users.find((u) => u.email === createUserDto.email);
    if (exists) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user: User = {
      id: this.idCounter++,
      email: createUserDto.email,
      password: hashedPassword,
      createdAt: new Date(),
    };
    this.users.push(user);

    const { password, ...result } = user;
    return result;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.users.find((u) => u.email === email);
  }

  findAll() {
    return this.users.map(({ password, ...user }) => user);
  }

  findOne(id: number) {
    const user = this.users.find((u) => u.id === id);
    if (!user) throw new NotFoundException('User not found');
    const { password, ...result } = user;
    return result;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    const user = this.users.find((u) => u.id === id);
    if (!user) throw new NotFoundException('User not found');
    Object.assign(user, updateUserDto);
    const { password, ...result } = user;
    return result;
  }

  remove(id: number) {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) throw new NotFoundException('User not found');
    this.users.splice(index, 1);
  }
}
