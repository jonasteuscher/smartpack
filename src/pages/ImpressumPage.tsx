import { useTranslation } from 'react-i18next';
import Header from '@/components/landing/Header';
import FooterSection from '@/components/landing/sections/FooterSection';

interface ImpressumHero {
  badge: string;
  title: string;
  intro: string;
}

interface ImpressumCompany {
  name: string;
  addressLines: string[];
  registration: string;
  vat: string;
}

interface ImpressumRepresentative {
  role: string;
  name: string;
}

interface ImpressumContact {
  emailLabel: string;
  email: string;
  phoneLabel: string;
  phone: string;
}

interface ImpressumNotice {
  title: string;
  paragraphs: string[];
}

const ImpressumPage = () => {
  const { t } = useTranslation();
  const hero = t('impressumPage.hero', { returnObjects: true }) as ImpressumHero;
  const company = t('impressumPage.company', { returnObjects: true }) as ImpressumCompany;
  const representatives = t('impressumPage.representatives', { returnObjects: true }) as ImpressumRepresentative[];
  const contact = t('impressumPage.contact', { returnObjects: true }) as ImpressumContact;
  const regulator = t('impressumPage.regulator', { returnObjects: true }) as ImpressumNotice;
  const disclaimer = t('impressumPage.disclaimer', { returnObjects: true }) as ImpressumNotice;

  return (
    <div className="relative flex min-h-screen flex-col gap-16 pb-20">
      <div className="sticky top-4 z-30 pt-6">
        <Header showUtilities />
      </div>

      <section className="pt-8">
        <div className="container-responsive">
          <span className="inline-flex rounded-full bg-brand-primary/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-brand-secondary">
            {hero.badge}
          </span>
          <div className="mt-8 max-w-3xl space-y-6">
            <h1 className="section-heading text-5xl text-slate-900 dark:text-white sm:text-6xl">{hero.title}</h1>
            <p className="text-lg text-slate-600 dark:text-slate-300">{hero.intro}</p>
          </div>
        </div>
      </section>

      <section>
        <div className="container-responsive">
          <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{company.name}</h2>
            <div className="mt-6 grid gap-8 md:grid-cols-2">
              <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                {company.addressLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
              <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
                <div>
                  <p className="font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                    {t('impressumPage.labels.registration')}
                  </p>
                  <p className="mt-1">{company.registration}</p>
                </div>
                <div>
                  <p className="font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                    {t('impressumPage.labels.vat')}
                  </p>
                  <p className="mt-1">{company.vat}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">
                  {t('impressumPage.labels.representatives')}
                </p>
                <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  {representatives.map((rep) => (
                    <li key={rep.name}>
                      <span className="font-medium">{rep.name}</span> · {rep.role}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">
                  {t('impressumPage.labels.contact')}
                </p>
                <div className="mt-3 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  <div>
                    <p className="font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                      {contact.emailLabel}
                    </p>
                    <a
                      href={`mailto:${contact.email}`}
                      className="mt-1 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow transition hover:-translate-y-0.5 hover:bg-brand-secondary dark:bg-brand-secondary"
                    >
                      {contact.email}
                    </a>
                  </div>
                  <div>
                    <p className="font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                      {contact.phoneLabel}
                    </p>
                    <a
                      href={`tel:${contact.phone.replace(/\s+/g, '')}`}
                      className="mt-1 inline-block text-sm text-slate-600 transition hover:text-brand-secondary dark:text-slate-300 dark:hover:text-brand-primary"
                    >
                      {contact.phone}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="container-responsive">
          <div className="grid gap-8 md:grid-cols-2">
            {[regulator, disclaimer].map((block) => (
              <article
                key={block.title}
                className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70"
              >
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{block.title}</h3>
                <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  {block.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default ImpressumPage;
