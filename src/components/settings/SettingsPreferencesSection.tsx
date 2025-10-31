import { useCallback, useEffect, useMemo, useState } from 'react';
import { Combobox } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { useTranslation } from 'react-i18next';
import type { UserSettings } from '@/types/userSettings';

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

interface SettingsPreferencesSectionProps {
  settings: UserSettings | null | undefined;
  loading: boolean;
  error: Error | null;
  isUpdating: boolean;
  updateSettings: (values: Partial<UserSettings>) => Promise<boolean>;
}

const SettingsPreferencesSection = ({
  settings,
  loading,
  error,
  isUpdating,
  updateSettings,
}: SettingsPreferencesSectionProps) => {
  const { t } = useTranslation('dashboard');

  const [unitsValue, setUnitsValue] = useState<UserSettings['units']>(settings?.units ?? 'metric');
  const [unitsComboboxKey, setUnitsComboboxKey] = useState(0);
  const [timeFormatValue, setTimeFormatValue] = useState<UserSettings['time_format']>(
    settings?.time_format ?? '24h'
  );
  const [timeFormatComboboxKey, setTimeFormatComboboxKey] = useState(0);
  const [dateFormatValue, setDateFormatValue] = useState<UserSettings['date_format']>(
    settings?.date_format ?? 'YYYY-MM-DD'
  );
  const [dateFormatComboboxKey, setDateFormatComboboxKey] = useState(0);

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
      setDateFormatComboboxKey((previous) => previous + 1);
    }
  }, [settings?.date_format]);

  const unitsDisplayLabel = useMemo(() => {
    const option = UNIT_OPTIONS.find(({ value }) => value === unitsValue);
    if (!option) {
      return unitsValue;
    }
    return t(option.labelKey, { defaultValue: option.fallback });
  }, [t, unitsValue]);

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
  const dateFormatPlaceholder = useMemo(
    () =>
      t('settings.preferences.labels.dateFormatPlaceholder', {
        defaultValue: 'Select date format',
      }),
    [t]
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

  return (
    <section className="relative z-20 flex min-w-0 flex-col gap-3 overflow-visible rounded-2xl border border-white/10 bg-white/60 p-6 shadow-sm backdrop-blur focus-within:z-[60] dark:border-slate-800/60 dark:bg-slate-900/60">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">
          {t('settings.sections.preferences.title', { defaultValue: 'Account preferences' })}
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">
          {t('settings.sections.preferences.description', {
            defaultValue:
              'Update measurement settings and how dates are displayed throughout the application.',
          })}
        </p>
      </div>
      <div>
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
              <span className="text-[var(--text-secondary)]">
                {t('settings.preferences.labels.units', { defaultValue: 'Units' })}
              </span>
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
                  <Combobox.Options className="absolute z-30 mt-2 max-h-56 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-lg focus:outline-none dark:border-slate-700 dark:bg-slate-900">
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
                          TIME_FORMAT_OPTIONS.find(({ value }) => value === timeFormatValue)?.fallback ??
                          timeFormatValue,
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
                        dateFormatDisplay
                          ? 'text-[var(--text-primary)]'
                          : 'text-[var(--text-secondary)] dark:text-slate-400'
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
            {t('settings.preferences.state.empty', { defaultValue: 'No preferences stored.' })}
          </p>
        )}
      </div>
    </section>
  );
};

export default SettingsPreferencesSection;
