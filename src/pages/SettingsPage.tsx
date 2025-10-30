import { Fragment, useMemo, useCallback, useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserSettings } from '@hooks/useUserSettings';
import type { UserSettings } from '@/types/userSettings';
import { useTheme, type ThemeSetting } from '@context/ThemeContext';
import type { AppLanguage } from '@/i18n';
import i18n from '@/i18n';
import { formatDateTimeWithPreference } from '@/utils/formatDateTime';
import { Combobox, Dialog, Transition } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { deleteUserAccount } from '@/services/deleteUserAccount';

const THEME_OPTIONS: readonly {
  value: ThemeSetting;
  labelKey: string;
  fallback: string;
  icon: string;
}[] = [
  { value: 'system', labelKey: 'settings.sections.appearance.options.system', fallback: 'System default', icon: '🖥️' },
  { value: 'light', labelKey: 'settings.sections.appearance.options.light', fallback: 'Light', icon: '🌞' },
  { value: 'dark', labelKey: 'settings.sections.appearance.options.dark', fallback: 'Dark', icon: '🌙' }
];

interface LanguageOption {
  value: string;
  code: AppLanguage;
  labelKey: string;
  fallback: string;
}

const LANGUAGE_OPTIONS: readonly (LanguageOption & { icon: string })[] = [
  { value: 'de-CH', code: 'de', labelKey: 'settings.sections.language.options.deCH', fallback: 'German (Switzerland)', icon: '🇩🇪' },
  { value: 'en', code: 'en', labelKey: 'settings.sections.language.options.en', fallback: 'English', icon: '🇬🇧' },
  { value: 'fr-CH', code: 'fr', labelKey: 'settings.sections.language.options.frCH', fallback: 'French', icon: '🇫🇷' },
  { value: 'it-CH', code: 'it', labelKey: 'settings.sections.language.options.itCH', fallback: 'Italian', icon: '🇮🇹' }
];

const UNIT_OPTIONS: readonly {
  value: UserSettings['units'];
  labelKey: string;
  fallback: string;
}[] = [
  {
    value: 'metric',
    labelKey: 'settings.preferences.values.units.metric',
    fallback: 'Metric',
  },
  {
    value: 'imperial',
    labelKey: 'settings.preferences.values.units.imperial',
    fallback: 'Imperial',
  },
];

const TIME_FORMAT_OPTIONS: readonly {
  value: UserSettings['time_format'];
  labelKey: string;
  fallback: string;
}[] = [
  {
    value: '24h',
    labelKey: 'settings.preferences.values.timeFormat.24h',
    fallback: '24h',
  },
  {
    value: '12h',
    labelKey: 'settings.preferences.values.timeFormat.12h',
    fallback: '12h',
  },
];

const DATE_FORMAT_OPTIONS: readonly {
  value: UserSettings['date_format'];
  labelKey: string;
  fallback: string;
}[] = [
  {
    value: 'YYYY-MM-DD',
    labelKey: 'settings.preferences.values.dateFormat.iso',
    fallback: 'ISO (YYYY-MM-DD)',
  },
  {
    value: 'DD.MM.YYYY',
    labelKey: 'settings.preferences.values.dateFormat.dayFirst',
    fallback: 'Day-first (DD.MM.YYYY)',
  },
];

