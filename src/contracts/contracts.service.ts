import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract, StatusContrato } from './entities/contract.entity';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { FilesService } from '../files/files.service';
import { ClientesService } from '../clientes/clientes.service';
import { EmpresaService } from '../empresa/empresa.service';

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(Contract)
    private contractRepository: Repository<Contract>,
    private filesService: FilesService,
    private clientesService: ClientesService,
    private empresaService: EmpresaService,
  ) {}

  async create(createContractDto: CreateContractDto): Promise<Contract> {
    const cliente = await this.clientesService.findOne(createContractDto.clienteId);
    const empresa = await this.empresaService.findOne(createContractDto.empresaId);
    
    let file = undefined;
    if (createContractDto.fileId) {
      file = await this.filesService.findOne(createContractDto.fileId);
      
      if (file.documentType && file.documentType !== 'contract') {
        throw new BadRequestException('O arquivo não é um contrato');
      }
      
      if (!file.documentType) {
        file.documentType = 'contract';
        file.processed = true;
        await this.filesService['fileRepository'].save(file);
      }
    }
    
    const contract = this.contractRepository.create({
      numeroContrato: createContractDto.numeroContrato,
      cliente,
      empresa,
      dataInicio: new Date(createContractDto.dataInicio),
      dataFim: createContractDto.dataFim ? new Date(createContractDto.dataFim) : null,
      valorTotal: createContractDto.valorTotal,
      status: createContractDto.status || StatusContrato.ATIVO,
      descricao: createContractDto.descricao,
      file,
    });
    
    return this.contractRepository.save(contract);
  }

  async findAll(): Promise<Contract[]> {
    return this.contractRepository.find({ 
      relations: ['cliente', 'empresa', 'file'] 
    });
  }

  async findOne(id: string): Promise<Contract> {
    const contract = await this.contractRepository.findOne({
      where: { id },
      relations: ['cliente', 'empresa', 'file', 'itensContrato', 'itensContrato.equipamento', 'faturas', 'devolucoes']
    });
    
    if (!contract) {
      throw new NotFoundException('Contrato não encontrado');
    }
    
    return contract;
  }

  async update(id: string, updateContractDto: UpdateContractDto): Promise<Contract> {
    const contract = await this.findOne(id);
    
    if (updateContractDto.clienteId) {
      const cliente = await this.clientesService.findOne(updateContractDto.clienteId);
      contract.cliente = cliente;
    }
    
    if (updateContractDto.empresaId) {
      const empresa = await this.empresaService.findOne(updateContractDto.empresaId);
      contract.empresa = empresa;
    }
    
    if (updateContractDto.fileId) {
      const file = await this.filesService.findOne(updateContractDto.fileId);
      contract.file = file;
      
      // Atualizar o tipo de documento do arquivo
      file.documentType = 'contract';
      file.processed = true;
      await this.filesService['fileRepository'].save(file);
    }
    
    if (updateContractDto.numeroContrato) contract.numeroContrato = updateContractDto.numeroContrato;
    if (updateContractDto.dataInicio) contract.dataInicio = new Date(updateContractDto.dataInicio);
    if (updateContractDto.dataFim) contract.dataFim = new Date(updateContractDto.dataFim);
    if (updateContractDto.valorTotal) contract.valorTotal = updateContractDto.valorTotal;
    if (updateContractDto.status) contract.status = updateContractDto.status;
    if (updateContractDto.descricao) contract.descricao = updateContractDto.descricao;
    
    return this.contractRepository.save(contract);
  }

  async remove(id: string): Promise<void> {
    const contract = await this.findOne(id);
    await this.contractRepository.remove(contract);
  }

  async createFromExtractedData(data: any, fileId: string): Promise<Contract> {
    // Esse método continuaria com a lógica existente, mas adaptado para o novo modelo
    const file = await this.filesService.findOne(fileId);
    
    // Aqui precisaríamos ter uma empresa padrão e talvez um cliente padrão para casos de extração automática
    // ou então exigir que esses dados sejam fornecidos posteriormente
    const empresas = await this.empresaService.findAll();
    if (!empresas || empresas.length === 0) {
      throw new BadRequestException('É necessário cadastrar pelo menos uma empresa antes de importar contratos');
    }
    
    const contract = this.contractRepository.create({
      numeroContrato: data.contractNumber || `CONT-${Date.now()}`,
      dataInicio: data.startDate ? new Date(data.startDate) : new Date(),
      dataFim: data.endDate ? new Date(data.endDate) : null,
      valorTotal: data.value || 0,
      descricao: data.description || 'Contrato importado automaticamente',
      status: StatusContrato.ATIVO,
      empresa: empresas[0], // Usar a primeira empresa como padrão
      file,
      // cliente seria definido posteriormente
    });
    
    return this.contractRepository.save(contract);
  }
}
