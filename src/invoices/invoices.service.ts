import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './entities/invoice.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { FilesService } from '../files/files.service';
import { ContractsService } from '../contracts/contracts.service';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    private filesService: FilesService,
    private contractsService: ContractsService
  ) {}

  async create(createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    const contrato = await this.contractsService.findOne(createInvoiceDto.contratoId);
    const file = await this.filesService.findOne(createInvoiceDto.fileId);
    
    if (file.documentType && file.documentType !== 'invoice') {
      throw new BadRequestException('O arquivo não é uma fatura');
    }
    
    const invoice = this.invoiceRepository.create({
      contrato,
      invoiceNumber: createInvoiceDto.invoiceNumber,
      dataEmissao: new Date(createInvoiceDto.dataEmissao),
      dataVencimento: new Date(createInvoiceDto.dataVencimento),
      valorTotal: createInvoiceDto.valorTotal,
      supplier: createInvoiceDto.supplier,
      customerName: createInvoiceDto.customerName,
      customerDocument: createInvoiceDto.customerDocument,
      description: createInvoiceDto.description,
      items: createInvoiceDto.items,
      file,
    });
    
    // Atualizar o tipo de documento do arquivo se não estiver definido
    if (!file.documentType) {
      file.documentType = 'invoice';
      file.processed = true;
      await this.filesService['fileRepository'].save(file);
    }
    
    return this.invoiceRepository.save(invoice);
  }

  async createFromExtractedData(data: any, fileId: string, contratoId?: string): Promise<Invoice> {
    const file = await this.filesService.findOne(fileId);
    
    let contrato = null;
    if (contratoId) {
      contrato = await this.contractsService.findOne(contratoId);
    }

    const invoice = this.invoiceRepository.create({
      contrato,
      invoiceNumber: data.invoiceNumber || `INV-${Date.now()}`,
      dataEmissao: data.issueDate ? new Date(data.issueDate) : new Date(),
      dataVencimento: data.dueDate ? new Date(data.dueDate) : new Date(new Date().setDate(new Date().getDate() + 30)), // Default 30 days
      valorTotal: data.totalAmount || 0,
      supplier: data.supplier || 'Não especificado',
      customerName: data.customerName,
      customerDocument: data.customerDocument,
      description: data.description,
      items: data.items,
      file,
    });
    
    return this.invoiceRepository.save(invoice);
  }

  async findAll(): Promise<Invoice[]> {
    return this.invoiceRepository.find({ 
      relations: ['file', 'contrato'] 
    });
  }

  async findOne(id: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: ['file', 'file.uploadedBy', 'contrato']
    });
    
    if (!invoice) {
      throw new NotFoundException('Fatura não encontrada');
    }
    
    return invoice;
  }

  async findByContrato(contratoId: string): Promise<Invoice[]> {
    return this.invoiceRepository.find({
      where: { contrato: { id: contratoId } },
      relations: ['file']
    });
  }

  async update(id: string, updateInvoiceDto: UpdateInvoiceDto): Promise<Invoice> {
    const invoice = await this.findOne(id);
    
    if (updateInvoiceDto.contratoId) {
      const contrato = await this.contractsService.findOne(updateInvoiceDto.contratoId);
      invoice.contrato = contrato;
    }
    
    if (updateInvoiceDto.fileId) {
      const file = await this.filesService.findOne(updateInvoiceDto.fileId);
      invoice.file = file;
      
      // Atualizar o tipo de documento do arquivo
      file.documentType = 'invoice';
      file.processed = true;
      await this.filesService['fileRepository'].save(file);
    }

    // Update other fields
    if (updateInvoiceDto.invoiceNumber) invoice.invoiceNumber = updateInvoiceDto.invoiceNumber;
    if (updateInvoiceDto.dataEmissao) invoice.dataEmissao = new Date(updateInvoiceDto.dataEmissao);
    if (updateInvoiceDto.dataVencimento) invoice.dataVencimento = new Date(updateInvoiceDto.dataVencimento);
    if (updateInvoiceDto.valorTotal) invoice.valorTotal = updateInvoiceDto.valorTotal;
    if (updateInvoiceDto.supplier) invoice.supplier = updateInvoiceDto.supplier;
    if (updateInvoiceDto.customerName) invoice.customerName = updateInvoiceDto.customerName;
    if (updateInvoiceDto.customerDocument) invoice.customerDocument = updateInvoiceDto.customerDocument;
    if (updateInvoiceDto.description) invoice.description = updateInvoiceDto.description;
    if (updateInvoiceDto.items) invoice.items = updateInvoiceDto.items;
    
    return this.invoiceRepository.save(invoice);
  }

  async remove(id: string): Promise<void> {
    const invoice = await this.findOne(id);
    await this.invoiceRepository.remove(invoice);
  }
}
