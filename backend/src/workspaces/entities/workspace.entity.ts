import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Folder } from '../../folders/entities/folder.entity';

@Entity('workspaces')
export class Workspace {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: '📁' })
  icon: string;

  @Column({ default: '#6366f1' })
  accentColor: string;

  @ManyToOne(() => User, (user) => user.workspaces)
  owner: User;

  @OneToMany(() => Folder, (folder) => folder.workspace)
  folders: Folder[];

  @CreateDateColumn()
  createdAt: Date;
}
