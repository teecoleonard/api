import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Return } from './entities/return.entity';
import { CreateReturnDto } from './dto/create-return.dto';
import { UpdateReturnDto } from './dto/update-return.dto';
import { FilesService } from '../files/files.service';
import { ContractsService } from '../contracts/contracts.service';

@Injectable()
export class ReturnsService {
  constructor(
    @InjectRepository(Return)
    private returnRepository: Repository<Return>,
    private filesService: FilesService,
    private contractsService: ContractsService,
  ) {}

  async create(createReturnDto: CreateReturnDto): Promise<Return> {
    const contrato = await this.contractsService.findOne(createReturnDto.contratoId);
    const file = await this.filesService.findOne(createReturnDto.fileId);
    
    if (file.documentType && file.documentType !== 'return') {
      throw new BadRequestException('O arquivo não é um registro de devolução');
    }
    
    const returnRecord = this.returnRepository.create({
      contrato,
      returnNumber: createReturnDto.returnNumber,
      dataDevolucao: new Date(createReturnDto.dataDevolucao),
      customerName: createReturnDto.customerName || contrato.cliente.razaoSocial,
      customerDocument: createReturnDto.customerDocument || contrato.cliente.cnpj,
      reason: createReturnDto.reason,
      responsavelRecebimento: createReturnDto.responsavelRecebimento,
      items: createReturnDto.items,
      totalAmount: createReturnDto.totalAmount,
      observacoes: createReturnDto.observacoes,
      file,
    });
    
    // Atualizar o tipo de documento do arquivo se não estiver definido
    if (!file.documentType) {
      file.documentType = 'return';
      file.processed = true;
      await this.filesService['fileRepository'].save(file);
    }
    
    return this.returnRepository.save(returnRecord);
  }

  async createFromExtractedData(data: any, fileId: string, contratoId?: string): Promise<Return> {
    const file = await this.filesService.findOne(fileId);
    
    let contrato = null;
    if (contratoId) {
      contrato = await this.contractsService.findOne(contratoId);
    }

    const returnRecord = this.returnRepository.create({
      contrato,
      returnNumber: data.returnNumber || `RET-${Date.now()}`,
      dataDevolucao: data.returnDate ? new Date(data.returnDate) : new Date(),
      customerName: data.customerName || (contrato ? contrato.cliente.razaoSocial : 'Não especificado'),
      customerDocument: data.customerDocument || (contrato ? contrato.cliente.cnpj : null),
      reason: data.reason || 'Devolução regular',
      responsavelRecebimento: data.responsavelRecebimento || 'Recebedor do documento',
      items: data.items,
      totalAmount: data.totalAmount || 0,
      observacoes: data.observacoes,
      file,
    });
    
    return this.returnRepository.save(returnRecord);
  }

  async findAll(): Promise<Return[]> {
    return this.returnRepository.find({ 
      relations: ['file', 'contrato'] 
    });
  }

  async findOne(id: string): Promise<Return> {
    const returnRecord = await this.returnRepository.findOne({
      where: { id },
      relations: ['file', 'file.uploadedBy', 'contrato']
    });
    
    if (!returnRecord) {
      throw new NotFoundException('Registro de devolução não encontrado');
    }
    
    return returnRecord;
  }

  async findByContrato(contratoId: string): Promise<Return[]> {
    return this.returnRepository.find({
      where: { contrato: { id: contratoId } },
      relations: ['file']
    });
  }

  async update(id: string, updateReturnDto: UpdateReturnDto): Promise<Return> {
    const returnRecord = await this.findOne(id);
    
    if (updateReturnDto.contratoId) {
      const contrato = await this.contractsService.findOne(updateReturnDto.contratoId);
      returnRecord.contrato = contrato;
    }
    
    if (updateReturnDto.fileId) {
      const file = await this.filesService.findOne(updateReturnDto.fileId);
      returnRecord.file = file;
      
      // Atualizar o tipo de documento do arquivo
      file.documentType = 'return';
      file.processed = true;
      await this.filesService['fileRepository'].save(file);
    }
    
    // Update other fields
    if (updateReturnDto.returnNumber) returnRecord.returnNumber = updateReturnDto.returnNumber;
    if (updateReturnDto.dataDevolucao) returnRecord.dataDevolucao = new Date(updateReturnDto.dataDevolucao);
    if (updateReturnDto.customerName) returnRecord.customerName = updateReturnDto.customerName;
    if (updateReturnDto.customerDocument) returnRecord.customerDocument = updateReturnDto.customerDocument;
    if (updateReturnDto.reason) returnRecord.reason = updateReturnDto.reason;
    if (updateReturnDto.responsavelRecebimento) returnRecord.responsavelRecebimento = updateReturnDto.responsavelRecebimento;
    if (updateReturnDto.items) returnRecord.items = updateReturnDto.items;
    if (updateReturnDto.totalAmount) returnRecord.totalAmount = updateReturnDto.totalAmount;
    if (updateReturnDto.observacoes) returnRecord.observacoes = updateReturnDto.observacoes;
    
    return this.returnRepository.save(returnRecord);
  }

  async remove(id: string): Promise<void> {
    const returnRecord = await this.findOne(id);
    await this.returnRepository.remove(returnRecord);
  }
}
