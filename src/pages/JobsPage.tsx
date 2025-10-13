import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '@/components/landing/Header';
import FooterSection from '@/components/landing/sections/FooterSection';

interface ValueItem {
  title: string;
  description: string;
};

interface PerkItem {
  title: string;
  description: string;
};

const JobsPage = () => {
  const { t } = useTranslation();
  const values = t('jobsPage.values.items', { returnObjects: true }) as ValueItem[];
  const perks = t('jobsPage.perks.items', { returnObjects: true }) as PerkItem[];

  return (
    <div className="relative flex min-h-screen flex-col gap-16 pb-20">
      <div className="sticky top-4 z-30 pt-6">
        <Header />
      </div>

      <section className="pt-8">
        <div className="container-responsive">
          <span className="inline-flex rounded-full bg-brand-secondary/90 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow">
            {t('jobsPage.hero.badge')}
          </span>
          <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,1.1fr),minmax(0,0.9fr)]">
            <div className="space-y-6">
              <h1 className="section-heading text-5xl text-slate-900 dark:text-white sm:text-6xl">
                {t('jobsPage.hero.headline')}
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300">{t('jobsPage.hero.description')}</p>
              <div className="rounded-3xl border border-brand-secondary/30 bg-brand-secondary/10 p-6 text-sm text-brand-secondary shadow-sm dark:border-brand-secondary/50 dark:bg-brand-secondary/20 dark:text-slate-100">
                <p className="font-semibold uppercase tracking-[0.35em]">{t('jobsPage.hero.status.title')}</p>
                <p className="mt-2 text-base text-slate-700 dark:text-white">{t('jobsPage.hero.status.message')}</p>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-300">{t('jobsPage.hero.followUp')}</p>
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  to="/team"
                  className="inline-flex items-center gap-2 rounded-full bg-white/90 px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-1 hover:bg-brand-primary/20 hover:text-brand-secondary dark:bg-slate-900/70 dark:text-slate-100"
                >
                  {t('jobsPage.hero.cta.team')}
                </Link>
                <a
                  href="mailto:hello@smartpack.app"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 transition hover:border-brand-secondary hover:text-brand-secondary dark:border-slate-700 dark:text-slate-200"
                >
                  {t('jobsPage.hero.cta.contact')}
                </a>
              </div>
            </div>
            <div className="rounded-3xl border border-white/20 bg-white/80 p-8 shadow-xl backdrop-blur dark:border-slate-800/60 dark:bg-slate-900/60">
              <p className="text-sm uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">
                {t('jobsPage.values.title')}
              </p>
              <ul className="mt-4 space-y-4 text-sm text-slate-600 dark:text-slate-300">
                {values.map((value) => (
                  <li key={value.title} className="rounded-2xl border border-slate-100/60 bg-white/70 px-5 py-4 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/60">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{value.title}</p>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{value.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-16 pt-6">
        <div className="container-responsive">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr),minmax(0,0.9fr)]">
            <div className="space-y-6">
              <h2 className="section-heading text-4xl text-slate-900 dark:text-white">{t('jobsPage.perks.headline')}</h2>
              <p className="text-lg text-slate-600 dark:text-slate-300">{t('jobsPage.perks.description')}</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {perks.map((perk) => (
                  <div
                    key={perk.title}
                    className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800/60 dark:bg-slate-900/70"
                  >
                    <p className="text-base font-semibold text-slate-900 dark:text-white">{perk.title}</p>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{perk.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <div className="rounded-3xl border border-white/30 bg-white/80 p-6 shadow-lg backdrop-blur dark:border-slate-800/60 dark:bg-slate-900/70">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">
                  {t('jobsPage.keepInTouch.title')}
                </p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t('jobsPage.keepInTouch.description')}</p>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                  <a
                    href="https://smartpack.app/newsletter"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow transition hover:-translate-y-0.5 hover:bg-brand-secondary dark:bg-brand-secondary"
                  >
                    {t('jobsPage.keepInTouch.newsletter')}
                  </a>
                  <span className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                    {t('jobsPage.keepInTouch.frequency')}
                  </span>
                </div>
              </div>
              <div className="rounded-3xl border border-brand-primary/30 bg-brand-primary/10 p-6 text-sm text-slate-700 shadow-sm dark:border-brand-primary/40 dark:bg-brand-primary/20 dark:text-slate-900">
                <p className="font-semibold uppercase tracking-[0.35em]">{t('jobsPage.future.title')}</p>
                <p className="mt-2 text-base">{t('jobsPage.future.message')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default JobsPage;
