import { useTranslation } from 'react-i18next';

interface SettingsStatusMessage {
  tone: 'success' | 'error';
  text: string;
}

interface SettingsHeaderProps {
  statusMessage: SettingsStatusMessage | null;
}

const SettingsHeader = ({ statusMessage }: SettingsHeaderProps) => {
  const { t } = useTranslation('dashboard');

  return (
    <header className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold">
          {t('settings.heading', { defaultValue: 'Settings' })}
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          {t('settings.subheading', { defaultValue: 'Manage your account preferences.' })}
        </p>
      </div>
      {statusMessage ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            statusMessage.tone === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300'
              : 'border-red-200 bg-red-50 text-red-600 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300'
          }`}
        >
          {statusMessage.text}
        </div>
      ) : null}
    </header>
  );
};

export type { SettingsStatusMessage };
export default SettingsHeader;
