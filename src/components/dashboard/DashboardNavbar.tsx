import { Fragment, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Dialog, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import LanguageSwitcher from '@components/common/LanguageSwitcher';
import ThemeToggle from '@components/common/ThemeToggle';

const NAV_ITEMS = [
  { to: '/dashboard', key: 'home', end: true },
  { to: '/dashboard/packlists', key: 'packlists', end: false },
  { to: '/dashboard/profile', key: 'profile', end: false },
] as const;

const DashboardNavbar = () => {
  const { t } = useTranslation('dashboard');
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <header className="pointer-events-auto">
      <div className="container-responsive pt-6">
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/80 px-6 py-4 shadow-sm backdrop-blur-md transition dark:border-slate-800/80 dark:bg-slate-900/70">
          <Link
            to="/dashboard"
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
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex dark:text-slate-200">
            {NAV_ITEMS.map(({ to, key, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `relative transition hover:text-brand-secondary focus:outline-none focus-visible:text-brand-secondary ${isActive ? 'text-brand-secondary dark:text-brand-primary' : ''}`
                }
              >
                {t(`nav.${key}`)}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg md:hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            aria-label={t('nav.openMenu')}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>
      </div>

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
                  aria-label={t('nav.closeMenu')}
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>

                <nav className="flex flex-col gap-4 text-lg font-medium text-slate-700 dark:text-slate-200">
                  {NAV_ITEMS.map(({ to, key, end }) => (
                    <NavLink
                      key={to}
                      to={to}
                      end={end}
                      onClick={closeMenu}
                      className={({ isActive }) =>
                        `transition hover:text-brand-secondary ${isActive ? 'text-brand-secondary dark:text-brand-primary' : ''}`
                      }
                    >
                      {t(`nav.${key}`)}
                    </NavLink>
                  ))}
                </nav>

                <div className="mt-auto flex flex-col gap-4">
                  <LanguageSwitcher />
                  <ThemeToggle />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </header>
  );
};

export default DashboardNavbar;
