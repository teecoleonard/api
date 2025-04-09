import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Contract } from '../../contracts/entities/contract.entity';

@Entity('clientes')
export class Cliente {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  razaoSocial: string;

  @Column({ unique: true })
  cnpj: string;

  @Column({ nullable: true })
  inscricaoEstadual: string;

  @Column()
  endereco: string;

  @Column()
  telefone: string;

  @OneToMany(() => Contract, contract => contract.cliente)
  contratos: Contract[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
