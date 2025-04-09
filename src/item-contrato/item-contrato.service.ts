import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItemContrato } from './entities/item-contrato.entity';
import { CreateItemContratoDto } from './dto/create-item-contrato.dto';
import { UpdateItemContratoDto } from './dto/update-item-contrato.dto';
import { ContractsService } from '../contracts/contracts.service';
import { EquipamentosService } from '../equipamentos/equipamentos.service';

@Injectable()
export class ItemContratoService {
  constructor(
    @InjectRepository(ItemContrato)
    private itemContratoRepository: Repository<ItemContrato>,
    private contractsService: ContractsService,
    private equipamentosService: EquipamentosService,
  ) {}

  async create(createItemContratoDto: CreateItemContratoDto): Promise<ItemContrato> {
    const contrato = await this.contractsService.findOne(createItemContratoDto.contratoId);
    const equipamento = await this.equipamentosService.findOne(createItemContratoDto.equipamentoId);

    const itemContrato = this.itemContratoRepository.create({
      contrato,
      equipamento,
      quantidade: createItemContratoDto.quantidade,
      periodoLocacao: createItemContratoDto.periodoLocacao,
      valorUnitario: createItemContratoDto.valorUnitario,
      dataRetirada: new Date(createItemContratoDto.dataRetirada),
      dataDevolucao: createItemContratoDto.dataDevolucao ? new Date(createItemContratoDto.dataDevolucao) : null,
    });

    return this.itemContratoRepository.save(itemContrato);
  }

  async findAll(): Promise<ItemContrato[]> {
    return this.itemContratoRepository.find({
      relations: ['contrato', 'equipamento']
    });
  }

  async findOne(id: string): Promise<ItemContrato> {
    const itemContrato = await this.itemContratoRepository.findOne({
      where: { id },
      relations: ['contrato', 'equipamento']
    });
    
    if (!itemContrato) {
      throw new NotFoundException('Item de contrato não encontrado');
    }
    
    return itemContrato;
  }

  async findByContrato(contratoId: string): Promise<ItemContrato[]> {
    return this.itemContratoRepository.find({
      where: { contrato: { id: contratoId } },
      relations: ['equipamento']
    });
  }

  async update(id: string, updateItemContratoDto: UpdateItemContratoDto): Promise<ItemContrato> {
    const itemContrato = await this.findOne(id);
    
    if (updateItemContratoDto.equipamentoId) {
      const equipamento = await this.equipamentosService.findOne(updateItemContratoDto.equipamentoId);
      itemContrato.equipamento = equipamento;
    }

    if (updateItemContratoDto.quantidade) {
      itemContrato.quantidade = updateItemContratoDto.quantidade;
    }

    if (updateItemContratoDto.periodoLocacao) {
      itemContrato.periodoLocacao = updateItemContratoDto.periodoLocacao;
    }

    if (updateItemContratoDto.valorUnitario) {
      itemContrato.valorUnitario = updateItemContratoDto.valorUnitario;
    }

    if (updateItemContratoDto.dataRetirada) {
      itemContrato.dataRetirada = new Date(updateItemContratoDto.dataRetirada);
    }

    if (updateItemContratoDto.dataDevolucao) {
      itemContrato.dataDevolucao = new Date(updateItemContratoDto.dataDevolucao);
    }
    
    return this.itemContratoRepository.save(itemContrato);
  }

  async remove(id: string): Promise<void> {
    const itemContrato = await this.findOne(id);
    await this.itemContratoRepository.remove(itemContrato);
  }
}
