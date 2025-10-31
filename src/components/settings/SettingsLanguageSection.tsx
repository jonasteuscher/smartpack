import { useCallback, useEffect, useMemo, useState } from 'react';
import { Combobox } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { useTranslation } from 'react-i18next';
import type { UserSettings } from '@/types/userSettings';
import type { AppLanguage } from '@/i18n';
import i18n from '@/i18n';

interface LanguageOption {
  value: string;
  code: AppLanguage;
  labelKey: string;
  fallback: string;
  icon: string;
}

const LANGUAGE_OPTIONS: readonly LanguageOption[] = [
  {
    value: 'de-CH',
    code: 'de',
    labelKey: 'settings.sections.language.options.deCH',
    fallback: 'German (Switzerland)',
    icon: '🇩🇪',
  },
  {
    value: 'en',
    code: 'en',
    labelKey: 'settings.sections.language.options.en',
    fallback: 'English',
    icon: '🇬🇧',
  },
  {
    value: 'fr-CH',
    code: 'fr',
    labelKey: 'settings.sections.language.options.frCH',
    fallback: 'French',
    icon: '🇫🇷',
  },
  {
    value: 'it-CH',
    code: 'it',
    labelKey: 'settings.sections.language.options.itCH',
    fallback: 'Italian',
    icon: '🇮🇹',
  },
];

interface SettingsLanguageSectionProps {
  settingsLanguage: string | null | undefined;
  loading: boolean;
  isUpdating: boolean;
  updateSettings: (values: Partial<UserSettings>) => Promise<boolean>;
}

const SettingsLanguageSection = ({
  settingsLanguage,
  loading,
  isUpdating,
  updateSettings,
}: SettingsLanguageSectionProps) => {
  const { t } = useTranslation('dashboard');

  const initialLanguageValue = useMemo(() => {
    const stored =
      settingsLanguage ??
      (typeof window !== 'undefined' ? window.localStorage.getItem('smartpack-language') : null) ??
      i18n.language;

    if (typeof stored === 'string') {
      const normalized = LANGUAGE_OPTIONS.find(
        ({ value, code }) =>
          value === stored || code === (stored.split('-')[0] as AppLanguage)
      );
      if (normalized) {
        return normalized.value;
      }
    }

    return LANGUAGE_OPTIONS[0]?.value ?? 'en';
  }, [settingsLanguage]);

  const [languageValue, setLanguageValue] = useState<string>(initialLanguageValue);
  const [comboboxKey, setComboboxKey] = useState(0);

  useEffect(() => {
    setLanguageValue(initialLanguageValue);
  }, [initialLanguageValue]);

  const resolveLanguageDisplay = useCallback(
    (value: string | null | undefined) => {
      if (!value) {
        return null;
      }
      const option = LANGUAGE_OPTIONS.find(({ value: optionValue }) => optionValue === value);
      if (!option) {
        return {
          icon: '',
          label: value,
        };
      }
      return {
        icon: option.icon,
        label: t(option.labelKey, { defaultValue: option.fallback }),
      };
    },
    [t]
  );

  const languageDisplay = resolveLanguageDisplay(languageValue);
  const languagePlaceholder = useMemo(
    () =>
      t('settings.sections.language.languagePlaceholder', {
        defaultValue: 'Select language',
      }),
    [t]
  );

  const handleLanguageChange = useCallback(
    (nextLanguage: string | null) => {
      setComboboxKey((previous) => previous + 1);
      if (!nextLanguage || nextLanguage === languageValue) {
        return;
      }

      const normalized = nextLanguage.split('-')[0] as AppLanguage;
      const previousLanguageValue = languageValue;
      const previousNormalized = previousLanguageValue.split('-')[0] as AppLanguage;

      setLanguageValue(nextLanguage);

      if (typeof window !== 'undefined') {
        window.localStorage.setItem('smartpack-language', nextLanguage);
      }

      void (async () => {
        if (i18n.language !== normalized) {
          await i18n.changeLanguage(normalized);
        }

        const success = await updateSettings({ language: nextLanguage });

        if (!success) {
          setLanguageValue(previousLanguageValue);
          if (typeof window !== 'undefined') {
            window.localStorage.setItem('smartpack-language', previousLanguageValue);
          }
          if (i18n.language !== previousNormalized) {
            await i18n.changeLanguage(previousNormalized);
          }
        }
      })();
    },
    [languageValue, updateSettings]
  );

  return (
    <section className="relative z-30 flex min-w-0 flex-col gap-3 overflow-visible rounded-2xl border border-white/10 bg-white/60 p-6 shadow-sm backdrop-blur focus-within:z-[60] dark:border-slate-800/60 dark:bg-slate-900/60">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">
          {t('settings.sections.language.title', { defaultValue: 'Language' })}
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">
          {t('settings.sections.language.description', {
            defaultValue: 'Choose the language you want to use across the app.',
          })}
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-[var(--text-secondary)]" htmlFor="language-setting">
          {t('settings.sections.language.languageLabel', { defaultValue: 'Interface language' })}
        </label>
        <Combobox
          key={comboboxKey}
          value={languageValue}
          onChange={handleLanguageChange}
          disabled={loading || isUpdating}
        >
          <div className="relative w-full max-w-full sm:w-64">
            <Combobox.Button
              id="language-setting"
              className="flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-[var(--text-primary)] shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary/30 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <span
                className={`flex flex-1 items-center gap-2 ${
                  languageDisplay ? '' : 'text-[var(--text-secondary)] dark:text-slate-400'
                }`}
              >
                {languageDisplay ? (
                  <>
                    {languageDisplay.icon ? (
                      <span className="text-lg leading-none">{languageDisplay.icon}</span>
                    ) : null}
                    <span className="flex-1 text-left">{languageDisplay.label}</span>
                  </>
                ) : (
                  <span className="flex-1 text-left">{languagePlaceholder}</span>
                )}
              </span>
              <ChevronUpDownIcon className="h-5 w-5 text-slate-500" aria-hidden="true" />
            </Combobox.Button>
            <Combobox.Options className="absolute z-[80] mt-2 max-h-56 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-lg focus:outline-none dark:border-slate-700 dark:bg-slate-900">
              {LANGUAGE_OPTIONS.map(({ value, labelKey, fallback, icon }) => (
                <Combobox.Option
                  key={value}
                  value={value}
                  className={({ active }) =>
                    `flex cursor-pointer items-center gap-2 px-3 py-2 ${
                      active
                        ? 'bg-brand-secondary/10 text-brand-secondary dark:bg-brand-secondary/20 dark:text-brand-secondary'
                        : 'text-[var(--text-primary)]'
                    }`
                  }
                >
                  <span className="text-lg leading-none">{icon}</span>
                  <span className="flex-1 text-left">{t(labelKey, { defaultValue: fallback })}</span>
                </Combobox.Option>
              ))}
            </Combobox.Options>
          </div>
        </Combobox>
      </div>
    </section>
  );
};

export default SettingsLanguageSection;
