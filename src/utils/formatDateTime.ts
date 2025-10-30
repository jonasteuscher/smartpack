export type TimeFormatPreference = '12h' | '24h';

interface FormatDateTimeOptions {
  locale?: string;
  timeFormat?: TimeFormatPreference | null;
  dateStyle?: Intl.DateTimeFormatOptions['dateStyle'];
  timeStyle?: Intl.DateTimeFormatOptions['timeStyle'];
}

export const formatDateTimeWithPreference = (
  value: string | Date | null | undefined,
  { locale, timeFormat, dateStyle = 'medium', timeStyle = 'short' }: FormatDateTimeOptions = {}
): string | null => {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const options: Intl.DateTimeFormatOptions = {
    dateStyle,
    timeStyle,
  };

  if (typeof timeFormat === 'string') {
    options.hour12 = timeFormat === '12h';
  }

  try {
    return new Intl.DateTimeFormat(locale || undefined, options).format(date);
  } catch {
    return date.toLocaleString(locale || undefined, options);
  }
};