const SettingsPage = () => {
  const { t } = useTranslation('dashboard');
  const { theme, setTheme } = useTheme();
  const { settings, loading, error, updateSettings, updateResult, isUpdating } = useUserSettings();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const resolvedTheme = (settings?.theme ?? theme ?? 'system') as ThemeSetting;
  const [themeValue, setThemeValue] = useState<ThemeSetting>(resolvedTheme);
  const [themeComboboxKey, setThemeComboboxKey] = useState(0);
  const [unitsValue, setUnitsValue] = useState<UserSettings['units']>(settings?.units ?? 'metric');
  const [unitsComboboxKey, setUnitsComboboxKey] = useState(0);
  const [timeFormatValue, setTimeFormatValue] = useState<UserSettings['time_format']>(
    settings?.time_format ?? '24h'
  );
  const [timeFormatComboboxKey, setTimeFormatComboboxKey] = useState(0);
  const [dateFormatValue, setDateFormatValue] = useState<UserSettings['date_format']>(
    settings?.date_format ?? 'YYYY-MM-DD'
  );
  const initialLanguageValue = useMemo(() => {
    const stored =
      settings?.language ??
      (typeof window !== 'undefined' ? window.localStorage.getItem('smartpack-language') : null) ??
      i18n.language;

    if (typeof stored === 'string') {
      const normalized = LANGUAGE_OPTIONS.find(
        ({ value, code }) => value === stored || code === (stored.split('-')[0] as AppLanguage)
      );
      if (normalized) {
        return normalized.value;
      }
    }

    return LANGUAGE_OPTIONS[0]?.value ?? 'en';
  }, [settings?.language]);
  const [languageValue, setLanguageValue] = useState<string>(initialLanguageValue);
  const [languageComboboxKey, setLanguageComboboxKey] = useState(0);
  const [dateFormatComboboxKey, setDateFormatComboboxKey] = useState(0);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const locale = i18n.language;
  const resolvedTimeFormat = settings?.time_format ?? '24h';

  const formatDateTime = useCallback(
    (value: string | null | undefined) =>
      formatDateTimeWithPreference(value, {
        locale,
        timeFormat: resolvedTimeFormat,
      }),
    [locale, resolvedTimeFormat]
  );

  useEffect(() => {
    if (settings?.units) {
      setUnitsValue(settings.units);
      setUnitsComboboxKey((previous) => previous + 1);
    }
  }, [settings?.units]);

  useEffect(() => {
    if (settings?.time_format) {
      setTimeFormatValue(settings.time_format);
      setTimeFormatComboboxKey((previous) => previous + 1);
    }
  }, [settings?.time_format]);

  useEffect(() => {
    if (settings?.date_format) {
      setDateFormatValue(settings.date_format);
    }
  }, [settings?.date_format]);

  useEffect(() => {
    setThemeValue(resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    setLanguageValue(initialLanguageValue);
  }, [initialLanguageValue]);

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
  const themePlaceholder = t('settings.sections.appearance.themePlaceholder', {
    defaultValue: 'Select theme mode',
  });
  const unitsDisplayLabel = useMemo(() => {
    const option = UNIT_OPTIONS.find(({ value }) => value === unitsValue);
    if (!option) {
      return unitsValue;
    }
    return t(option.labelKey, { defaultValue: option.fallback });
  }, [t, unitsValue]);
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
  const languagePlaceholder = t('settings.sections.language.languagePlaceholder', {
    defaultValue: 'Select language',
  });
  const resolveDateFormatDisplay = useCallback(
    (value: UserSettings['date_format'] | null | undefined) => {
      if (!value) {
        return null;
      }
      const option = DATE_FORMAT_OPTIONS.find(({ value: optionValue }) => optionValue === value);
      if (!option) {
        return {
          label: value,
        };
      }
      return {
        label: t(option.labelKey, { defaultValue: option.fallback }),
      };
    },
    [t]
  );
  const dateFormatDisplay = resolveDateFormatDisplay(dateFormatValue);
  const dateFormatPlaceholder = t('settings.preferences.labels.dateFormatPlaceholder', {
    defaultValue: 'Select date format',
  });

  const createdAt = useMemo(() => formatDateTime(settings?.created_at), [formatDateTime, settings?.created_at]);
  const updatedAt = useMemo(() => formatDateTime(settings?.updated_at), [formatDateTime, settings?.updated_at]);

  const statusMessage = useMemo(() => {
    if (updateResult.error) {
      return {
        tone: 'error' as const,
        text:
          updateResult.error.message ||
          t('settings.messages.saveFailed', { defaultValue: 'We could not save your preferences.' }),
      };
    }

    if (updateResult.success) {
      return {
        tone: 'success' as const,
        text: t('settings.messages.saved', { defaultValue: 'Preferences saved.' }),
      };
    }

    return null;
  }, [t, updateResult.error, updateResult.success]);

  const handleThemeChange = useCallback(
    (nextTheme: ThemeSetting | null) => {
      setThemeComboboxKey((previous) => previous + 1);
      if (!nextTheme || nextTheme === themeValue) {
        return;
      }
      const previousTheme = themeValue;

      setThemeValue(nextTheme);
      setTheme(nextTheme);
      void (async () => {
        const success = await updateSettings({ theme: nextTheme });
        if (!success) {
          setThemeValue(previousTheme);
          setTheme(previousTheme);
        }
      })();
    },
    [themeValue, setTheme, updateSettings]
  );

  const handleUnitsChange = useCallback(
    (nextUnits: UserSettings['units'] | null) => {
      setUnitsComboboxKey((previous) => previous + 1);
      if (!nextUnits || nextUnits === unitsValue) {
        return;
      }
      const previousUnits = unitsValue;

      setUnitsValue(nextUnits);
      void (async () => {
        const success = await updateSettings({ units: nextUnits });
        if (!success) {
          setUnitsValue(previousUnits);
        }
      })();
    },
    [unitsValue, updateSettings]
  );

  const handleTimeFormatChange = useCallback(
    (nextTimeFormat: UserSettings['time_format'] | null) => {
      setTimeFormatComboboxKey((previous) => previous + 1);
      if (!nextTimeFormat || nextTimeFormat === timeFormatValue) {
        return;
      }
      const previousTimeFormat = timeFormatValue;

      setTimeFormatValue(nextTimeFormat);
      void (async () => {
        const success = await updateSettings({ time_format: nextTimeFormat });
        if (!success) {
          setTimeFormatValue(previousTimeFormat);
        }
      })();
    },
    [timeFormatValue, updateSettings]
  );

  const handleDateFormatChange = useCallback(
    (nextDateFormat: UserSettings['date_format'] | null) => {
      setDateFormatComboboxKey((previous) => previous + 1);
      if (!nextDateFormat || nextDateFormat === dateFormatValue) {
        return;
      }
      const previousDateFormat = dateFormatValue;

      setDateFormatValue(nextDateFormat);
      void (async () => {
        const success = await updateSettings({ date_format: nextDateFormat });
        if (!success) {
          setDateFormatValue(previousDateFormat);
        }
      })();
    },
    [dateFormatValue, updateSettings]
  );

  const handleLanguageChange = useCallback(
    (nextLanguage: string | null) => {
      setLanguageComboboxKey((previous) => previous + 1);
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

  const handleOpenDeleteDialog = useCallback(() => {
    setDeleteAccountError(null);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleDismissDeleteDialog = useCallback(() => {
    if (isDeletingAccount) {
      return;
    }
    setIsDeleteDialogOpen(false);
  }, [isDeletingAccount]);

  const handleConfirmDelete = useCallback(async () => {
    if (!user?.id) {
      setDeleteAccountError(
        t('settings.deleteAccount.error', {
          defaultValue: 'We could not delete your account. Please try again.'
        })
      );
      return;
    }

    setIsDeletingAccount(true);
    setDeleteAccountError(null);

    try {
      const result = await deleteUserAccount(user.id);
      if (!result.success) {
        const baseMessage = t('settings.deleteAccount.error', {
          defaultValue: 'We could not delete your account. Please try again.'
        });
        setDeleteAccountError(result.message ? `${baseMessage} (${result.message})` : baseMessage);
        return;
      }

      const signOutError = await signOut();
      if (signOutError) {
        console.error('Sign out after deleting account failed', signOutError);
      }

      setIsDeleteDialogOpen(false);
      navigate('/', { replace: true });
    } catch (deleteError) {
      console.error('Failed to delete account', deleteError);
      setDeleteAccountError(
        t('settings.deleteAccount.error', {
          defaultValue: 'We could not delete your account. Please try again.'
        })
      );
    } finally {
      if (isMountedRef.current) {
        setIsDeletingAccount(false);
      }
    }
  }, [navigate, signOut, t, user?.id]);

  return (
    <>
      <section className="flex flex-col gap-6">
        <header className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold">{t('settings.heading', { defaultValue: 'Settings' })}</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            {t('settings.subheading', { defaultValue: 'Manage your account preferences.' })}
          </p>
        </header>

        {statusMessage && (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm ${
              statusMessage.tone === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300'
                : 'border-red-200 bg-red-50 text-red-600 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300'
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
        <section className="relative z-40 flex min-w-0 flex-col gap-3 overflow-visible rounded-2xl border border-white/10 bg-white/60 p-6 shadow-sm backdrop-blur dark:border-slate-800/60 dark:bg-slate-900/60">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold">{t('settings.sections.appearance.title', { defaultValue: 'Appearance' })}</h2>
            <p className="text-sm text-[var(--text-secondary)]">
              {t('settings.sections.appearance.description', { defaultValue: 'Switch between light and dark themes to suit your preference.' })}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[var(--text-secondary)]" htmlFor="theme-setting">
              {t('settings.sections.appearance.themeLabel', { defaultValue: 'Theme mode' })}
            </label>
            <Combobox
              key={themeComboboxKey}
              value={themeValue}
              onChange={handleThemeChange}
              disabled={loading || isUpdating}
            >
              <div className="relative z-40 w-full max-w-full sm:w-64">
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
                      <span className="flex-1 text-left">
                        {themePlaceholder}
                      </span>
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
        <section className="relative z-50 flex min-w-0 flex-col gap-3 overflow-visible rounded-2xl border border-white/10 bg-white/60 p-6 shadow-sm backdrop-blur dark:border-slate-800/60 dark:bg-slate-900/60">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold">{t('settings.sections.language.title', { defaultValue: 'Language' })}</h2>
            <p className="text-sm text-[var(--text-secondary)]">
              {t('settings.sections.language.description', { defaultValue: 'Choose the language you want to use across the app.' })}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[var(--text-secondary)]" htmlFor="language-setting">
              {t('settings.sections.language.languageLabel', { defaultValue: 'Interface language' })}
            </label>
            <Combobox
              key={languageComboboxKey}
              value={languageValue}
              onChange={handleLanguageChange}
              disabled={loading || isUpdating}
            >
              <div className="relative z-40 w-full max-w-full sm:w-64">
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
        <section className="relative z-20 flex min-w-0 flex-col gap-3 overflow-visible rounded-2xl border border-white/10 bg-white/60 p-6 shadow-sm backdrop-blur dark:border-slate-800/60 dark:bg-slate-900/60">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold">
              {t('settings.sections.preferences.title', { defaultValue: 'Account preferences' })}
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              {t('settings.sections.preferences.description', {
                defaultValue: 'These values are stored in your account settings.',
              })}
            </p>
          </div>

          <div className="">
            {loading ? (
              <p className="text-[var(--text-secondary)]">
                {t('settings.preferences.state.loading', { defaultValue: 'Loading preferences…' })}
              </p>
            ) : error ? (
              <p className="text-sm text-red-500">
                {t('settings.preferences.state.error', {
                  defaultValue: 'We could not load your saved preferences.',
                })}
              </p>
            ) : settings ? (
              <ul className="flex flex-col divide-y divide-slate-200/70 dark:divide-slate-800/70">
                <li className="flex flex-col gap-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                  <label className="text-sm font-medium text-[var(--text-secondary)]" htmlFor="units-setting">
                    {t('settings.preferences.labels.units', { defaultValue: 'Units' })}
                  </label>
                  <Combobox
                    key={unitsComboboxKey}
                    value={unitsValue}
                    onChange={handleUnitsChange}
                    disabled={loading || isUpdating}
                  >
                    <div className="relative w-full sm:w-64">
                      <Combobox.Button
                        id="units-setting"
                        className="flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-[var(--text-primary)] shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary/30 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      >
                        <span className="flex-1 text-left">{unitsDisplayLabel}</span>
                        <ChevronUpDownIcon className="h-5 w-5 text-slate-500" aria-hidden="true" />
                      </Combobox.Button>
                      <Combobox.Options className="absolute z-40 mt-2 max-h-56 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-lg focus:outline-none dark:border-slate-700 dark:bg-slate-900">
                        {UNIT_OPTIONS.map(({ value, labelKey, fallback }) => (
                          <Combobox.Option
                            key={value}
                            value={value}
                            className={({ active }) =>
                              `cursor-pointer px-3 py-2 ${
                                active
                                  ? 'bg-brand-secondary/10 text-brand-secondary dark:bg-brand-secondary/20 dark:text-brand-secondary'
                                  : 'text-[var(--text-primary)]'
                              }`
                            }
                          >
                            {t(labelKey, { defaultValue: fallback })}
                          </Combobox.Option>
                        ))}
                      </Combobox.Options>
                    </div>
                  </Combobox>
                </li>
                <li className="flex flex-col gap-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-[var(--text-secondary)]">
                    {t('settings.preferences.labels.timeFormat', { defaultValue: 'Time format' })}
                  </span>
                  <Combobox
                    key={timeFormatComboboxKey}
                    value={timeFormatValue}
                    onChange={handleTimeFormatChange}
                    disabled={loading || isUpdating}
                  >
                    <div className="relative w-full sm:w-64">
                      <Combobox.Button
                        id="time-format-setting"
                        className="flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-[var(--text-primary)] shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary/30 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      >
                        <span className="flex-1 text-left">
                          {t(`settings.preferences.values.timeFormat.${timeFormatValue}`, {
                            defaultValue:
                              TIME_FORMAT_OPTIONS.find(({ value }) => value === timeFormatValue)?.fallback ?? timeFormatValue,
                          })}
                        </span>
                        <ChevronUpDownIcon className="h-5 w-5 text-slate-500" aria-hidden="true" />
                      </Combobox.Button>
                      <Combobox.Options className="absolute z-40 mt-2 max-h-56 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-lg focus:outline-none dark:border-slate-700 dark:bg-slate-900">
                        {TIME_FORMAT_OPTIONS.map(({ value, labelKey, fallback }) => (
                          <Combobox.Option
                            key={value}
                            value={value}
                            className={({ active }) =>
                              `cursor-pointer px-3 py-2 ${
                                active
                                  ? 'bg-brand-secondary/10 text-brand-secondary dark:bg-brand-secondary/20 dark:text-brand-secondary'
                                  : 'text-[var(--text-primary)]'
                              }`
                            }
                          >
                            {t(labelKey, { defaultValue: fallback })}
                          </Combobox.Option>
                        ))}
                      </Combobox.Options>
                    </div>
                  </Combobox>
                </li>
                <li className="flex flex-col gap-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-[var(--text-secondary)]">
                    {t('settings.preferences.labels.dateFormat', { defaultValue: 'Date format' })}
                  </span>
                  <Combobox
                    key={dateFormatComboboxKey}
                    value={dateFormatValue}
                    onChange={handleDateFormatChange}
                    disabled={loading || isUpdating}
                  >
                    <div className="relative w-full sm:w-64">
                      <Combobox.Button
                        id="date-format-setting"
                        className="flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-[var(--text-primary)] shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary/30 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      >
                        <span
                          className={`flex flex-1 items-center ${
                            dateFormatDisplay ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] dark:text-slate-400'
                          }`}
                        >
                          {dateFormatDisplay ? dateFormatDisplay.label : dateFormatPlaceholder}
                        </span>
                        <ChevronUpDownIcon className="h-5 w-5 text-slate-500" aria-hidden="true" />
                      </Combobox.Button>
                      <Combobox.Options className="absolute z-50 mt-2 max-h-56 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-lg focus:outline-none dark:border-slate-700 dark:bg-slate-900">
                        {DATE_FORMAT_OPTIONS.map(({ value, labelKey, fallback }) => (
                          <Combobox.Option
                            key={value}
                            value={value}
                            className={({ active }) =>
                              `cursor-pointer px-3 py-2 ${
                                active
                                  ? 'bg-brand-secondary/10 text-brand-secondary dark:bg-brand-secondary/20 dark:text-brand-secondary'
                                  : 'text-[var(--text-primary)]'
                              }`
                            }
                          >
                            {t(labelKey, { defaultValue: fallback })}
                          </Combobox.Option>
                        ))}
                      </Combobox.Options>
                    </div>
                  </Combobox>
                </li>
              </ul>
            ) : (
              <p className="text-[var(--text-secondary)]">
                {t('settings.preferences.state.empty', {
                  defaultValue: 'No preferences stored.',
                })}
              </p>
            )}
          </div>
        </section>
        <section className="relative z-10 flex min-w-0 flex-col gap-3 rounded-2xl border border-white/10 bg-white/60 p-6 shadow-sm backdrop-blur dark:border-slate-800/60 dark:bg-slate-900/60">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold">
              {t('settings.sections.accountInformation.title', { defaultValue: 'Account information' })}
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              {t('settings.sections.accountInformation.description', {
                defaultValue: 'Timestamps related to your account data.',
              })}
            </p>
          </div>
          <div className="">
            {loading ? (
              <p className="text-[var(--text-secondary)]">
                {t('settings.preferences.state.loading', { defaultValue: 'Loading preferences…' })}
              </p>
            ) : error ? (
              <p className="text-sm text-red-500">
                {t('settings.preferences.state.error', {
                  defaultValue: 'We could not load your saved preferences.',
                })}
              </p>
            ) : settings ? (
              <ul className="flex flex-col divide-y divide-slate-200/70 dark:divide-slate-800/70">
                <li className="flex flex-col gap-1 py-2 text-xs sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-[var(--text-secondary)]">
                    {t('settings.accountInformation.labels.created', { defaultValue: 'Created at' })}
                  </span>
                  <span className="font-medium text-[var(--text-primary)]">
                    {createdAt ?? t('settings.accountInformation.state.unknown', { defaultValue: 'Unknown' })}
                  </span>
                </li>
                <li className="flex flex-col gap-1 py-2 text-xs sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-[var(--text-secondary)]">
                    {t('settings.accountInformation.labels.updated', { defaultValue: 'Updated at' })}
                  </span>
                  <span className="font-medium text-[var(--text-primary)]">
                    {updatedAt ?? t('settings.accountInformation.state.unknown', { defaultValue: 'Unknown' })}
                  </span>
                </li>
              </ul>
            ) : (
              <p className="text-[var(--text-secondary)]">
                {t('settings.accountInformation.state.empty', {
                  defaultValue: 'No account information available.',
                })}
              </p>
            )}
          </div>
        </section>
          <section className="relative z-10 flex min-w-0 flex-col gap-4 rounded-2xl border border-red-200/70 bg-red-50/80 p-6 shadow-sm backdrop-blur dark:border-red-500/40 dark:bg-red-500/10 lg:col-span-2">
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold text-red-700 dark:text-red-300">
                {t('settings.deleteAccount.title', { defaultValue: 'Delete account' })}
              </h2>
              <p className="text-sm text-red-700/90 dark:text-red-200">
                {t('settings.deleteAccount.description', {
                  defaultValue: 'Deleting your account permanently removes your data. This action cannot be undone.'
                })}
              </p>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleOpenDeleteDialog}
                disabled={isDeletingAccount}
                className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {t('settings.deleteAccount.button', { defaultValue: 'Delete account' })}
              </button>
            </div>
          </section>
        </div>
      </section>

      <Transition show={isDeleteDialogOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={handleDismissDeleteDialog}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center px-4 py-8 sm:items-center sm:px-6">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-200"
                enterFrom="opacity-0 translate-y-6 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-6 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 shadow-2xl dark:border-red-500/40 dark:bg-slate-900">
                  <div className="space-y-3">
                    <Dialog.Title className="text-lg font-semibold text-slate-900 dark:text-white">
                      {t('settings.deleteAccount.modal.title', { defaultValue: 'Permanently delete account?' })}
                    </Dialog.Title>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {t('settings.deleteAccount.modal.description', {
                        defaultValue:
                          'This will remove your profile, preferences, and any associated data from SmartPack.'
                      })}
                    </p>
                    <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                      {t('settings.deleteAccount.modal.warning', { defaultValue: 'This action cannot be undone.' })}
                    </p>
                    {deleteAccountError ? (
                      <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
                        {deleteAccountError}
                      </p>
                    ) : null}
                  </div>
                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleDismissDeleteDialog}
                      disabled={isDeletingAccount}
                      className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:text-slate-100"
                    >
                      {t('settings.deleteAccount.modal.cancel', { defaultValue: 'Cancel' })}
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmDelete}
                      disabled={isDeletingAccount}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {t(
                        isDeletingAccount
                          ? 'settings.deleteAccount.modal.deleting'
                          : 'settings.deleteAccount.modal.confirm',
                        {
                          defaultValue: isDeletingAccount ? 'Deleting…' : 'Delete account'
                        }
                      )}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default SettingsPage;
