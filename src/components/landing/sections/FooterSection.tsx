import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface FooterLink {
  label: string;
  href: string;
};

interface FooterColumn {
  title: string;
  links: FooterLink[];
};

const FooterSection = () => {
  const { t } = useTranslation();
  const columns = t('footer.columns', { returnObjects: true }) as FooterColumn[];
  const year = new Date().getFullYear();

  const handleInternalLinkClick = (href: string) => {
    if (href === '/team' || href === '/jobs' || href === '/contact') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="border-t border-slate-200/60 bg-white py-12 dark:border-slate-800 dark:bg-slate-950">
      <div className="container-responsive">
        <div className="grid gap-10 rounded-3xl bg-slate-100/50 p-10 dark:bg-slate-900/30 lg:grid-cols-[minmax(0,1.2fr),minmax(0,1fr)]">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/img/logo/Logo_500x350_Emblem.PNG"
                alt="SmartPack Logo"
                className="h-11 w-auto select-none"
                loading="lazy"
              />
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">{t('header.brand.title')}</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">{t('footer.headline')}</p>
              </div>
            </div>
            <p className="max-w-lg text-sm text-slate-500 dark:text-slate-300">{t('footer.description')}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">{t('footer.copyright', { year })}</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.title} className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">{column.title}</p>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  {column.links.map((link) => {
                    const isInternalRoute = link.href.startsWith('/');
                    return (
                      <li key={link.label}>
                        {isInternalRoute ? (
                          <Link
                            to={link.href}
                            className="transition hover:text-brand-secondary dark:hover:text-brand-primary"
                            onClick={() => handleInternalLinkClick(link.href)}
                          >
                            {link.label}
                          </Link>
                        ) : (
                          <a
                            href={link.href}
                            className="transition hover:text-brand-secondary dark:hover:text-brand-primary"
                          >
                            {link.label}
                          </a>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
