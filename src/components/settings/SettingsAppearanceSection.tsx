import { useCallback, useEffect, useMemo, useState } from 'react';
import { Combobox } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { useTranslation } from 'react-i18next';
import type { ThemeSetting } from '@context/ThemeContext';
import type { UserSettings } from '@/types/userSettings';

const THEME_OPTIONS: readonly {
  value: ThemeSetting;
  labelKey: string;
  fallback: string;
  icon: string;
}[] = [
  {
    value: 'system',
    labelKey: 'settings.sections.appearance.options.system',
    fallback: 'System default',
    icon: '🖥️',
  },
  {
    value: 'light',
    labelKey: 'settings.sections.appearance.options.light',
    fallback: 'Light',
    icon: '🌞',
  },
  {
    value: 'dark',
    labelKey: 'settings.sections.appearance.options.dark',
    fallback: 'Dark',
    icon: '🌙',
  },
];

interface SettingsAppearanceSectionProps {
  resolvedTheme: ThemeSetting;
  loading: boolean;
  isUpdating: boolean;
  applyTheme: (next: ThemeSetting) => void;
  updateSettings: (values: Partial<UserSettings>) => Promise<boolean>;
}

const SettingsAppearanceSection = ({
  resolvedTheme,
  loading,
  isUpdating,
  applyTheme,
  updateSettings,
}: SettingsAppearanceSectionProps) => {
  const { t } = useTranslation('dashboard');
  const [themeValue, setThemeValue] = useState<ThemeSetting>(resolvedTheme);
  const [comboboxKey, setComboboxKey] = useState(0);

  useEffect(() => {
    setThemeValue(resolvedTheme);
  }, [resolvedTheme]);

  const resolveThemeDisplay = useCallback(
    (value: ThemeSetting | null | undefined) => {
      if (!value) {
        return null;
      }
      const option = THEME_OPTIONS.find(({ value: optionValue }) => optionValue === value);
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

  const themeDisplay = resolveThemeDisplay(themeValue);
  const themePlaceholder = useMemo(
    () =>
      t('settings.sections.appearance.themePlaceholder', {
        defaultValue: 'Select theme mode',
      }),
    [t]
  );

  const handleThemeChange = useCallback(
    (nextTheme: ThemeSetting | null) => {
      setComboboxKey((previous) => previous + 1);
      if (!nextTheme || nextTheme === themeValue) {
        return;
      }

      const previousTheme = themeValue;
      setThemeValue(nextTheme);
      applyTheme(nextTheme);

      void (async () => {
        const success = await updateSettings({ theme: nextTheme });
        if (!success) {
          setThemeValue(previousTheme);
          applyTheme(previousTheme);
        }
      })();
    },
    [applyTheme, themeValue, updateSettings]
  );

  return (
    <section className="relative z-40 flex min-w-0 flex-col gap-3 overflow-visible rounded-2xl border border-white/10 bg-white/60 p-6 shadow-sm backdrop-blur focus-within:z-[60] dark:border-slate-800/60 dark:bg-slate-900/60">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">
          {t('settings.sections.appearance.title', { defaultValue: 'Appearance' })}
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">
          {t('settings.sections.appearance.description', {
            defaultValue: 'Switch between light and dark themes to suit your preference.',
          })}
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-[var(--text-secondary)]" htmlFor="theme-setting">
          {t('settings.sections.appearance.themeLabel', { defaultValue: 'Theme mode' })}
        </label>
        <Combobox
          key={comboboxKey}
          value={themeValue}
          onChange={handleThemeChange}
          disabled={loading || isUpdating}
        >
          <div className="relative w-full max-w-full sm:w-64">
            <Combobox.Button
              id="theme-setting"
              className="flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-[var(--text-primary)] shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary/30 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <span
                className={`flex flex-1 items-center gap-2 ${
                  themeDisplay ? '' : 'text-[var(--text-secondary)] dark:text-slate-400'
                }`}
              >
                {themeDisplay ? (
                  <>
                    {themeDisplay.icon ? (
                      <span className="text-lg leading-none">{themeDisplay.icon}</span>
                    ) : null}
                    <span className="flex-1 text-left">{themeDisplay.label}</span>
                  </>
                ) : (
                  <span className="flex-1 text-left">{themePlaceholder}</span>
                )}
              </span>
              <ChevronUpDownIcon className="h-5 w-5 text-slate-500" aria-hidden="true" />
            </Combobox.Button>
            <Combobox.Options className="absolute z-50 mt-2 max-h-56 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-lg focus:outline-none dark:border-slate-700 dark:bg-slate-900">
              {THEME_OPTIONS.map(({ value, labelKey, fallback, icon }) => (
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

export default SettingsAppearanceSection;
