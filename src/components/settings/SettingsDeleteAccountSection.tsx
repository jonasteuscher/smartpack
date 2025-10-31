import { useTranslation } from 'react-i18next';

interface SettingsDeleteAccountSectionProps {
  disabled: boolean;
  onRequestDelete: () => void;
}

const SettingsDeleteAccountSection = ({
  disabled,
  onRequestDelete,
}: SettingsDeleteAccountSectionProps) => {
  const { t } = useTranslation('dashboard');

  return (
    <section className="relative z-10 flex min-w-0 flex-col gap-4 rounded-2xl border border-red-200/70 bg-red-50/80 p-6 shadow-sm backdrop-blur dark:border-red-500/40 dark:bg-red-500/10 lg:col-span-2">
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-red-700 dark:text-red-300">
          {t('settings.deleteAccount.title', { defaultValue: 'Delete account' })}
        </h2>
        <p className="text-sm text-red-700/90 dark:text-red-200">
          {t('settings.deleteAccount.description', {
            defaultValue:
              'Deleting your account permanently removes your data. This action cannot be undone.',
          })}
        </p>
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onRequestDelete}
          disabled={disabled}
          className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {t('settings.deleteAccount.button', { defaultValue: 'Delete account' })}
        </button>
      </div>
    </section>
  );
};

export default SettingsDeleteAccountSection;
