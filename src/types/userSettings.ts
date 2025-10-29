export interface UserSettings {
  user_id: string;
  theme: 'system' | 'light' | 'dark';
  language: string;
  units: 'metric' | 'imperial';
  time_format: '24h' | '12h';
  date_format: 'YYYY-MM-DD' | 'DD.MM.YYYY';
  preferences: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}
