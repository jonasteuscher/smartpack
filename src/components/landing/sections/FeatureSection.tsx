import {
  SparklesIcon,
  CloudArrowDownIcon,
  CubeTransparentIcon,
  ShieldCheckIcon,
  MapIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

const FEATURE_ICONS = [
  SparklesIcon,
  CubeTransparentIcon,
  CloudArrowDownIcon,
  ShieldCheckIcon,
  MapIcon,
  UserGroupIcon
] as const;

interface FeatureItem {
  title: string;
  description: string;
};

const FeatureSection = () => {
  const { t } = useTranslation();
  const featureItems = t('features.items', { returnObjects: true }) as FeatureItem[];

  return (
    <section id="features" className="relative bg-[var(--surface-secondary)] py-24">
      <div className="container-responsive">
        <div className="mx-auto max-w-2xl text-center">
          <p className="signature-font text-3xl text-brand-secondary/80">{t('features.tagline')}</p>
          <h2 className="section-heading mt-3 text-4xl text-slate-900 dark:text-white">{t('features.headline')}</h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">{t('features.description')}</p>
        </div>
        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {featureItems.map(({ title, description }, index) => {
            const Icon = FEATURE_ICONS[index] ?? SparklesIcon;
            return (
              <div
                key={title}
                className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800/60 dark:bg-slate-900/70"
              >
                <div className="absolute inset-0 -z-10 opacity-0 transition duration-500 group-hover:opacity-100">
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/10 via-transparent to-brand-secondary/20" />
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-secondary to-brand-primary text-white shadow-lg">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-slate-900 dark:text-white">{title}</h3>
                <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">{description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
