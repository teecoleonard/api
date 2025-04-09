import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Contract } from '../../contracts/entities/contract.entity';

@Entity('empresas')
export class Empresa {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nome: string;

  @Column()
  cnpj: string;

  @Column()
  endereco: string;

  @Column()
  telefone: string;

  @Column({ nullable: true })
  pix: string;

  @Column()
  responsavel: string;

  @OneToMany(() => Contract, contract => contract.empresa)
  contratos: Contract[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
