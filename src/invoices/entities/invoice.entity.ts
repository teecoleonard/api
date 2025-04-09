import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { File } from '../../files/entities/file.entity';
import { Contract } from '../../contracts/entities/contract.entity';

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Contract, contract => contract.faturas)
  @JoinColumn({ name: 'contrato_id' })
  contrato: Contract;

  @Column()
  invoiceNumber: string;

  @Column({ type: 'date' })
  dataEmissao: Date;

  @Column({ type: 'date' })
  dataVencimento: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valorTotal: number;

  @Column({ nullable: true })
  supplier: string;

  @Column({ nullable: true })
  customerName: string;

  @Column({ nullable: true })
  customerDocument: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'json', nullable: true })
  items: any;

  @OneToOne(() => File, (file) => file.invoice)
  @JoinColumn({ name: 'arquivo_fatura_id' })
  file: File;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
