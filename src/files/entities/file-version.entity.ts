import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { File } from './file.entity';
import { User } from '../../users/entities/user.entity';

@Entity('file_versions')
export class FileVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => File, file => file.versions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'file_id' })
  file: File;

  @Column()
  versionNumber: number;

  @Column()
  filename: string;

  @Column()
  path: string;

  @Column()
  size: number;

  @Column({ nullable: true })
  comment: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploaded_by_id' })
  uploadedBy: User;

  @CreateDateColumn()
  createdAt: Date;
}
