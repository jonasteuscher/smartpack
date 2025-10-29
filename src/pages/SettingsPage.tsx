import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@components/common/LanguageSwitcher';
import ThemeToggle from '@components/common/ThemeToggle';

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
      </div>
    </section>
  );
};

export default SettingsPage;
