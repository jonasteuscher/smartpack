import { useTranslation } from 'react-i18next';
import Header from '@/components/landing/Header';
import FooterSection from '@/components/landing/sections/FooterSection';

interface PrivacySummary {
  title: string;
  items: string[];
}

interface PrivacySectionItem {
  label: string;
  text: string;
}

interface PrivacySection {
  title: string;
  description: string;
  items?: PrivacySectionItem[];
  paragraphs?: string[];
  footnote?: string;
}

interface PrivacyRights {
  title: string;
  intro: string;
  items: string[];
  howTo: string;
}

interface PrivacyContact {
  title: string;
  description: string;
  emailLabel: string;
  email: string;
  addressLabel: string;
  address: string;
}

const PrivacyPage = () => {
  const { t } = useTranslation();
  const hero = t('privacyPage.hero', { returnObjects: true }) as {
    badge: string;
    title: string;
    intro: string;
    location: string;
    updated: string;
  };
  const summary = t('privacyPage.summary', { returnObjects: true }) as PrivacySummary;
  const sections = t('privacyPage.sections', { returnObjects: true }) as PrivacySection[];
  const rights = t('privacyPage.rights', { returnObjects: true }) as PrivacyRights;
  const contact = t('privacyPage.contact', { returnObjects: true }) as PrivacyContact;
  const aiNotice = t('privacyPage.aiNotice');

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
            <p className="text-sm text-slate-500 dark:text-slate-400">{hero.location}</p>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{hero.updated}</p>
          </div>
        </div>
      </section>

      <section>
        <div className="container-responsive">
          <div className="rounded-3xl border border-brand-primary/30 bg-brand-primary/10 p-6 shadow-sm dark:border-brand-primary/40 dark:bg-brand-primary/15">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{aiNotice}</p>
          </div>
        </div>
      </section>

      <section>
        <div className="container-responsive">
          <div className="rounded-3xl border border-slate-100 bg-white/80 p-8 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/60">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{summary.title}</h2>
            <ul className="mt-4 space-y-3">
              {summary.items.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                  <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-primary/20 text-xs font-semibold text-brand-secondary">
                    ●
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section>
        <div className="container-responsive">
          <div className="grid gap-8 lg:grid-cols-2">
            {sections.map((section) => (
              <div
                key={section.title}
                className="flex h-full flex-col rounded-3xl border border-slate-100 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800/60 dark:bg-slate-900/70"
              >
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{section.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{section.description}</p>
                </div>
                {section.items && (
                  <ul className="mt-6 space-y-4">
                    {section.items.map((item) => (
                      <li
                        key={item.label}
                        className="rounded-2xl border border-slate-100 bg-white/80 p-4 dark:border-slate-700/60 dark:bg-slate-900/60"
                      >
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.label}</p>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.text}</p>
                      </li>
                    ))}
                  </ul>
                )}
                {section.paragraphs && (
                  <div className="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                )}
                {section.footnote && (
                  <p className="mt-6 text-xs text-slate-500 dark:text-slate-400">{section.footnote}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="container-responsive">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr),minmax(0,1fr)]">
            <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">{rights.title}</p>
              <p className="mt-4 text-base text-slate-600 dark:text-slate-300">{rights.intro}</p>
              <ul className="mt-6 space-y-4">
                {rights.items.map((item) => (
                  <li
                    key={item}
                    className="rounded-2xl border border-slate-100 bg-white/80 p-4 text-sm text-slate-600 dark:border-slate-700/60 dark:bg-slate-900/60 dark:text-slate-300"
                  >
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm font-medium text-slate-600 dark:text-slate-300">{rights.howTo}</p>
            </div>

            <div className="flex flex-col justify-between gap-6 rounded-3xl border border-slate-100 bg-white p-8 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{contact.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">{contact.description}</p>
              </div>
              <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
                <div>
                  <p className="font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                    {contact.emailLabel}
                  </p>
                  <a
                    href={`mailto:${contact.email}`}
                    className="mt-2 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow transition hover:-translate-y-0.5 hover:bg-brand-secondary dark:bg-brand-secondary"
                  >
                    {contact.email}
                  </a>
                </div>
                <div>
                  <p className="font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                    {contact.addressLabel}
                  </p>
                  <p className="mt-2">{contact.address}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default PrivacyPage;
