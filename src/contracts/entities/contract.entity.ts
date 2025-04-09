import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { File } from '../../files/entities/file.entity';
import { Cliente } from '../../clientes/entities/cliente.entity';
import { Empresa } from '../../empresa/entities/empresa.entity';
import { ItemContrato } from '../../item-contrato/entities/item-contrato.entity';
import { Invoice } from '../../invoices/entities/invoice.entity';
import { Return } from '../../returns/entities/return.entity';

export enum StatusContrato {
  ATIVO = 'ativo',
  ENCERRADO = 'encerrado',
  CANCELADO = 'cancelado'
}

@Entity('contracts')
export class Contract {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  numeroContrato: string;

  @ManyToOne(() => Cliente, cliente => cliente.contratos)
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;

  @ManyToOne(() => Empresa, empresa => empresa.contratos)
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Column({ type: 'date' })
  dataInicio: Date;

  @Column({ type: 'date', nullable: true })
  dataFim: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valorTotal: number;

  @Column({
    type: 'enum',
    enum: StatusContrato,
    default: StatusContrato.ATIVO
  })
  status: StatusContrato;

  @Column({ type: 'text' })
  descricao: string;

  @OneToOne(() => File, (file) => file.contract)
  @JoinColumn({ name: 'arquivo_contrato_id' })
  file: File;

  @OneToMany(() => ItemContrato, itemContrato => itemContrato.contrato)
  itensContrato: ItemContrato[];

  @OneToMany(() => Invoice, invoice => invoice.contrato)
  faturas: Invoice[];

  @OneToMany(() => Return, devolucao => devolucao.contrato)
  devolucoes: Return[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
