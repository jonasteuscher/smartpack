import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { AppLanguage } from '@/i18n';

const SUPPORTED_LANGUAGES: AppLanguage[] = ['de', 'en', 'fr', 'it'];

const normalizeLanguage = (language: string | undefined): AppLanguage => {
  const candidate = (language ?? 'en').split('-')[0] as AppLanguage;
  return SUPPORTED_LANGUAGES.includes(candidate) ? candidate : 'en';
};

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();

  const activeLanguage = useMemo(
    () => normalizeLanguage(i18n.resolvedLanguage ?? i18n.language),
    [i18n.resolvedLanguage, i18n.language]
  );

  return (
    <div
      className="inline-flex items-center gap-1 rounded-full bg-white/80 p-1 shadow-sm backdrop-blur dark:bg-slate-900/70"
      aria-label={t('languageSwitcher.label')}
    >
      {SUPPORTED_LANGUAGES.map((code) => {
        const isActive = code === activeLanguage;
        const languageName = t(`languageSwitcher.languages.${code}`);

        return (
          <button
            key={code}
            type="button"
            onClick={() => i18n.changeLanguage(code)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              isActive
                ? 'bg-slate-900 text-white shadow dark:bg-white dark:text-slate-900'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
            }`}
            aria-pressed={isActive}
            aria-label={languageName}
            title={languageName}
          >
            {code.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
};

export default LanguageSwitcher;
