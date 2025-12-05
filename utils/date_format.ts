export function formatLocalDate(date: number, locale = 'id-ID') {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date * 1000);
}

export function formatLocalDateTime(
  date: number | Date, 
  locale = 'id-ID',
  options: Intl.DateTimeFormatOptions = {}
): string {
  const dateObj = typeof date === 'number' ? new Date(date * 1000) : date;
  
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false, // Format 24 jam
    ...options
  }).format(dateObj);

}