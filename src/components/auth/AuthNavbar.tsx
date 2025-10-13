import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@components/common/LanguageSwitcher';
import ThemeToggle from '@components/common/ThemeToggle';

const AuthNavbar = () => {
  const { t } = useTranslation('auth');

  return (
    <header className="pointer-events-auto">
      <div className="container-responsive pt-6">
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/80 px-6 py-4 shadow-sm backdrop-blur-md transition dark:border-slate-800/80 dark:bg-slate-900/70">
          <Link
            to="/"
            className="flex items-center gap-3 font-semibold text-slate-900 transition hover:text-brand-secondary dark:text-white"
          >
            <img
              src="/img/logo/Logo_500x350_Emblem.PNG"
              alt="SmartPack Logo"
              className="h-10 w-auto select-none"
              loading="lazy"
            />
            <span className="hidden text-sm font-semibold uppercase tracking-[0.3em] text-slate-600 sm:block dark:text-slate-300">
              SmartPack
            </span>
            <span className="sr-only">{t('navbar.homeLink')}</span>
          </Link>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};

export default AuthNavbar;
