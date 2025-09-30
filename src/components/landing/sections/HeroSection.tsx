import { ArrowRightIcon, PlayCircleIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

const HERO_STATS_KEYS = ['travelers', 'checklists', 'support'] as const;
const CATEGORY_COLORS = ['bg-brand-primary', 'bg-brand-secondary', 'bg-cyan-400', 'bg-amber-300'] as const;

type HeroStatKey = (typeof HERO_STATS_KEYS)[number];

type Insight = {
  label: string;
  value: string;
};

type HeroProgress = {
  label: string;
  completion: string;
  categories: string[];
};

const HeroSection = () => {
  const { t } = useTranslation();

  const sellingPoints = t('hero.points', { returnObjects: true }) as string[];
  const insights = t('hero.insights', { returnObjects: true }) as Insight[];
  const progress = t('hero.progress', { returnObjects: true }) as HeroProgress;

  const stats = HERO_STATS_KEYS.map((key: HeroStatKey) => ({
    key,
    label: t(`hero.stats.${key}.label`),
    value: t(`hero.stats.${key}.value`)
  }));

  return (
    <section id="hero" className="relative isolate overflow-hidden pb-24 pt-20 sm:pt-28">
      <div className="absolute inset-x-0 top-0 -z-10 transform-gpu overflow-hidden blur-3xl" aria-hidden="true">
        <div className="relative left-1/2 aspect-[6/5] w-[72.1875rem] -translate-x-1/2 bg-gradient-to-tr from-brand-secondary/40 via-brand-primary/50 to-transparent opacity-60 dark:via-brand-primary/30" />
      </div>

      <div className="container-responsive">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.2fr),minmax(0,1fr)]">
          <div className="flex flex-col gap-6">
            <span className="inline-flex w-fit rounded-full bg-slate-900/90 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow dark:bg-white/90 dark:text-slate-900">
              {t('hero.badge')}
            </span>
            <h1 className="section-heading text-5xl leading-tight text-slate-900 dark:text-white sm:text-6xl">
              {t('hero.headline')}
            </h1>
            <p className="max-w-xl text-lg text-slate-600 dark:text-slate-300">{t('hero.description')}</p>
            <ul className="grid gap-3 text-sm text-slate-500 dark:text-slate-300">
              {sellingPoints.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-primary/20 text-brand-secondary">
                    •
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <a
                href="#demo"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-secondary to-brand-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-secondary/30 transition hover:-translate-y-1"
              >
                {t('hero.ctaPrimary')}
                <ArrowRightIcon className="h-4 w-4" />
              </a>
              <a
                href="#demo"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-6 py-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-brand-secondary hover:text-brand-secondary dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200"
              >
                <PlayCircleIcon className="h-5 w-5" />
                {t('hero.ctaSecondary')}
              </a>
            </div>
            <dl className="mt-6 grid w-full grid-cols-3 gap-4 text-left">
              {stats.map((stat) => (
                <div key={stat.key}>
                  <dt className="text-xs uppercase tracking-widest text-slate-500">{stat.label}</dt>
                  <dd className="text-2xl font-semibold text-slate-900 dark:text-white">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-tr from-brand-secondary/10 via-transparent to-brand-primary/20 blur-2xl" />
            <div className="glass-panel relative rounded-3xl p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-brand-secondary">{t('hero.livePreview.label')}</p>
                  <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">
                    {t('hero.livePreview.scenario')}
                  </h2>
                </div>
                <div className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white shadow dark:bg-brand-secondary">
                  {t('hero.livePreview.efficiency')}
                </div>
              </div>
              <div className="mt-6 space-y-4">
                {insights.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/20 bg-white/60 p-4 shadow-sm transition hover:border-brand-secondary/40 dark:border-slate-700/60 dark:bg-slate-900/60"
                  >
                    <span className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">{item.label}</span>
                    <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-2xl bg-slate-900/95 p-4 text-white shadow-lg dark:bg-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{progress.label}</span>
                  <span className="text-xs text-white/70">{progress.completion}</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-white/20">
                  <div className="h-full w-[84%] rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary" />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-white/80">
                  {progress.categories.map((category, index) => (
                    <div key={category} className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${CATEGORY_COLORS[index] ?? 'bg-white/60'}`} />
                      {category}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute -bottom-10 left-10 hidden rounded-3xl bg-white px-6 py-5 shadow-xl shadow-brand-primary/30 md:block dark:bg-slate-900/80">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-300">{t('hero.reminder.title')}</p>
              <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">{t('hero.reminder.message')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
