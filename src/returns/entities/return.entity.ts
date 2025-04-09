import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { File } from '../../files/entities/file.entity';
import { Contract } from '../../contracts/entities/contract.entity';

@Entity('returns')
export class Return {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Contract, contract => contract.devolucoes)
  @JoinColumn({ name: 'contrato_id' })
  contrato: Contract;

  @Column()
  returnNumber: string;

  @Column({ type: 'date' })
  dataDevolucao: Date;

  @Column({ nullable: true })
  customerName: string;

  @Column({ nullable: true })
  customerDocument: string;

  @Column({ nullable: true })
  reason: string;

  @Column({ nullable: true })
  responsavelRecebimento: string;

  @Column({ type: 'json', nullable: true })
  items: any;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalAmount: number;

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @OneToOne(() => File, (file) => file.returnRecord)
  @JoinColumn({ name: 'arquivo_devolucao_id' })
  file: File;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
