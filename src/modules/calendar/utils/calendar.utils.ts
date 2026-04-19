export const calendarUtils = {

  /**
   * Format date for display (e.g., Feb 24, 2026)
   */
  formatDate(date: Date, options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }): string {
    return new Intl.DateTimeFormat('pt-BR', options).format(date);
  },

  /**
   * Get days in month for calendar grid
   */
  getDaysInMonth(year: number, month: number): Date[] {
    const date = new Date(year, month, 1);
    const days: Date[] = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  },

  /**
   * Get start and end of month as ISO strings (widened for timezone safety)
   */
  getMonthRange(date: Date) {
    const start = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0);
    start.setHours(start.getHours() - 12); // Widen for timezone
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
    end.setHours(end.getHours() + 12);     // Widen for timezone
    return {
      start: start.toISOString(),
      end: end.toISOString(),
    };
  },

  /**
   * Get start and end of week as ISO strings (widened for timezone safety)
   */
  getWeekRange(date: Date) {
    const start = new Date(date);
    const day = start.getDay();
    start.setDate(start.getDate() - day);
    start.setHours(0, 0, 0, 0);
    start.setHours(start.getHours() - 12);

    const end = new Date(start);
    end.setDate(end.getDate() + 7); // Adjust to get full 7 days + padding
    end.setHours(12, 0, 0, 0);

    return {
      start: start.toISOString(),
      end: end.toISOString(),
    };
  },

  /**
   * Get start and end of day as ISO strings (widened for timezone safety)
   */
  getDayRange(date: Date) {
    const start = new Date(date);
    start.setHours(-12, 0, 0, 0);

    const end = new Date(date);
    end.setHours(36, 0, 0, 0);

    return {
      start: start.toISOString(),
      end: end.toISOString(),
    };
  },

  /**
   * Get days in week for week view
   */
  getDaysInWeek(date: Date): Date[] {
    const start = new Date(date);
    const day = start.getDay();
    start.setDate(start.getDate() - day);
    
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      days.push(new Date(start));
      start.setDate(start.getDate() + 1);
    }
    return days;
  },

  /**
   * Returns holiday name if the date is a holiday in 2026 (Brazil)
   */
  getHoliday(date: Date): string | null {
    if (date.getFullYear() !== 2026) return null;
    
    const month = date.getMonth();
    const day = date.getDate();
    
    const holidays: Record<string, string> = {
      '0-1': 'Confraternização Universal',
      '1-16': 'Carnaval',
      '1-17': 'Carnaval',
      '3-3': 'Sexta-feira Santa',
      '3-5': 'Páscoa',
      '3-21': 'Tiradentes',
      '4-1': 'Dia do Trabalho',
      '5-4': 'Corpus Christi',
      '8-7': 'Independência do Brasil',
      '9-12': 'Nossa Senhora Aparecida',
      '10-2': 'Finados',
      '10-15': 'Proclamação da República',
      '10-20': 'Dia da Consciência Negra',
      '11-25': 'Natal'
    };
    
    return holidays[`${month}-${day}`] || null;
  }
};
