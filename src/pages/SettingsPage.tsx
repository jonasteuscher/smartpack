import { useMemo, useCallback } from 'react';
import type { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserSettings } from '@hooks/useUserSettings';
import type { UserSettings } from '@/types/userSettings';
import { useTheme, type ThemeSetting } from '@context/ThemeContext';
import type { AppLanguage } from '@/i18n';
import i18n from '@/i18n';

const THEME_OPTIONS: readonly {
  value: ThemeSetting;
  labelKey: string;
  fallback: string;
  icon: string;
}[] = [
  { value: 'system', labelKey: 'settings.sections.appearance.options.system', fallback: 'System default', icon: '🖥️' },
  { value: 'light', labelKey: 'settings.sections.appearance.options.light', fallback: 'Light', icon: '🌞' },
  { value: 'dark', labelKey: 'settings.sections.appearance.options.dark', fallback: 'Dark', icon: '🌙' }
];

interface LanguageOption {
  value: string;
  code: AppLanguage;
  labelKey: string;
  fallback: string;
}

const LANGUAGE_OPTIONS: readonly (LanguageOption & { icon: string })[] = [
  { value: 'de-CH', code: 'de', labelKey: 'settings.sections.language.options.deCH', fallback: 'German (Switzerland)', icon: '🇨🇭' },
  { value: 'en', code: 'en', labelKey: 'settings.sections.language.options.en', fallback: 'English', icon: '🇬🇧' },
  { value: 'fr-CH', code: 'fr', labelKey: 'settings.sections.language.options.frCH', fallback: 'French', icon: '🇫🇷' },
  { value: 'it-CH', code: 'it', labelKey: 'settings.sections.language.options.itCH', fallback: 'Italian', icon: '🇮🇹' }
];

