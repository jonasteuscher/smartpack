import { useTranslation } from 'react-i18next';

const SettingsPage = () => {
  const { t } = useTranslation('dashboard');

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold">{t('settings.heading', { defaultValue: 'Settings' })}</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          {t('settings.subheading', { defaultValue: 'Manage your account preferences.' })}
        </p>
      </header>

      <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/40 p-6 shadow dark:border-slate-800/60 dark:bg-slate-900/60">
        <p className="text-sm text-[var(--text-secondary)]">
          {t('settings.placeholder', { defaultValue: 'Settings content coming soon.' })}
        </p>
      </div>
    </section>
  );
};

export default SettingsPage;
