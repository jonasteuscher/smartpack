import { useState, Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import LanguageSwitcher from '@components/common/LanguageSwitcher';
import ThemeToggle from '@components/common/ThemeToggle';

const NAV_ITEMS = [
  { key: 'overview', href: '#hero' },
  { key: 'features', href: '#features' },
  { key: 'workflow', href: '#workflow' },
  { key: 'feedback', href: '#testimonials' },
  { key: 'faq', href: '#faq' }
] as const;

interface HeaderProps {
  showNavigation?: boolean;
  showUtilities?: boolean;
}

const Header = ({ showNavigation = true, showUtilities = false }: HeaderProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const closeMenu = () => setIsOpen(false);

  const handleNavClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
    shouldClose = false
  ) => {
    if (shouldClose) {
      closeMenu();
    }

    if (location.pathname === '/') {
      // allow default anchor behaviour for smooth scrolling
      return;
    }

    event.preventDefault();
    navigate({ pathname: '/', hash: href });
  };

  return (
    <header className="pointer-events-auto">
      <div className="container-responsive">
        <div className="relative flex items-center gap-4 justify-between rounded-2xl border border-white/10 bg-white/80 px-6 py-4 shadow-sm backdrop-blur-md transition dark:border-slate-800/80 dark:bg-slate-900/60 md:justify-start">
          <Link
            to="/"
            className="flex items-center gap-3 font-semibold text-slate-900 dark:text-white"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <img
              src="/img/logo/Logo_500x350_Emblem.PNG"
              alt="SmartPack Logo"
              className="h-11 w-auto select-none"
              loading="lazy"
            />
            <span className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-600 md:hidden dark:text-slate-300">
              {t('header.brand.title')}
            </span>
            <span className="sr-only">{t('header.brand.tagline')}</span>
          </Link>

          {showNavigation ? (
            <nav className="hidden items-center gap-10 text-sm font-medium text-slate-600 md:absolute md:left-1/2 md:top-1/2 md:flex md:-translate-x-1/2 md:-translate-y-1/2 dark:text-slate-200">
              {NAV_ITEMS.map(({ key, href }) => (
                <a
                  key={key}
                  href={href}
                  onClick={(event) => handleNavClick(event, href)}
                  className="relative transition hover:text-brand-secondary focus:outline-none focus-visible:text-brand-secondary"
                >
                  {t(`header.nav.${key}`)}
                </a>
              ))}
            </nav>
          ) : (
            <span className="hidden text-sm font-medium text-slate-400 md:absolute md:left-1/2 md:top-1/2 md:flex md:-translate-x-1/2 md:-translate-y-1/2 dark:text-slate-500">
              {t('header.brand.tagline')}
            </span>
          )}

          <div className="ml-auto flex items-center gap-3">
            {showUtilities && (
              <div className="hidden items-center gap-3 md:flex">
                <LanguageSwitcher />
                <ThemeToggle />
              </div>
            )}
            <Link
              to="/app/dashboard"
              className="hidden rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-secondary/30 transition hover:-translate-y-0.5 hover:bg-brand-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-secondary md:inline-flex dark:bg-white dark:text-slate-900"
            >
              {t('header.cta')}
            </Link>

            {showNavigation && (
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg md:hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                aria-label={t('header.menu.open')}
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
            )}
          </div>
        </div>
      </div>

      {showNavigation && (
        <Transition show={isOpen} as={Fragment}>
          <Dialog as="div" className="relative z-40 md:hidden" onClose={closeMenu}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur" />
            </Transition.Child>

            <div className="fixed inset-0 z-50 flex justify-end">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-out duration-200"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in duration-150"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="flex h-full w-80 flex-col gap-6 bg-white px-6 py-10 shadow-2xl dark:bg-slate-900">
                  <button
                    type="button"
                    onClick={closeMenu}
                    className="self-end rounded-full border border-slate-200 p-2 text-slate-500 transition hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:text-white"
                    aria-label={t('header.menu.close')}
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                  <nav className="flex flex-col gap-4 text-lg font-medium text-slate-700 dark:text-slate-200">
                    {NAV_ITEMS.map(({ key, href }) => (
                      <a
                        key={key}
                        href={href}
                        onClick={(event) => handleNavClick(event, href, true)}
                        className="transition hover:text-brand-secondary"
                      >
                        {t(`header.nav.${key}`)}
                      </a>
                    ))}
                  </nav>

                  <div className="mt-auto flex flex-col gap-4">
                    {showUtilities && (
                      <div className="flex flex-wrap items-center gap-3">
                        <LanguageSwitcher />
                        <ThemeToggle />
                      </div>
                    )}
                    <Link
                      to="/app/dashboard"
                      onClick={closeMenu}
                      className="rounded-full bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white shadow-lg transition hover:bg-brand-secondary dark:bg-white dark:text-slate-900"
                    >
                      {t('header.cta')}
                    </Link>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition>
      )}
    </header>
  );
};

export default Header;
