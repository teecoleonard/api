import { Injectable, Logger } from '@nestjs/common';
import * as mammoth from 'mammoth';

@Injectable()
export class DocxExtractor {
  private readonly logger = new Logger(DocxExtractor.name);

  async extract(filePath: string): Promise<any> {
    try {
      // Extrair texto do documento DOCX
      const result = await mammoth.extractRawText({ path: filePath });
      const text = result.value;
      
      return this.parseContent(text);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(`Erro ao extrair dados do DOCX: ${errorMessage}`);
      throw new Error(`Falha na extração do arquivo DOCX: ${errorMessage}`);
    }
  }

  private parseContent(text: string): any {
    // Detectar o tipo de documento com base no conteúdo
    if (text.toLowerCase().includes('contrato') || text.toLowerCase().includes('contract')) {
      return this.parseContract(text);
    } else if (text.toLowerCase().includes('fatura') || text.toLowerCase().includes('invoice')) {
      return this.parseInvoice(text);
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

  private parseContract(text: string): any {
    // Extrair número do contrato
    const contractNumberMatch = text.match(/contrato(?:\s+n[º°]?\.?)?(?:\s*[:]\s*|\s+)([A-Za-z0-9\/-]+)/i) || 
                                text.match(/contract(?:\s+no\.?)?(?:\s*[:]\s*|\s+)([A-Za-z0-9\/-]+)/i);
    
    // Extrair datas (início e fim)
    const dateRegex = /(\d{2}\/\d{2}\/\d{4})|(\d{4}-\d{2}-\d{2})/g;
    const dates = text.match(dateRegex) || [];
    
    // Extrair partes envolvidas
    const partyMatch = text.match(/(?:parte|party|contratante)(?:\s*[:]\s*|\s+)([^,\n.]+)/i);
    const counterpartyMatch = text.match(/(?:contraparte|counterparty|contratad[ao])(?:\s*[:]\s*|\s+)([^,\n.]+)/i);
    
    // Extrair valor do contrato
    const valueMatch = text.match(/(?:valor|value|montante)(?:\s*[:]\s*|\s+)(?:R\$\s*|€\s*|\$\s*)?(\d{1,3}(?:\.\d{3})*(?:,\d{2})?|\d+(?:,\d{2})?)/i);

    return {
      documentType: 'contract',
      contractNumber: contractNumberMatch ? contractNumberMatch[1].trim() : '',
      startDate: dates.length > 0 ? this.parseDate(dates[0]) : null,
      endDate: dates.length > 1 ? this.parseDate(dates[1]) : null,
      partyName: partyMatch ? partyMatch[1].trim() : '',
      counterpartyName: counterpartyMatch ? counterpartyMatch[1].trim() : '',
      value: valueMatch ? this.parseAmount(valueMatch[1]) : null,
      description: text.substring(0, 500), // Primeiros 500 caracteres como descrição
      status: 'active', // Status padrão
      rawText: text
    };
  }

  private parseInvoice(text: string): any {
    // Extrair número da fatura
    const invoiceNumberMatch = text.match(/fatura(?:\s+n[º°]?\.?)?(?:\s*[:]\s*|\s+)([A-Za-z0-9\/-]+)/i) || 
                               text.match(/invoice(?:\s+no\.?)?(?:\s*[:]\s*|\s+)([A-Za-z0-9\/-]+)/i);
    
    // Extrair data
    const dateMatch = text.match(/(\d{2}\/\d{2}\/\d{4})|(\d{4}-\d{2}-\d{2})/);
    
    // Extrair valor total
    const totalMatch = text.match(/(?:total|valor total|amount)(?:\s*[:]\s*|\s+)(?:R\$\s*|€\s*|\$\s*)?(\d{1,3}(?:\.\d{3})*(?:,\d{2})?|\d+(?:,\d{2})?)/i);
    
    // Extrair fornecedor
    const supplierMatch = text.match(/(?:fornecedor|supplier|emitente)(?:\s*[:]\s*|\s+)([^,\n.]+)/i);

    return {
      documentType: 'invoice',
      invoiceNumber: invoiceNumberMatch ? invoiceNumberMatch[1].trim() : '',
      issueDate: dateMatch ? this.parseDate(dateMatch[0]) : null,
      totalAmount: totalMatch ? this.parseAmount(totalMatch[1]) : null,
      supplier: supplierMatch ? supplierMatch[1].trim() : '',
      rawText: text
    };
  }

  private parseReturn(text: string): any {
    // Extrair número da devolução
    const returnNumberMatch = text.match(/devolu[çc][ãa]o(?:\s+n[º°]?\.?)?(?:\s*[:]\s*|\s+)([A-Za-z0-9\/-]+)/i) || 
                              text.match(/return(?:\s+no\.?)?(?:\s*[:]\s*|\s+)([A-Za-z0-9\/-]+)/i);
    
    // Extrair data
    const dateMatch = text.match(/(\d{2}\/\d{2}\/\d{4})|(\d{4}-\d{2}-\d{2})/);
    
    // Extrair cliente
    const customerMatch = text.match(/(?:cliente|customer)(?:\s*[:]\s*|\s+)([^,\n.]+)/i);
    
    // Extrair motivo
    const reasonMatch = text.match(/(?:motivo|reason|justificativa)(?:\s*[:]\s*|\s+)([^,\n.]+)/i);

    return {
      documentType: 'return',
      returnNumber: returnNumberMatch ? returnNumberMatch[1].trim() : '',
      returnDate: dateMatch ? this.parseDate(dateMatch[0]) : null,
      customerName: customerMatch ? customerMatch[1].trim() : '',
      reason: reasonMatch ? reasonMatch[1].trim() : '',
      rawText: text
    };
  }

  private parseDate(dateStr: string | undefined): string | null {
    if (!dateStr) return null;
    
    // Converter para formato ISO (AAAA-MM-DD)
    if (dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    return dateStr; // Já está em formato ISO
  }

  private parseAmount(amountStr: string): number | null {
    if (!amountStr) return 0; // Mudamos de null para 0 para evitar erros de tipo
    
    // Remover caracteres não numéricos exceto ponto e vírgula
    const cleaned = amountStr.replace(/[^\d.,]/g, '');
    
    // Substituir vírgula por ponto e converter para número
    return parseFloat(cleaned.replace(',', '.')) || 0;
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
