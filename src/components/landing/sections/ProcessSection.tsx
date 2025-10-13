import {
  ClipboardDocumentCheckIcon,
  GlobeAmericasIcon,
  SparklesIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

const STEP_ICONS = [GlobeAmericasIcon, SparklesIcon, ClipboardDocumentCheckIcon, UserPlusIcon] as const;

interface ProcessStep {
  title: string;
  description: string;
  stat: string;
};

const ProcessSection = () => {
  const { t } = useTranslation();
  const steps = t('process.steps', { returnObjects: true }) as ProcessStep[];
  const stepLabel = t('process.stepLabel');

  return (
    <section id="workflow" className="py-24">
      <div className="container-responsive">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.35em] text-brand-secondary">
            {t('process.tagline')}
          </span>
          <h2 className="section-heading mt-4 text-4xl text-slate-900 dark:text-white">{t('process.headline')}</h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">{t('process.description')}</p>
        </div>
        <div className="mt-16 grid gap-6 lg:grid-cols-4">
          {steps.map(({ title, description, stat }, index) => {
            const Icon = STEP_ICONS[index] ?? GlobeAmericasIcon;
            return (
              <div
                key={title}
                className="relative flex h-full flex-col gap-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-brand-secondary/40 hover:shadow-xl dark:border-slate-800/60 dark:bg-slate-900/70"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-secondary to-brand-primary text-white shadow">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                    {stepLabel} {index + 1}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{title}</h3>
                <p className="flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{description}</p>
                <span className="inline-flex w-fit rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white dark:bg-white dark:text-slate-900">
                  {stat}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
