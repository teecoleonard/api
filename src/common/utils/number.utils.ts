export class NumberUtils {
  static parseNumber(value: string | number): number {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    
    const cleaned = value.toString().replace(/[^\d.,]/g, '');
    
    return parseFloat(cleaned.replace(',', '.')) || 0;
  }

  static formatCurrency(value: number | string): string {
    const number = this.parseNumber(value);
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(number);
  }

  static calculateTotal(quantity: number, unitPrice: number): number {
    return quantity * unitPrice;
  }

  static roundToTwoDecimals(value: number): number {
    return Math.round(value * 100) / 100;
  }

  static calculateDiscount(value: number, percentDiscount: number): number {
    if (percentDiscount < 0 || percentDiscount > 100) {
      throw new Error('O desconto deve estar entre 0 e 100%');
    }
    
    return this.roundToTwoDecimals(value * (1 - percentDiscount / 100));
  }
}
