import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Workspace } from '../../workspaces/entities/workspace.entity';
import { File } from '../../files/entities/file.entity';

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

  @OneToMany(() => File, (file) => file.folder)
  files: File[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
