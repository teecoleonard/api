import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ItemContrato } from '../../item-contrato/entities/item-contrato.entity';

@Entity('equipamentos')
export class Equipamento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  descricao: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precoDiaria: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precoSemanal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precoQuinzenal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precoMensal: number;

  @Column()
  codigo: string;

  @Column({ type: 'int', default: 0 })
  quantidade: number;

  @OneToMany(() => ItemContrato, itemContrato => itemContrato.equipamento)
  itensContrato: ItemContrato[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
