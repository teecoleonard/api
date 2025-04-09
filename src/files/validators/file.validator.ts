import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import { FileType } from '../entities/file.entity';
import * as path from 'path';

@Injectable()
export class FileValidator {
  private readonly logger = new Logger(FileValidator.name);
  
  /**
   * Valida um arquivo através de verificações de segurança e integridade
   */
  async validateFile(filePath: string, fileType: FileType): Promise<boolean> {
    try {
      // Verificar se o arquivo existe
      await fs.access(filePath);
      
      // Verificar tamanho do arquivo
      const stats = await fs.stat(filePath);
      if (stats.size === 0) {
        this.logger.warn(`Arquivo vazio: ${filePath}`);
        return false;
      }
      
      // Verificações específicas por tipo de arquivo
      switch (fileType) {
        case FileType.PDF:
          return await this.validatePdf(filePath);
        case FileType.DOCX:
          return await this.validateDocx(filePath);
        case FileType.XLSX:
        case FileType.XLS:
          return await this.validateExcel(filePath);
        default:
          this.logger.warn(`Tipo de arquivo não suportado: ${fileType}`);
          return false;
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Erro ao validar arquivo: ${errorMessage}`, errorStack);
      return false;
    }
  }
  
  private async validatePdf(filePath: string): Promise<boolean> {
    // Implementar validação específica para PDF
    // Por exemplo, verificar se o arquivo começa com %PDF
    try {
      const fileHandle = await fs.open(filePath, 'r');
      const buffer = Buffer.alloc(5);
      await fileHandle.read(buffer, 0, 5, 0);
      await fileHandle.close();
      
      return buffer.toString().startsWith('%PDF-');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(`Erro ao validar PDF: ${errorMessage}`);
      return false;
    }
  }
  
  private async validateDocx(filePath: string): Promise<boolean> {
    // Implementação básica - verificar apenas extensão
    return path.extname(filePath).toLowerCase() === '.docx';
  }
  
  private async validateExcel(filePath: string): Promise<boolean> {
    // Implementação básica - verificar apenas extensão
    const ext = path.extname(filePath).toLowerCase();
    return ext === '.xlsx' || ext === '.xls';
  }
}
