import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@components/common/LanguageSwitcher';
import ThemeToggle from '@components/common/ThemeToggle';
import { useUserSettings } from '@hooks/useUserSettings';
import type { UserSettings } from '@/types/userSettings';

const SettingsPage = () => {
  const { t } = useTranslation('dashboard');
  const { settings, loading, error } = useUserSettings();

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

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold">{t('settings.heading', { defaultValue: 'Settings' })}</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          {t('settings.subheading', { defaultValue: 'Manage your account preferences.' })}
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/60 p-6 shadow-sm backdrop-blur dark:border-slate-800/60 dark:bg-slate-900/60">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold">{t('settings.sections.appearance.title', { defaultValue: 'Appearance' })}</h2>
            <p className="text-sm text-[var(--text-secondary)]">
              {t('settings.sections.appearance.description', { defaultValue: 'Switch between light and dark themes to suit your preference.' })}
            </p>
          </div>
          <div className="flex items-center justify-start">
            <ThemeToggle />
          </div>
        </section>
        <section className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/60 p-6 shadow-sm backdrop-blur dark:border-slate-800/60 dark:bg-slate-900/60">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold">{t('settings.sections.language.title', { defaultValue: 'Language' })}</h2>
            <p className="text-sm text-[var(--text-secondary)]">
              {t('settings.sections.language.description', { defaultValue: 'Choose the language you want to use across the app.' })}
            </p>
          </div>
          <div className="flex items-center justify-start">
            <LanguageSwitcher />
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
