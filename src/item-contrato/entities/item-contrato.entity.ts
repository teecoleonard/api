import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Contract } from '../../contracts/entities/contract.entity';
import { Equipamento } from '../../equipamentos/entities/equipamento.entity';

export enum PeriodoLocacao {
  DIARIA = 'diaria',
  SEMANAL = 'semanal',
  QUINZENAL = 'quinzenal',
  MENSAL = 'mensal'
}

@Entity('itens_contrato')
export class ItemContrato {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Contract, contract => contract.itensContrato)
  @JoinColumn({ name: 'contrato_id' })
  contrato: Contract;

  @ManyToOne(() => Equipamento, equipamento => equipamento.itensContrato)
  @JoinColumn({ name: 'equipamento_id' })
  equipamento: Equipamento;

  @Column()
  quantidade: number;

  @Column({
    type: 'enum',
    enum: PeriodoLocacao,
    default: PeriodoLocacao.DIARIA
  })
  periodoLocacao: PeriodoLocacao;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valorUnitario: number;

  @Column({ type: 'date' })
  dataRetirada: Date;

  @Column({ type: 'date', nullable: true })
  dataDevolucao: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
