import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { UserSettings } from '@/types/userSettings';

interface SettingsAccountInfoSectionProps {
  settings: UserSettings | null | undefined;
  loading: boolean;
  error: Error | null;
  formatDateTime: (value: string | null | undefined) => string | null;
}

const SettingsAccountInfoSection = ({
  settings,
  loading,
  error,
  formatDateTime,
}: SettingsAccountInfoSectionProps) => {
  const { t } = useTranslation('dashboard');

  const createdAt = useMemo(
    () => formatDateTime(settings?.created_at),
    [formatDateTime, settings?.created_at]
  );
  const updatedAt = useMemo(
    () => formatDateTime(settings?.updated_at),
    [formatDateTime, settings?.updated_at]
  );

  return (
    <section className="relative z-10 flex min-w-0 flex-col gap-3 rounded-2xl border border-white/10 bg-white/60 p-6 shadow-sm backdrop-blur focus-within:z-[60] dark:border-slate-800/60 dark:bg-slate-900/60">
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
      <div>
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
            <li className="flex flex-col gap-1 py-2 text-xs sm:flex-row sm:items-center sm:justify-between">
              <span className="text-[var(--text-secondary)]">
                {t('settings.accountInformation.labels.created', { defaultValue: 'Created at' })}
              </span>
              <span className="font-medium text-[var(--text-primary)]">
                {createdAt ?? t('settings.accountInformation.state.unknown', { defaultValue: 'Unknown' })}
              </span>
            </li>
            <li className="flex flex-col gap-1 py-2 text-xs sm:flex-row sm:items-center sm:justify-between">
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
  );
};

export default SettingsAccountInfoSection;
