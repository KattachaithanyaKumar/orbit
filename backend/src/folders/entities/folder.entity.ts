import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Workspace } from '../../workspaces/entities/workspace.entity';

@Entity('folders')
export class Folder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: '📂' })
  icon: string;

  @Column({ default: 0 })
  position: number;

  @ManyToOne(() => Workspace, (workspace) => workspace.folders, {
    onDelete: 'CASCADE',
  })
  workspace: Workspace;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
