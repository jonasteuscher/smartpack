import { useTranslation } from 'react-i18next';

const PacklistsPage = () => {
  const { t } = useTranslation('dashboard');

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold">{t('packlists.heading')}</h1>
        <p className="text-sm text-[var(--text-secondary)]">{t('packlists.subheading')}</p>
      </header>

      <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/40 p-6 shadow dark:border-slate-800/60 dark:bg-slate-900/60">
        <p className="text-sm text-[var(--text-secondary)]">{t('packlists.placeholder')}</p>
      </div>
    </section>
  );
};

export default PacklistsPage;
