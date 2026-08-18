import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Workspace } from '../../workspaces/entities/workspace.entity';
import { Role } from '../roles.enum';

@Entity('workspace_members')
export class WorkspaceMember {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.workspaceMembers)
  user: User;

  @ManyToOne(() => Workspace, (workspace) => workspace.workspaceMembers)
  @JoinColumn()
  workspace: Workspace;

  @Column({ type: 'enum', enum: Role })
  role: Role;

  @Column({ type: 'date' })
  joinedAt: Date;
}