import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToOne, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Invoice } from '../../invoices/entities/invoice.entity';
import { Contract } from '../../contracts/entities/contract.entity';
import { Return } from '../../returns/entities/return.entity';
import { FileVersion } from './file-version.entity';

export enum FileType {
  PDF = 'pdf',
  DOCX = 'docx',
  XLSX = 'xlsx',
  XLS = 'xls',
}

@Entity('files')
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  originalName: string;

  @Column()
  filename: string;

  @Column({ type: 'enum', enum: FileType })
  type: FileType;

  @Column()
  path: string;

  @Column()
  size: number;

  @Column({ type: 'enum', enum: ['invoice', 'contract', 'return'], nullable: true })
  documentType: string;

  @Column({ type: 'boolean', default: false })
  processed: boolean;

  @Column({ nullable: true })
  processingErrors: string;
  
  @Column({ default: 1 })
  currentVersion: number;

  @ManyToOne(() => User, { nullable: false })
  uploadedBy: User;

  @OneToOne(() => Invoice, (invoice) => invoice.file, { nullable: true })
  invoice: Invoice;

  @OneToOne(() => Contract, (contract) => contract.file, { nullable: true })
  contract: Contract;

  @OneToOne(() => Return, (returnRecord) => returnRecord.file, { nullable: true })
  returnRecord: Return;
  
  @OneToMany(() => FileVersion, version => version.file, { cascade: true })
  versions: FileVersion[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
