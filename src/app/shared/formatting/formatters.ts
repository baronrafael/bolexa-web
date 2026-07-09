export function formatDateEsVe(value: string | Date, options: Intl.DateTimeFormatOptions = { dateStyle: 'medium', timeStyle: 'short' }): string {
  return new Intl.DateTimeFormat('es-VE', options).format(new Date(value));
}

export function formatMoneyEsVe(value: number, currency = 'USD', options: Intl.NumberFormatOptions = {}): string {
  return new Intl.NumberFormat('es-VE', {
    currency,
    style: 'currency',
    ...options,
  }).format(value);
}
