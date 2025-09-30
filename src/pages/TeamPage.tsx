import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '@/components/landing/Header';
import FooterSection from '@/components/landing/sections/FooterSection';

type TeamMember = {
  name: string;
  role: string;
  bio: string;
  funFact: string;
  location: string;
  image: string;
  photoAlt: string;
};

type CultureStat = {
  value: string;
  label: string;
  detail: string;
};

type CultureQuote = {
  text: string;
  author: string;
};

const TeamPage = () => {
  const { t } = useTranslation();
  const members = t('teamPage.members', { returnObjects: true }) as TeamMember[];
  const rituals = t('teamPage.culture.rituals', { returnObjects: true }) as string[];
  const stats = t('teamPage.culture.stats', { returnObjects: true }) as CultureStat[];
  const quote = t('teamPage.culture.quote', { returnObjects: true }) as CultureQuote;
  const funFactLabel = t('teamPage.labels.funFact');
  const locationLabel = t('teamPage.labels.location');

  return (
    <div className="relative flex min-h-screen flex-col gap-16 pb-20">
      <div className="sticky top-4 z-30 pt-6">
        <Header showNavigation={false} />
      </div>

      <section className="pt-8">
        <div className="container-responsive">
          <span className="inline-flex rounded-full bg-slate-900/90 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow dark:bg-white/90 dark:text-slate-900">
            {t('teamPage.hero.badge')}
          </span>
          <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,1.15fr),minmax(0,0.85fr)]">
            <div className="space-y-6">
              <h1 className="section-heading text-5xl text-slate-900 dark:text-white sm:text-6xl">
                {t('teamPage.hero.headline')}
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300">{t('teamPage.hero.intro')}</p>
              <p className="text-base text-slate-500 dark:text-slate-300">{t('teamPage.hero.description')}</p>
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link
                  to="/jobs"
                  className="inline-flex items-center gap-2 rounded-full bg-white/90 px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-1 hover:bg-brand-primary/20 hover:text-brand-secondary dark:bg-slate-900/70 dark:text-slate-100"
                >
                  {t('teamPage.hero.cta')}
                </Link>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 transition hover:border-brand-secondary hover:text-brand-secondary dark:border-slate-700 dark:text-slate-200"
                >
                  {t('teamPage.hero.back')}
                </Link>
              </div>
            </div>
            <div className="rounded-3xl border border-white/20 bg-white/70 p-8 shadow-xl backdrop-blur dark:border-slate-800/60 dark:bg-slate-900/60">
              <p className="text-sm uppercase tracking-[0.35em] text-brand-secondary">{t('teamPage.culture.snapshot.title')}</p>
              <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                {(t('teamPage.culture.snapshot.items', { returnObjects: true }) as string[]).map((item) => (
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

      <section className="py-10">
        <div className="container-responsive">
          <div className="grid gap-6 md:grid-cols-2">
            {members.map((member) => (
              <div
                key={member.name}
                className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-elevated dark:border-slate-800/60 dark:bg-slate-900/70"
              >
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-brand-secondary/10 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
                <div className="relative flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={member.image}
                      alt={member.photoAlt}
                      loading="lazy"
                      className="h-16 w-16 flex-shrink-0 rounded-2xl border border-white/60 object-cover shadow-md dark:border-slate-700"
                    />
                    <div>
                      <p className="text-sm uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">{locationLabel}</p>
                      <p className="text-lg font-semibold text-slate-900 dark:text-white">{member.location}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">{member.name}</h3>
                    <p className="text-sm uppercase tracking-[0.32em] text-brand-secondary/80 dark:text-brand-primary/80">
                      {member.role}
                    </p>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{member.bio}</p>
                  <div className="rounded-2xl bg-slate-900/90 px-4 py-3 text-sm text-white shadow-lg dark:bg-slate-800">
                    <span className="block text-xs font-semibold uppercase tracking-[0.3em] text-brand-primary">
                      {funFactLabel}
                    </span>
                    <span className="mt-2 block text-sm text-white/90">{member.funFact}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-16 pt-4">
        <div className="container-responsive">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.05fr),minmax(0,0.95fr)]">
            <div className="space-y-6">
              <h2 className="section-heading text-4xl text-slate-900 dark:text-white">
                {t('teamPage.culture.headline')}
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300">{t('teamPage.culture.subheadline')}</p>
              <ul className="grid gap-4 sm:grid-cols-2">
                {rituals.map((ritual) => (
                  <li
                    key={ritual}
                    className="rounded-3xl border border-slate-100 bg-white/80 px-5 py-4 text-sm text-slate-600 shadow-sm transition hover:-translate-y-1 hover:border-brand-secondary/40 hover:shadow-xl dark:border-slate-800/60 dark:bg-slate-900/70 dark:text-slate-300"
                  >
                    {ritual}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid gap-6">
              <div className="rounded-3xl border border-white/20 bg-white/80 p-6 shadow-lg backdrop-blur dark:border-slate-800/60 dark:bg-slate-900/70">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  “{quote.text}”
                </p>
                <p className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">{quote.author}</p>
              </div>
              <div className="grid gap-5 sm:grid-cols-3">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-3xl border border-slate-100 bg-white p-5 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800/60 dark:bg-slate-900/70"
                  >
                    <p className="text-3xl font-semibold text-slate-900 dark:text-white">{stat.value}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.3em] text-slate-400">{stat.label}</p>
                    <p className="mt-3 text-sm text-slate-500 dark:text-slate-300">{stat.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default TeamPage;
