import { useTranslation } from 'react-i18next';

type MetricItem = {
  label: string;
  value: string;
  caption: string;
};

type MetricsQuote = {
  text: string;
  author: string;
};

const MetricsSection = () => {
  const { t } = useTranslation();
  const metricItems = t('metrics.items', { returnObjects: true }) as MetricItem[];
  const quote = t('metrics.quote', { returnObjects: true }) as MetricsQuote;

  return (
    <section className="relative py-24">
      <div className="absolute inset-x-0 top-0 -z-10 bg-gradient-to-b from-brand-secondary/10 via-transparent to-transparent" aria-hidden="true" />
      <div className="container-responsive">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.9fr),minmax(0,1.1fr)]">
          <div>
            <h2 className="section-heading text-4xl text-slate-900 dark:text-white">{t('metrics.headline')}</h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">{t('metrics.description')}</p>
            <div className="mt-6 rounded-3xl border border-white/40 bg-white/70 p-6 shadow-lg backdrop-blur dark:border-slate-700/60 dark:bg-slate-900/70">
              <p className="text-sm text-slate-500 dark:text-slate-300">
                “{quote.text}” – <span className="font-semibold text-slate-900 dark:text-white">{quote.author}</span>
              </p>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {metricItems.map((metric) => (
              <div
                key={metric.label}
                className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800/60 dark:bg-slate-900/70"
              >
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">{metric.label}</p>
                <p className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white">{metric.value}</p>
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-300">{metric.caption}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MetricsSection;
