import { FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

type CTAStatus = 'idle' | 'success';

type CTAChecklist = {
  title: string;
  status: string;
  items: string[];
  offline: string;
  active: string;
  vip: string;
};

const CallToActionSection = () => {
  const { t } = useTranslation();
  const checklist = t('cta.checklist', { returnObjects: true }) as CTAChecklist;
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<CTAStatus>('idle');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email) return;
    setStatus('success');
    setEmail('');
  };

  return (
    <section id="demo" className="relative pb-24 pt-12">
      <div className="container-responsive">
        <div className="gradient-border overflow-hidden rounded-[32px] bg-white/60 p-[1px] shadow-2xl backdrop-blur dark:bg-slate-900/60">
          <div className="grid items-center gap-12 rounded-[30px] bg-gradient-to-br from-brand-secondary/90 via-slate-900 to-slate-950 px-10 py-12 text-white lg:grid-cols-[minmax(0,1fr),minmax(0,0.9fr)]">
            <div className="space-y-6">
              <span className="inline-flex rounded-full border border-white/30 px-4 py-1 text-xs uppercase tracking-[0.3em] text-white/80">
                {t('cta.badge')}
              </span>
              <h2 className="section-heading text-4xl">{t('cta.headline')}</h2>
              <p className="max-w-xl text-base text-white/80">{t('cta.description')}</p>
              <form className="mt-8 flex flex-col gap-4 sm:flex-row" onSubmit={handleSubmit}>
                <label htmlFor="cta-email" className="sr-only">
                  {t('cta.inputPlaceholder')}
                </label>
                <input
                  id="cta-email"
                  type="email"
                  placeholder={t('cta.inputPlaceholder')}
                  className="h-12 flex-1 rounded-full border border-white/30 bg-white/10 px-5 text-sm text-white placeholder-white/50 shadow-inner focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/60"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (status === 'success') {
                      setStatus('idle');
                    }
                  }}
                  required
                />
                <button
                  type="submit"
                  className="h-12 rounded-full bg-white px-8 text-sm font-semibold text-slate-900 shadow-lg shadow-brand-primary/30 transition hover:-translate-y-1 hover:bg-brand-primary"
                >
                  {t('cta.submit')}
                </button>
              </form>
              {status === 'success' ? (
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-primary">
                  {t('cta.success')}
                </p>
              ) : (
                <p className="text-xs uppercase tracking-[0.35em] text-white/50">{t('cta.footnote')}</p>
              )}
            </div>
            <div className="relative flex h-full w-full items-center justify-center">
              <div className="hidden h-full w-full max-w-sm rounded-3xl border border-white/20 bg-white/10 p-6 shadow-inner backdrop-blur-md lg:flex">
                <div className="flex flex-col gap-4 text-sm text-white/70">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em]">{checklist.title}</p>
                    <p className="mt-2 text-lg font-semibold text-white">{checklist.status}</p>
                  </div>
                  <ul className="space-y-3">
                    {checklist.items.map((item) => (
                      <li key={item} className="flex items-center gap-3 rounded-2xl bg-black/40 px-4 py-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-primary/70 text-slate-900">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto flex items-center justify-between rounded-2xl bg-black/40 px-4 py-3">
                    <span className="text-xs uppercase tracking-[0.3em] text-white/60">{checklist.offline}</span>
                    <span className="text-sm font-semibold text-brand-primary">{checklist.active}</span>
                  </div>
                </div>
              </div>
              <div className="absolute -top-12 right-4 hidden rounded-2xl bg-white/90 px-4 py-3 text-xs font-semibold text-slate-700 shadow-lg lg:block">
                {checklist.vip}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToActionSection;
