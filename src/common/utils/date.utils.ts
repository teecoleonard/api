export class DateUtils {
  static parseDate(dateStr: string): Date | null {
    if (!dateStr) return null;
    
    if (dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/');
      return new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
    }
    
    return new Date(dateStr);
  }

  /**
   * Calcula a data de vencimento padrão a partir de uma data de início
   * @param startDate Data de início
   * @param daysToAdd Número de dias a adicionar (padrão: 30)
   */
  static calculateDueDate(startDate: Date | string, daysToAdd: number = 30): Date {
    const date = typeof startDate === 'string' ? new Date(startDate) : new Date(startDate);
    date.setDate(date.getDate() + daysToAdd);
    return date;
  }

  static formatToBrazilianDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('pt-BR');
  }

  static formatToISODate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toISOString().split('T')[0];
  }

  static isValidDate(date: any): boolean {
    if (!date) return false;
    
    const dateObj = date instanceof Date ? date : new Date(date);
    return !isNaN(dateObj.getTime());
  }

  static daysBetween(startDate: Date | string, endDate: Date | string): number {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    
    const differenceInTime = end.getTime() - start.getTime();
    return Math.ceil(differenceInTime / (1000 * 3600 * 24));
  }
}
