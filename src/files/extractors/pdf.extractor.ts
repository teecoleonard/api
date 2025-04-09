import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as pdfParse from 'pdf-parse';

@Injectable()
export class PdfExtractor {
  private readonly logger = new Logger(PdfExtractor.name);

  async extract(filePath: string): Promise<any> {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      
      return this.parseContent(data.text);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(`Erro ao extrair dados do PDF: ${errorMessage}`);
      throw new Error(`Falha na extração do arquivo PDF: ${errorMessage}`);
    }
  }

  private parseContent(text: string): any {
    // Detectar o tipo de documento com base no conteúdo
    if (text.toLowerCase().includes('fatura') || text.toLowerCase().includes('invoice')) {
      return this.parseInvoice(text);
    } else if (text.toLowerCase().includes('contrato') || text.toLowerCase().includes('contract')) {
      return this.parseContract(text);
    } else if (text.toLowerCase().includes('devolução') || text.toLowerCase().includes('return')) {
      return this.parseReturn(text);
    } else {
      // Formato genérico se não conseguir identificar o tipo específico
      return {
        documentType: 'unknown',
        rawText: text,
        content: this.extractKeyValuePairs(text),
      };
    }
  }

  private parseInvoice(text: string): any {
    // Implementação simplificada para extrair dados de faturas
    const invoiceNumber = this.extractValue(text, ['fatura no:', 'invoice no:', 'número da fatura:'], /[\d-]+/);
    const dateMatch = text.match(/(\d{2}\/\d{2}\/\d{4})|(\d{4}-\d{2}-\d{2})/);
    const issueDate = dateMatch ? dateMatch[0] : null;
    const totalAmount = this.extractValue(text, ['total:', 'valor total:'], /[\d.,]+/);
    const supplier = this.extractValue(text, ['fornecedor:', 'empresa:', 'supplier:'], /[a-zA-Z\s]+/);

    return {
      documentType: 'invoice',
      invoiceNumber,
      issueDate: this.parseDate(issueDate || ''), // Garantir que não é null
      totalAmount: this.parseAmount(totalAmount),
      supplier,
      rawText: text
    };
  }

  private parseContract(text: string): any {
    // Implementação simplificada para extrair dados de contratos
    const contractNumber = this.extractValue(text, ['contrato no:', 'contract no:', 'número do contrato:'], /[\d-]+/);
    const dateMatch = text.match(/(\d{2}\/\d{2}\/\d{4})|(\d{4}-\d{2}-\d{2})/);
    const startDate = dateMatch ? dateMatch[0] : null;
    
    // Encontrar segunda data para endDate
    let endDate = null;
    if (dateMatch && dateMatch.index) {
      const remainingText = text.substring(dateMatch.index + dateMatch[0].length);
      const secondDateMatch = remainingText.match(/(\d{2}\/\d{2}\/\d{4})|(\d{4}-\d{2}-\d{2})/);
      if (secondDateMatch) {
        endDate = secondDateMatch[0];
      }
    }

    return {
      documentType: 'contract',
      contractNumber,
      startDate: this.parseDate(startDate || ''), // Garantir que não é null
      endDate: this.parseDate(endDate || ''), // Garantir que não é null
      partyName: this.extractValue(text, ['parte:', 'party:'], /[a-zA-Z\s]+/),
      counterpartyName: this.extractValue(text, ['contraparte:', 'counterparty:'], /[a-zA-Z\s]+/),
      description: text.substring(0, 300), // Primeiros 300 caracteres como descrição
      rawText: text
    };
  }

  private parseReturn(text: string): any {
    // Implementação simplificada para extrair dados de devoluções
    const returnNumber = this.extractValue(text, ['devolução no:', 'return no:', 'número de devolução:'], /[\d-]+/);
    const dateMatch = text.match(/(\d{2}\/\d{2}\/\d{4})|(\d{4}-\d{2}-\d{2})/);
    const returnDate = dateMatch ? dateMatch[0] : null;
    const customerName = this.extractValue(text, ['cliente:', 'customer:', 'nome do cliente:'], /[a-zA-Z\s]+/);

    return {
      documentType: 'return',
      returnNumber,
      returnDate: this.parseDate(returnDate || ''), // Garantir que não é null
      customerName,
      reason: this.extractValue(text, ['motivo:', 'reason:'], /[^.\n]+/),
      rawText: text
    };
  }

  private extractValue(text: string, possibleLabels: string[], pattern: RegExp): string {
    const lowerText = text.toLowerCase();
    
    for (const label of possibleLabels) {
      const index = lowerText.indexOf(label);
      if (index !== -1) {
        const startPos = index + label.length;
        const segment = text.substring(startPos, startPos + 100); // Examinar os próximos 100 caracteres
        const match = segment.match(pattern);
        
        if (match) {
          return match[0].trim();
        }
      }
    }
    
    return '';
  }

  private parseDate(dateStr: string): string | null {
    if (!dateStr) return ''; // Retornar string vazia em vez de null
    
    // Converter para formato ISO (AAAA-MM-DD)
    if (dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    return dateStr; // Já está em formato ISO
  }

  private parseAmount(amountStr: string): number {
    if (!amountStr) return 0; // Retornar 0 em vez de null
    
    // Remover caracteres não numéricos exceto ponto e vírgula
    const cleaned = amountStr.replace(/[^\d.,]/g, '');
    
    // Substituir vírgula por ponto e converter para número
    return parseFloat(cleaned.replace(',', '.'));
  }

  private extractKeyValuePairs(text: string): any {
    const result = {};
    const lines = text.split('\n');
    
    for (const line of lines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex !== -1) {
        const key = line.substring(0, colonIndex).trim();
        const value = line.substring(colonIndex + 1).trim();
        
        if (key && value) {
          result[key] = value;
        }
      }
    }
    
    return result;
  }
}
