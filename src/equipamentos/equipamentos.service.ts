import { Injectable, NotFoundException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Equipamento } from './entities/equipamento.entity';
import { CreateEquipamentoDto } from './dto/create-equipamento.dto';
import { UpdateEquipamentoDto } from './dto/update-equipamento.dto';

@Injectable()
export class EquipamentosService {
  private readonly logger = new Logger(EquipamentosService.name);

  constructor(
    @InjectRepository(Equipamento)
    private equipamentoRepository: Repository<Equipamento>,
  ) {}

  async create(createEquipamentoDto: CreateEquipamentoDto): Promise<Equipamento> {
    try {
      console.log('DEBUG - DTO recebido:', JSON.stringify(createEquipamentoDto));
      const equipamento = this.equipamentoRepository.create(createEquipamentoDto);
      console.log('DEBUG - Objeto criado:', JSON.stringify(equipamento));
      return await this.equipamentoRepository.save(equipamento);
    } catch (error: unknown) {
      console.error('ERRO DETALHADO:', error); // Log completo do erro
      const err = error as { message?: string, stack?: string, code?: string };
      this.logger.error(`Erro ao criar equipamento: ${err.message || 'Erro desconhecido'}`, err.stack);
      if (err.code === 'ER_NO_DEFAULT_FOR_FIELD') {
        throw new InternalServerErrorException('Faltam campos obrigatórios no equipamento');
      }
      throw new InternalServerErrorException('Erro ao criar equipamento');
    }
  }

  async createMany(createEquipamentoDtos: CreateEquipamentoDto[]): Promise<Equipamento[]> {
    try {
      const equipamentos = this.equipamentoRepository.create(createEquipamentoDtos);
      this.logger.log(`Criando múltiplos equipamentos: ${JSON.stringify(createEquipamentoDtos)}`);
      return await this.equipamentoRepository.save(equipamentos);
    } catch (error: unknown) {
      const err = error as { message?: string, stack?: string };
      this.logger.error(`Erro ao criar múltiplos equipamentos: ${err.message || 'Erro desconhecido'}`, err.stack);
      throw new InternalServerErrorException('Erro ao criar múltiplos equipamentos');
    }
  }

  async findAll(): Promise<Equipamento[]> {
    try {
      return await this.equipamentoRepository.find();
    } catch (error: unknown) {
      const err = error as { message?: string, stack?: string };
      this.logger.error(`Erro ao buscar todos os equipamentos: ${err.message || 'Erro desconhecido'}`, err.stack);
      throw new InternalServerErrorException('Erro ao buscar todos os equipamentos');
    }
  }

  async findOne(id: string): Promise<Equipamento> {
    try {
      const equipamento = await this.equipamentoRepository.findOne({ where: { id } });
      if (!equipamento) {
        throw new NotFoundException('Equipamento não encontrado');
      }
      return equipamento;
    } catch (error: unknown) {
      const err = error as { message?: string, stack?: string };
      this.logger.error(`Erro ao buscar equipamento com id ${id}: ${err.message || 'Erro desconhecido'}`, err.stack);
      throw new InternalServerErrorException('Erro ao buscar equipamento');
    }
  }

  async update(id: string, updateEquipamentoDto: UpdateEquipamentoDto): Promise<Equipamento> {
    try {
      const equipamento = await this.findOne(id);
      this.equipamentoRepository.merge(equipamento, updateEquipamentoDto);
      this.logger.log(`Atualizando equipamento com id ${id}: ${JSON.stringify(updateEquipamentoDto)}`);
      return await this.equipamentoRepository.save(equipamento);
    } catch (error: unknown) {
      const err = error as { message?: string, stack?: string };
      this.logger.error(`Erro ao atualizar equipamento com id ${id}: ${err.message || 'Erro desconhecido'}`, err.stack);
      throw new InternalServerErrorException('Erro ao atualizar equipamento');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const equipamento = await this.findOne(id);
      this.logger.log(`Removendo equipamento com id ${id}`);
      await this.equipamentoRepository.remove(equipamento);
    } catch (error: unknown) {
      const err = error as { message?: string, stack?: string };
      this.logger.error(`Erro ao remover equipamento com id ${id}: ${err.message || 'Erro desconhecido'}`, err.stack);
      throw new InternalServerErrorException('Erro ao remover equipamento');
    }
  }
}