const SettingsPage = () => {
  const { t } = useTranslation('dashboard');
  const { theme, setTheme } = useTheme();
  const { settings, loading, error, updateSettings, updateResult, isUpdating } = useUserSettings();

  const formatDateTime = useMemo(() => {
    const formatter =
      typeof Intl !== 'undefined'
        ? new Intl.DateTimeFormat(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short',
          })
        : null;

    return (value: string | null | undefined) => {
      if (!value) {
        return null;
      }
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        return null;
      }
      return formatter ? formatter.format(date) : date.toLocaleString();
    };
  }, []);

  const resolveUnitsLabel = (units: UserSettings['units']) =>
    t(`settings.preferences.values.units.${units}`, { defaultValue: units });

  const resolveTimeFormatLabel = (format: UserSettings['time_format']) =>
    t(`settings.preferences.values.timeFormat.${format}`, { defaultValue: format });

  const resolveDateFormatLabel = (format: UserSettings['date_format']) => {
    const key = format === 'YYYY-MM-DD' ? 'iso' : 'dayFirst';
    return t(`settings.preferences.values.dateFormat.${key}`, {
      defaultValue: format,
    });
  };

  const createdAt = formatDateTime(settings?.created_at);
  const updatedAt = formatDateTime(settings?.updated_at);

  const activeTheme = (settings?.theme ?? theme ?? 'system') as ThemeSetting;

  const activeLanguageValue = (() => {
    const stored =
      settings?.language ??
      (typeof window !== 'undefined' ? window.localStorage.getItem('smartpack-language') : null) ??
      i18n.language;

    if (typeof stored === 'string') {
      const normalized = LANGUAGE_OPTIONS.find(
        ({ value, code }) => value === stored || code === (stored.split('-')[0] as AppLanguage)
      );
      if (normalized) {
        return normalized.value;
      }
    }

    return LANGUAGE_OPTIONS[0]?.value ?? 'en';
  })();

  const statusMessage = useMemo(() => {
    if (updateResult.error) {
      return {
        tone: 'error' as const,
        text:
          updateResult.error.message ||
          t('settings.messages.saveFailed', { defaultValue: 'We could not save your preferences.' }),
      };
    }

    if (updateResult.success) {
      return {
        tone: 'success' as const,
        text: t('settings.messages.saved', { defaultValue: 'Preferences saved.' }),
      };
    }

    return null;
  }, [t, updateResult.error, updateResult.success]);

  const handleThemeChange = useCallback(
    async (event: ChangeEvent<HTMLSelectElement>) => {
      const nextTheme = event.target.value as ThemeSetting;
      if (nextTheme === activeTheme) {
        return;
      }
      const previousTheme = activeTheme;

      setTheme(nextTheme);
      const success = await updateSettings({ theme: nextTheme });
      if (!success) {
        setTheme(previousTheme);
      }
    },
    [activeTheme, setTheme, updateSettings]
  );

  const handleLanguageChange = useCallback(
    async (event: ChangeEvent<HTMLSelectElement>) => {
      const nextLanguage = event.target.value;
      if (nextLanguage === activeLanguageValue) {
        return;
      }
      const normalized = nextLanguage.split('-')[0] as AppLanguage;
      const previousLanguageValue = activeLanguageValue;
      const previousNormalized = previousLanguageValue.split('-')[0] as AppLanguage;

      if (typeof window !== 'undefined') {
        window.localStorage.setItem('smartpack-language', nextLanguage);
      }

      if (i18n.language !== normalized) {
        await i18n.changeLanguage(normalized);
      }

      const success = await updateSettings({ language: nextLanguage });

      if (!success) {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('smartpack-language', previousLanguageValue);
        }
        if (i18n.language !== previousNormalized) {
          await i18n.changeLanguage(previousNormalized);
        }
      }
    },
    [activeLanguageValue, updateSettings]
  );

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold">{t('settings.heading', { defaultValue: 'Settings' })}</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          {t('settings.subheading', { defaultValue: 'Manage your account preferences.' })}
        </p>
      </header>

      {statusMessage && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            statusMessage.tone === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300'
              : 'border-red-200 bg-red-50 text-red-600 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300'
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/60 p-6 shadow-sm backdrop-blur dark:border-slate-800/60 dark:bg-slate-900/60">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold">{t('settings.sections.appearance.title', { defaultValue: 'Appearance' })}</h2>
            <p className="text-sm text-[var(--text-secondary)]">
              {t('settings.sections.appearance.description', { defaultValue: 'Switch between light and dark themes to suit your preference.' })}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[var(--text-secondary)]" htmlFor="theme-setting">
              {t('settings.sections.appearance.themeLabel', { defaultValue: 'Theme mode' })}
            </label>
            <select
              id="theme-setting"
              value={activeTheme}
              onChange={handleThemeChange}
              disabled={loading || isUpdating}
              className="w-full max-w-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-[var(--text-primary)] shadow-sm focus:border-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary/30 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              {THEME_OPTIONS.map(({ value, labelKey, fallback, icon }) => (
                <option key={value} value={value}>
                  {`${icon} ${t(labelKey, { defaultValue: fallback })}`}
                </option>
              ))}
            </select>
          </div>
        </section>
        <section className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/60 p-6 shadow-sm backdrop-blur dark:border-slate-800/60 dark:bg-slate-900/60">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold">{t('settings.sections.language.title', { defaultValue: 'Language' })}</h2>
            <p className="text-sm text-[var(--text-secondary)]">
              {t('settings.sections.language.description', { defaultValue: 'Choose the language you want to use across the app.' })}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[var(--text-secondary)]" htmlFor="language-setting">
              {t('settings.sections.language.languageLabel', { defaultValue: 'Interface language' })}
            </label>
            <select
              id="language-setting"
              value={activeLanguageValue}
              onChange={handleLanguageChange}
              disabled={loading || isUpdating}
              className="w-full max-w-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-[var(--text-primary)] shadow-sm focus:border-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary/30 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              {LANGUAGE_OPTIONS.map(({ value, labelKey, fallback, icon }) => (
                <option key={value} value={value}>
                  {`${icon} ${t(labelKey, { defaultValue: fallback })}`}
                </option>
              ))}
            </select>
          </div>
        </section>
        <section className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/60 p-6 shadow-sm backdrop-blur dark:border-slate-800/60 dark:bg-slate-900/60">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold">
              {t('settings.sections.preferences.title', { defaultValue: 'Account preferences' })}
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              {t('settings.sections.preferences.description', {
                defaultValue: 'These values are stored in your account settings.',
              })}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/60 bg-white/70 p-4 text-sm shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70">
            {loading ? (
              <p className="text-[var(--text-secondary)]">
                {t('settings.preferences.state.loading', { defaultValue: 'Loading preferences…' })}
              </p>
            ) : error ? (
              <p className="text-sm text-red-500">
                {t('settings.preferences.state.error', {
                  defaultValue: 'We could not load your saved preferences.',
                })}
              </p>
            ) : settings ? (
              <ul className="flex flex-col divide-y divide-slate-200/70 dark:divide-slate-800/70">
                <li className="flex items-center justify-between py-2">
                  <span className="text-[var(--text-secondary)]">
                    {t('settings.preferences.labels.units', { defaultValue: 'Units' })}
                  </span>
                  <span className="font-medium text-[var(--text-primary)]">
                    {resolveUnitsLabel(settings.units)}
                  </span>
                </li>
                <li className="flex items-center justify-between py-2">
                  <span className="text-[var(--text-secondary)]">
                    {t('settings.preferences.labels.timeFormat', { defaultValue: 'Time format' })}
                  </span>
                  <span className="font-medium text-[var(--text-primary)]">
                    {resolveTimeFormatLabel(settings.time_format)}
                  </span>
                </li>
                <li className="flex items-center justify-between py-2">
                  <span className="text-[var(--text-secondary)]">
                    {t('settings.preferences.labels.dateFormat', { defaultValue: 'Date format' })}
                  </span>
                  <span className="font-medium text-[var(--text-primary)]">
                    {resolveDateFormatLabel(settings.date_format)}
                  </span>
                </li>
              </ul>
            ) : (
              <p className="text-[var(--text-secondary)]">
                {t('settings.preferences.state.empty', {
                  defaultValue: 'No preferences stored.',
                })}
              </p>
            )}
          </div>
        </section>
        <section className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/60 p-6 shadow-sm backdrop-blur dark:border-slate-800/60 dark:bg-slate-900/60">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold">
              {t('settings.sections.accountInformation.title', { defaultValue: 'Account information' })}
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              {t('settings.sections.accountInformation.description', {
                defaultValue: 'Timestamps related to your account data.',
              })}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200/60 bg-white/70 p-4 text-sm shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70">
            {loading ? (
              <p className="text-[var(--text-secondary)]">
                {t('settings.preferences.state.loading', { defaultValue: 'Loading preferences…' })}
              </p>
            ) : error ? (
              <p className="text-sm text-red-500">
                {t('settings.preferences.state.error', {
                  defaultValue: 'We could not load your saved preferences.',
                })}
              </p>
            ) : settings ? (
              <ul className="flex flex-col divide-y divide-slate-200/70 dark:divide-slate-800/70">
                <li className="flex items-center justify-between py-2 text-xs">
                  <span className="text-[var(--text-secondary)]">
                    {t('settings.accountInformation.labels.created', { defaultValue: 'Created at' })}
                  </span>
                  <span className="font-medium text-[var(--text-primary)]">
                    {createdAt ?? t('settings.accountInformation.state.unknown', { defaultValue: 'Unknown' })}
                  </span>
                </li>
                <li className="flex items-center justify-between py-2 text-xs">
                  <span className="text-[var(--text-secondary)]">
                    {t('settings.accountInformation.labels.updated', { defaultValue: 'Updated at' })}
                  </span>
                  <span className="font-medium text-[var(--text-primary)]">
                    {updatedAt ?? t('settings.accountInformation.state.unknown', { defaultValue: 'Unknown' })}
                  </span>
                </li>
              </ul>
            ) : (
              <p className="text-[var(--text-secondary)]">
                {t('settings.accountInformation.state.empty', {
                  defaultValue: 'No account information available.',
                })}
              </p>
            )}
          </div>
        </section>
      </div>
    </section>
  );
};

export default SettingsPage;
