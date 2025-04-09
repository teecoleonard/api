import { Injectable, Logger } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ExcelExtractor {
  private readonly logger = new Logger(ExcelExtractor.name);

  async extract(filePath: string): Promise<any> {
    try {
      // Carregar o arquivo Excel
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
      
      const sheetsData: Record<string, any[]> = {};

      workbook.eachSheet((worksheet, sheetId) => {
        const rows: any[] = [];
        let headers: string[] = [];

        worksheet.eachRow((row, rowNumber) => {
          const values = row.values as any[];

          if (rowNumber === 1) {
            headers = values.slice(1).map(v => String(v).toLowerCase());
          } else {
            const rowData: Record<string, any> = {};
            values.slice(1).forEach((cell, idx) => {
              rowData[headers[idx]] = cell;
            });
            rows.push(rowData);
          }
        });

        sheetsData[worksheet.name] = rows;
      });

      return this.identifyDocumentType(sheetsData);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(`Erro ao extrair dados do Excel: ${errorMessage}`);
      throw new Error(`Falha na extração do arquivo Excel: ${errorMessage}`);
    }
  }

  private identifyDocumentType(sheetsData: any): any {
    // Verificar pelas palavras-chave nas propriedades ou nas colunas
    const headers = this.getAllHeaders(sheetsData);
    const mainSheet = Object.keys(sheetsData)[0];
    const data = sheetsData[mainSheet];
    
    // Se não houver dados, retornar um objeto genérico
    if (!data || data.length === 0) {
      return {
        documentType: 'unknown',
        rawData: sheetsData
      };
    }

    // Verificar se é uma fatura
    if (
      this.containsAny(headers, ['fatura', 'invoice', 'nota fiscal']) ||
      this.hasInvoiceStructure(data)
    ) {
      return this.processInvoice(data);
    }
    
    // Verificar se são devoluções
    if (
      this.containsAny(headers, ['devolução', 'return', 'retorno']) ||
      this.hasReturnStructure(data)
    ) {
      return this.processReturn(data);
    }
    
    // Verificar se é um contrato
    if (
      this.containsAny(headers, ['contrato', 'contract', 'acordo'])
    ) {
      return this.processContract(data);
    }
    
    // Se não for possível determinar o tipo, retornar dados genéricos
    return {
      documentType: 'unknown',
      rawData: sheetsData,
      parsedData: data
    };
  }

  private getAllHeaders(sheetsData: any): string[] {
    const headers: string[] = [];
    
    // Coletar todos os cabeçalhos de todas as planilhas
    for (const sheetName in sheetsData) {
      const data = sheetsData[sheetName];
      if (data && data.length > 0) {
        const firstRow = data[0];
        headers.push(...Object.keys(firstRow).map(key => key.toLowerCase()));
      }
    }
    
    return headers;
  }

  private containsAny(array: string[], keywords: string[]): boolean {
    return array.some(item => 
      keywords.some(keyword => 
        item.toLowerCase().includes(keyword.toLowerCase())
      )
    );
  }

  private hasInvoiceStructure(data: any[]): boolean {
    // Verifica se contém colunas típicas de faturas
    const firstRow = data[0];
    const keys = Object.keys(firstRow).map(k => k.toLowerCase());
    
    return (
      this.containsAny(keys, ['valor', 'total', 'price', 'amount']) &&
      this.containsAny(keys, ['produto', 'item', 'product', 'descrição', 'description'])
    );
  }

  private hasReturnStructure(data: any[]): boolean {
    // Verifica se contém colunas típicas de devoluções
    const firstRow = data[0];
    const keys = Object.keys(firstRow).map(k => k.toLowerCase());
    
    return (
      this.containsAny(keys, ['motivo', 'razão', 'reason']) ||
      (this.containsAny(keys, ['produto', 'item', 'product']) && 
       this.containsAny(keys, ['status', 'devolvido', 'returned']))
    );
  }

  private processInvoice(data: any[]): any {
    let invoiceNumber = '';
    let issueDate = '';
    let totalAmount = 0;
    let supplier = '';
    let customer = '';
    
    // Tentar identificar os campos específicos de fatura
    const firstRow = data[0];
    const keys = Object.keys(firstRow);
    
    // Procurar pelo número da fatura
    for (const key of keys) {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey.includes('fatura') || lowerKey.includes('invoice') || 
        lowerKey.includes('número') || lowerKey.includes('number')
      ) {
        invoiceNumber = firstRow[key] || '';
        break;
      }
    }
    
    // Procurar pela data
    for (const key of keys) {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey.includes('data') || lowerKey.includes('date') || 
        lowerKey.includes('emissão') || lowerKey.includes('issue')
      ) {
        const dateValue = firstRow[key];
        if (dateValue) {
          // Tentar converter para data ISO
          try {
            const date = new Date(dateValue);
            issueDate = date.toISOString().split('T')[0]; // issueDate agora é sempre string
          } catch (e) {
            issueDate = String(dateValue); // Converter para string se não for uma data válida
          }
        }
        break;
      }
    }
    
    // Procurar pelo valor total
    for (const key of keys) {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey.includes('total') || lowerKey.includes('valor') || 
        lowerKey.includes('amount') || lowerKey.includes('price')
      ) {
        const amount = firstRow[key];
        if (amount) {
          if (typeof amount === 'number') {
            totalAmount = amount;
          } else {
            // Converter string para número
            totalAmount = this.parseAmount(amount);
          }
        }
        break;
      }
    }
    
    // Procurar pelo fornecedor
    for (const key of keys) {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey.includes('fornecedor') || lowerKey.includes('supplier') || 
        lowerKey.includes('vendedor') || lowerKey.includes('seller')
      ) {
        supplier = firstRow[key] || '';
        break;
      }
    }
    
    // Procurar pelo cliente
    for (const key of keys) {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey.includes('cliente') || lowerKey.includes('customer') || 
        lowerKey.includes('comprador') || lowerKey.includes('buyer')
      ) {
        customer = firstRow[key] || '';
        break;
      }
    }
    
    return {
      documentType: 'invoice',
      invoiceNumber,
      issueDate,
      totalAmount,
      supplier,
      customerName: customer,
      items: data,
      rawData: data
    };
  }

  private processReturn(data: any[]): any {
    let returnNumber = '';
    let returnDate = '';
    let customerName = '';
    let reason = '';
    
    // Tentar identificar os campos específicos de devolução
    const firstRow = data[0];
    const keys = Object.keys(firstRow);
    
    // Procurar pelo número da devolução
    for (const key of keys) {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey.includes('devolução') || lowerKey.includes('return') || 
        lowerKey.includes('número') || lowerKey.includes('number')
      ) {
        returnNumber = firstRow[key] || '';
        break;
      }
    }
    
    // Procurar pela data
    for (const key of keys) {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey.includes('data') || lowerKey.includes('date')
      ) {
        const dateValue = firstRow[key];
        if (dateValue) {
          try {
            const date = new Date(dateValue);
            returnDate = date.toISOString().split('T')[0]; // returnDate agora é sempre string
          } catch (e) {
            returnDate = String(dateValue); // Converter para string se não for uma data válida
          }
        }
        break;
      }
    }
    
    // Procurar pelo cliente
    for (const key of keys) {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey.includes('cliente') || lowerKey.includes('customer')
      ) {
        customerName = firstRow[key] || '';
        break;
      }
    }
    
    // Procurar pelo motivo
    for (const key of keys) {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey.includes('motivo') || lowerKey.includes('reason') || 
        lowerKey.includes('justificativa') || lowerKey.includes('explanation')
      ) {
        reason = firstRow[key] || '';
        break;
      }
    }
    
    // Calcular o valor total baseado nos itens, se disponível
    let totalAmount = 0;
    for (const row of data) {
      for (const key in row) {
        const lowerKey = key.toLowerCase();
        if (lowerKey.includes('valor') || lowerKey.includes('amount') || lowerKey.includes('price')) {
          const amount = row[key];
          if (amount) {
            if (typeof amount === 'number') {
              totalAmount += amount;
            } else {
              totalAmount += this.parseAmount(amount);
            }
          }
        }
      }
    }
    
    return {
      documentType: 'return',
      returnNumber,
      returnDate,
      customerName,
      reason,
      totalAmount,
      items: data,
      rawData: data
    };
  }

  private processContract(data: any[]): any {
    let contractNumber = '';
    let startDate = '';
    let endDate = '';
    let partyName = '';
    let counterpartyName = '';
    let value = 0;
    let description = '';
    
    // Tentar identificar os campos específicos de contrato
    const firstRow = data[0];
    const keys = Object.keys(firstRow);
    
    // Procurar pelo número do contrato
    for (const key of keys) {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey.includes('contrato') || lowerKey.includes('contract') || 
        lowerKey.includes('número') || lowerKey.includes('number')
      ) {
        contractNumber = firstRow[key] || '';
        break;
      }
    }
    
    // Procurar pela data de início
    for (const key of keys) {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey.includes('início') || lowerKey.includes('start') || 
        lowerKey.includes('data') || lowerKey.includes('date')
      ) {
        const dateValue = firstRow[key];
        if (dateValue) {
          try {
            const date = new Date(dateValue);
            startDate = date.toISOString().split('T')[0]; // startDate agora é sempre string
          } catch (e) {
            startDate = String(dateValue); // Converter para string se não for uma data válida
          }
        }
        break;
      }
    }
    
    // Procurar pela data de término
    for (const key of keys) {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey.includes('fim') || lowerKey.includes('end') || 
        lowerKey.includes('término') || lowerKey.includes('termination')
      ) {
        const dateValue = firstRow[key];
        if (dateValue) {
          try {
            const date = new Date(dateValue);
            endDate = date.toISOString().split('T')[0]; // endDate agora é sempre string
          } catch (e) {
            endDate = String(dateValue); // Converter para string se não for uma data válida
          }
        }
        break;
      }
    }
    
    // Procurar pelas partes
    for (const key of keys) {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey.includes('parte') || lowerKey.includes('party') || 
        lowerKey.includes('contratante') || lowerKey.includes('contractor')
      ) {
        partyName = firstRow[key] || '';
        break;
      }
    }
    
    for (const key of keys) {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey.includes('contraparte') || lowerKey.includes('counterparty') || 
        lowerKey.includes('contratado') || lowerKey.includes('contracted')
      ) {
        counterpartyName = firstRow[key] || '';
        break;
      }
    }
    
    // Procurar pelo valor
    for (const key of keys) {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey.includes('valor') || lowerKey.includes('value') || 
        lowerKey.includes('montante') || lowerKey.includes('amount')
      ) {
        const amount = firstRow[key];
        if (amount) {
          if (typeof amount === 'number') {
            value = amount;
          } else {
            value = this.parseAmount(amount);
          }
        }
        break;
      }
    }
    
    // Procurar pela descrição
    for (const key of keys) {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey.includes('descrição') || lowerKey.includes('description') || 
        lowerKey.includes('objeto') || lowerKey.includes('object')
      ) {
        description = firstRow[key] || '';
        break;
      }
    }
    
    return {
      documentType: 'contract',
      contractNumber,
      startDate,
      endDate,
      partyName,
      counterpartyName,
      value,
      description,
      status: 'active', // Status padrão
      rawData: data
    };
  }

  private parseAmount(amountStr: string): number {
    if (!amountStr) return 0;
    
    if (typeof amountStr === 'number') return amountStr;
    
    // Remover caracteres não numéricos exceto ponto e vírgula
    const cleaned = amountStr.toString().replace(/[^\d.,]/g, '');
    
    // Substituir vírgula por ponto e converter para número
    return parseFloat(cleaned.replace(',', '.')) || 0;
  }
}
