import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  const isDark = theme === 'dark';
  const label = isDark ? t('themeToggle.activateLight') : t('themeToggle.activateDark');

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/70 text-slate-600 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700/80 dark:bg-slate-900/70 dark:text-slate-200"
    >
      <SunIcon
        className={`absolute h-5 w-5 transition-opacity ${isDark ? 'opacity-0' : 'opacity-100'}`}
      />
      <MoonIcon
        className={`absolute h-5 w-5 transition-opacity ${isDark ? 'opacity-100' : 'opacity-0'}`}
      />
    </button>
  );
};

export default ThemeToggle;
