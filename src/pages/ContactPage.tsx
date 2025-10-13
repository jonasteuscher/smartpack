import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '@/components/landing/Header';
import FooterSection from '@/components/landing/sections/FooterSection';

interface ContactChannel {
  label: string;
  description: string;
  action: {
    label: string;
    href: string;
    external?: boolean;
  };
};

interface ContactFaq {
  question: string;
  answer: string;
};

const ContactPage = () => {
  const { t } = useTranslation();
  const channels = t('contactPage.channels', { returnObjects: true }) as ContactChannel[];
  const faqs = t('contactPage.faq.items', { returnObjects: true }) as ContactFaq[];

  return (
    <div className="relative flex min-h-screen flex-col gap-16 pb-20">
      <div className="sticky top-4 z-30 pt-6">
        <Header />
      </div>

      <section className="pt-8">
        <div className="container-responsive">
          <span className="inline-flex rounded-full bg-brand-primary/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-brand-secondary">
            {t('contactPage.hero.badge')}
          </span>
          <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,1.1fr),minmax(0,0.9fr)]">
            <div className="space-y-6">
              <h1 className="section-heading text-5xl text-slate-900 dark:text-white sm:text-6xl">
                {t('contactPage.hero.headline')}
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300">{t('contactPage.hero.intro')}</p>
              <p className="text-base text-slate-500 dark:text-slate-300">{t('contactPage.hero.description')}</p>
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link
                  to="/team"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 transition hover:border-brand-secondary hover:text-brand-secondary dark:border-slate-700 dark:text-slate-200"
                >
                  {t('contactPage.hero.cta.team')}
                </Link>
                <Link
                  to="/jobs"
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow transition hover:-translate-y-1 hover:bg-brand-secondary dark:bg-white dark:text-slate-900"
                >
                  {t('contactPage.hero.cta.jobs')}
                </Link>
              </div>
            </div>
            <div className="rounded-3xl border border-white/20 bg-white/75 p-8 shadow-xl backdrop-blur dark:border-slate-800/60 dark:bg-slate-900/60">
              <p className="text-sm uppercase tracking-[0.35em] text-slate-500 dark:text-slate-300">
                {t('contactPage.slots.title')}
              </p>
              <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                {(t('contactPage.slots.items', { returnObjects: true }) as string[]).map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-primary/20 text-brand-secondary">
                      ●
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="pt-6">
        <div className="container-responsive">
          <div className="grid gap-6 md:grid-cols-3">
            {channels.map((channel) => (
              <div
                key={channel.label}
                className="flex h-full flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800/60 dark:bg-slate-900/70"
              >
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-400">{t('contactPage.labels.channel')}</p>
                  <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">{channel.label}</h2>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">{channel.description}</p>
                <div className="mt-auto">
                  {channel.action.external ? (
                    <a
                      href={channel.action.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow transition hover:-translate-y-0.5 hover:bg-brand-secondary dark:bg-brand-secondary"
                    >
                      {channel.action.label}
                    </a>
                  ) : (
                    <a
                      href={channel.action.href}
                      className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow transition hover:-translate-y-0.5 hover:bg-brand-secondary dark:bg-brand-secondary"
                    >
                      {channel.action.label}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-16 pt-10">
        <div className="container-responsive">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr),minmax(0,1fr)]">
            <div>
              <h2 className="section-heading text-4xl text-slate-900 dark:text-white">
                {t('contactPage.faq.title')}
              </h2>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">{t('contactPage.faq.description')}</p>
            </div>
            <div className="space-y-4">
              {faqs.map((item) => (
                <div
                  key={item.question}
                  className="rounded-3xl border border-slate-100 bg-white/80 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800/60 dark:bg-slate-900/60"
                >
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.question}</p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default ContactPage;
