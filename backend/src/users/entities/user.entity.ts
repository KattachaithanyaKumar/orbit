import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Workspace } from '../../workspaces/entities/workspace.entity';
import { WorkspaceMember } from '../../permissions/entities/workspace-member.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @OneToMany(() => Workspace, (workspace) => workspace.owner)
  workspaces: Workspace[];

  @OneToMany(() => WorkspaceMember, (member) => member.user)
  workspaceMembers: WorkspaceMember[];

  @CreateDateColumn()
  createdAt: Date;
}
