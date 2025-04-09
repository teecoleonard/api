import { Injectable, Logger, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File, FileType } from './entities/file.entity';
import { FileVersion } from './entities/file-version.entity';
import { PdfExtractor } from './extractors/pdf.extractor';
import { DocxExtractor } from './extractors/docx.extractor';
import { ExcelExtractor } from './extractors/excel.extractor';
import { extname } from 'path';
import * as fs from 'fs';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  constructor(
    @InjectRepository(File)
    private fileRepository: Repository<File>,
    @InjectRepository(FileVersion)
    private fileVersionRepository: Repository<FileVersion>,
    private pdfExtractor: PdfExtractor,
    private docxExtractor: DocxExtractor,
    private excelExtractor: ExcelExtractor,
  ) {}

  async create(file: Express.Multer.File, userId: string): Promise<File> {
    const fileType = this.getFileType(file.originalname);
    
    const fileEntity = this.fileRepository.create({
      originalName: file.originalname,
      filename: file.filename,
      path: file.path,
      type: fileType,
      size: file.size,
      uploadedBy: { id: userId },
      currentVersion: 1,
    });
    
    const savedFile = await this.fileRepository.save(fileEntity);
    
    // Criar a primeira versão do arquivo
    const fileVersion = this.fileVersionRepository.create({
      file: savedFile,
      versionNumber: 1,
      filename: file.filename,
      path: file.path,
      size: file.size,
      uploadedBy: { id: userId },
    });
    
    await this.fileVersionRepository.save(fileVersion);
    
    return savedFile;
  }

  async addVersion(fileId: string, newFile: Express.Multer.File, userId: string, comment?: string): Promise<File> {
    const file = await this.findOne(fileId);
    
    if (this.getFileType(newFile.originalname) !== file.type) {
      throw new BadRequestException('O tipo do arquivo deve ser o mesmo da versão original');
    }
    
    // Incrementar a versão
    const newVersion = file.currentVersion + 1;
    
    // Criar registro da nova versão
    const fileVersion = this.fileVersionRepository.create({
      file,
      versionNumber: newVersion,
      filename: newFile.filename,
      path: newFile.path,
      size: newFile.size,
      comment,
      uploadedBy: { id: userId },
    });
    
    await this.fileVersionRepository.save(fileVersion);
    
    // Atualizar o arquivo principal
    file.filename = newFile.filename;
    file.path = newFile.path;
    file.size = newFile.size;
    file.currentVersion = newVersion;
    file.processed = false; // Resetar o status de processamento
    file.processingErrors = null;
    
    return this.fileRepository.save(file);
  }

  async getVersions(fileId: string): Promise<FileVersion[]> {
    await this.findOne(fileId); // Verificar se o arquivo existe
    
    return this.fileVersionRepository.find({
      where: { file: { id: fileId } },
      relations: ['uploadedBy'],
      order: { versionNumber: 'DESC' }
    });
  }

  async getVersion(fileId: string, versionNumber: number): Promise<FileVersion> {
    const version = await this.fileVersionRepository.findOne({
      where: { file: { id: fileId }, versionNumber },
      relations: ['uploadedBy']
    });
    
    if (!version) {
      throw new NotFoundException(`Versão ${versionNumber} não encontrada para o arquivo ${fileId}`);
    }
    
    return version;
  }

  async processFile(fileId: string): Promise<any> {
    try {
      const file = await this.fileRepository.findOne({ where: { id: fileId } });
      
      if (!file) {
        throw new NotFoundException(`Arquivo com ID ${fileId} não encontrado`);
      }
      
      if (!fs.existsSync(file.path)) {
        this.logger.error(`Arquivo físico não encontrado: ${file.path}`);
        throw new BadRequestException('Arquivo físico não encontrado');
      }
      
      let extractedData: any;
      
      try {
        switch (file.type) {
          case FileType.PDF:
            extractedData = await this.pdfExtractor.extract(file.path);
            break;
          case FileType.DOCX:
            extractedData = await this.docxExtractor.extract(file.path);
            break;
          case FileType.XLSX:
          case FileType.XLS:
            extractedData = await this.excelExtractor.extract(file.path);
            break;
          default:
            throw new BadRequestException(`Tipo de arquivo não suportado: ${file.type}`);
        }
        
        // Atualizar o tipo de documento e status de processamento
        file.documentType = extractedData.documentType;
        file.processed = true;
        file.processingErrors = ''; // String vazia em vez de null
        await this.fileRepository.save(file);
        
        return {
          fileId: file.id,
          documentType: extractedData.documentType,
          extractedData
        };
      } catch (processingError: unknown) {
        // Registrar erro de processamento
        file.processed = false;
        file.processingErrors = processingError instanceof Error 
          ? processingError.message 
          : 'Erro de processamento desconhecido';
        await this.fileRepository.save(file);
        
        this.logger.error(`Erro ao processar arquivo ${file.id}: ${
          processingError instanceof Error ? processingError.message : 'Erro desconhecido'
        }`, processingError instanceof Error ? processingError.stack : undefined);
        
        throw new BadRequestException(`Falha ao processar arquivo: ${
          processingError instanceof Error ? processingError.message : 'Erro desconhecido'
        }`);
      }
    } catch (error: unknown) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Erro no processamento do arquivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 
                        error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Erro interno ao processar arquivo');
    }
  }

  async findAll(userId?: string): Promise<File[]> {
    const query = this.fileRepository.createQueryBuilder('file')
      .leftJoinAndSelect('file.uploadedBy', 'user');
    
    if (userId) {
      query.where('user.id = :userId', { userId });
    }
    
    return query.getMany();
  }

  async findOne(id: string): Promise<File> {
    const file = await this.fileRepository.findOne({ 
      where: { id },
      relations: ['uploadedBy', 'invoice', 'contract', 'returnRecord']
    });
    
    if (!file) {
      throw new NotFoundException('Arquivo não encontrado');
    }
    
    return file;
  }

  async remove(id: string): Promise<void> {
    const file = await this.findOne(id);
    
    // Remover arquivo físico
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    
    await this.fileRepository.remove(file);
  }

  private getFileType(filename: string): FileType {
    const ext = extname(filename).toLowerCase();
    
    switch (ext) {
      case '.pdf':
        return FileType.PDF;
      case '.docx':
        return FileType.DOCX;
      case '.xlsx':
        return FileType.XLSX;
      case '.xls':
        return FileType.XLS;
      default:
        throw new BadRequestException('Formato de arquivo não suportado');
    }
  }
}
