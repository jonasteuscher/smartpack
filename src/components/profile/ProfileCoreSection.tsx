import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Combobox } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { useTranslation } from 'react-i18next';
import type { User } from '@supabase/supabase-js';
import { updateRecord } from '@/services/supabaseCrud';
import type { Profile } from '@/types/profile';

interface CountryOption {
  name: string;
  code: string;
  flag: string;
}

interface LanguageOption {
  code: string;
  name: string;
  emoji?: string;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'en', name: 'English', emoji: '🇬🇧' },
  { code: 'de', name: 'German', emoji: '🇩🇪' },
  { code: 'fr', name: 'French', emoji: '🇫🇷' },
  { code: 'it', name: 'Italian', emoji: '🇮🇹' },
  { code: 'es', name: 'Spanish', emoji: '🇪🇸' },
  { code: 'pt', name: 'Portuguese', emoji: '🇵🇹' },
  { code: 'nl', name: 'Dutch', emoji: '🇳🇱' },
  { code: 'sv', name: 'Swedish', emoji: '🇸🇪' },
  { code: 'no', name: 'Norwegian', emoji: '🇳🇴' },
  { code: 'da', name: 'Danish', emoji: '🇩🇰' },
  { code: 'fi', name: 'Finnish', emoji: '🇫🇮' },
  { code: 'pl', name: 'Polish', emoji: '🇵🇱' },
  { code: 'cs', name: 'Czech', emoji: '🇨🇿' },
  { code: 'ru', name: 'Russian', emoji: '🇷🇺' },
  { code: 'tr', name: 'Turkish', emoji: '🇹🇷' },
  { code: 'ja', name: 'Japanese', emoji: '🇯🇵' },
  { code: 'ko', name: 'Korean', emoji: '🇰🇷' },
  { code: 'zh', name: 'Chinese', emoji: '🇨🇳' },
  { code: 'ar', name: 'Arabic', emoji: '🇸🇦' },
  { code: 'hi', name: 'Hindi', emoji: '🇮🇳' },
];

const toFlagEmoji = (countryCode: string) => {
  if (!countryCode || countryCode.length !== 2) {
    return '';
  }

  return countryCode
    .toUpperCase()
    .split('')
    .map((char) => {
      const codePoint = char.charCodeAt(0);
      if (codePoint < 65 || codePoint > 90) {
        return '';
      }
      return String.fromCodePoint(127397 + codePoint);
    })
    .join('');
};

const normalizeLanguages = (languages: string[]): string[] =>
  languages
    .map((code) => (typeof code === 'string' ? code.trim().toLowerCase() : ''))
    .filter((code) => code.length > 0)
    .sort();

const languagesEqual = (a: string[], b: string[]): boolean => {
  if (a.length !== b.length) {
    return false;
  }

  for (let index = 0; index < a.length; index += 1) {
    if (a[index] !== b[index]) {
      return false;
    }
  }

  return true;
};

const formatValue = (
  value: unknown,
  fallbackLabel: string,
  t: (key: string, options?: Record<string, unknown>) => string
) => {
  if (value === null || value === undefined) {
    return fallbackLabel;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return fallbackLabel;
    }
    return value.join(', ');
  }

  if (typeof value === 'boolean') {
    return value
      ? t('profile.fallback.boolean.true', { defaultValue: 'Yes' })
      : t('profile.fallback.boolean.false', { defaultValue: 'No' });
  }

  if (value === '') {
    return fallbackLabel;
  }

  return String(value);
};

interface ProfileCoreSectionProps {
  profile: Profile | null;
  user: User | null;
  authMethod: string | null;
  refreshProfile: () => Promise<void>;
  refreshSignal: number;
  onEditingChange?: (isEditing: boolean) => void;
}

const ProfileCoreSection = ({
  profile,
  user,
  authMethod,
  refreshProfile,
  refreshSignal,
  onEditingChange,
}: ProfileCoreSectionProps) => {
  const { t, i18n } = useTranslation('dashboard');

  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [countriesError, setCountriesError] = useState<string | null>(null);
  const [countryQuery, setCountryQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryOption | null>(null);
  const [originalCountry, setOriginalCountry] = useState<string | null>(null);

  const [coreFirstName, setCoreFirstName] = useState('');
  const [coreLastName, setCoreLastName] = useState('');
  const [originalFirstName, setOriginalFirstName] = useState('');
  const [originalLastName, setOriginalLastName] = useState('');

  const [coreLanguages, setCoreLanguages] = useState<string[]>([]);
  const [originalLanguages, setOriginalLanguages] = useState<string[]>([]);
  const [languageToAddOption, setLanguageToAddOption] = useState<LanguageOption | null>(null);
  const [languageQuery, setLanguageQuery] = useState('');

  const [isEditingCore, setIsEditingCore] = useState(false);
  const [savingCore, setSavingCore] = useState(false);
  const [coreSaveError, setCoreSaveError] = useState<string | null>(null);
  const [coreSaved, setCoreSaved] = useState(false);

  useEffect(() => {
    onEditingChange?.(isEditingCore);
  }, [isEditingCore, onEditingChange]);

  useEffect(() => {
    setCoreSaved(false);
    setCoreSaveError(null);
  }, [refreshSignal]);

  const resolveCountryOption = useCallback(
    (value: string | null | undefined) => {
      if (!value) {
        return null;
      }

      const normalized = value.toLowerCase();
      const match = countries.find(
        (country) =>
          country.name.toLowerCase() === normalized || country.code.toLowerCase() === normalized
      );

      if (match) {
        return match;
      }

      return { name: value, code: value, flag: toFlagEmoji(value) } satisfies CountryOption;
    },
    [countries]
  );

  useEffect(() => {
    if (!isEditingCore) {
      const first = typeof profile?.user_firstname === 'string' ? profile.user_firstname : '';
      const last = typeof profile?.user_lastname === 'string' ? profile.user_lastname : '';
      setCoreFirstName(first ?? '');
      setCoreLastName(last ?? '');
      setOriginalFirstName(first ?? '');
      setOriginalLastName(last ?? '');
    }
  }, [profile?.user_firstname, profile?.user_lastname, isEditingCore]);

  useEffect(() => {
    if (!isEditingCore) {
      const rawLanguages = Array.isArray(profile?.core_languages)
        ? (profile?.core_languages as string[])
        : [];
      const normalized = normalizeLanguages(rawLanguages);
      setCoreLanguages(normalized);
      setOriginalLanguages(normalized);
      setLanguageToAddOption(null);
      setLanguageQuery('');
    }
  }, [profile?.core_languages, isEditingCore]);

  useEffect(() => {
    const currentValue =
      typeof profile?.core_country_of_residence === 'string'
        ? profile.core_country_of_residence.trim()
        : null;

    setOriginalCountry(currentValue && currentValue.length > 0 ? currentValue : null);

    if (!isEditingCore) {
      setSelectedCountry(resolveCountryOption(currentValue));
      setCountryQuery('');
    }
  }, [profile?.core_country_of_residence, resolveCountryOption, isEditingCore]);

  useEffect(() => {
    const controller = new AbortController();

    const loadCountries = async () => {
      try {
        setCountriesLoading(true);
        setCountriesError(null);
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2', {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('countries_load_failed');
        }

        const payload = (await response.json()) as { name?: { common?: string }; cca2?: string }[];
        const options = payload
          .map((country) => {
            const code = country.cca2 ?? '';
            const name = country.name?.common ?? '';
            return {
              code,
              name,
              flag: toFlagEmoji(code),
            } satisfies CountryOption;
          })
          .filter((country) => country.code && country.name)
          .sort((a, b) => a.name.localeCompare(b.name));

        setCountries(options);
      } catch (loadError) {
        if (loadError instanceof DOMException && loadError.name === 'AbortError') {
          return;
        }
        setCountriesError(
          t('profile.errors.countriesLoadFailed', {
            defaultValue: 'We couldn’t load the list of countries.',
          })
        );
      } finally {
        setCountriesLoading(false);
      }
    };

    void loadCountries();

    return () => controller.abort();
  }, [t]);

  const countryDisplayNames = useMemo(() => {
    try {
      return new Intl.DisplayNames([i18n.language ?? 'en'], { type: 'region' });
    } catch {
      return null;
    }
  }, [i18n.language]);

  const getCountryDisplayName = useCallback(
    (country: CountryOption | null | undefined) => {
      if (!country) {
        return null;
      }

      const upperCode = country.code?.toUpperCase();
      if (upperCode && upperCode.length === 2) {
        const localized = countryDisplayNames?.of(upperCode);
        if (localized && localized.toUpperCase() !== upperCode) {
          return localized;
        }
      }

      return country.name;
    },
    [countryDisplayNames]
  );

  const filteredCountries = useMemo(() => {
    if (!countryQuery.trim()) {
      return countries;
    }

    const normalizedQuery = countryQuery.trim().toLowerCase();
    return countries.filter((country) => {
      const nameMatch = country.name.toLowerCase().includes(normalizedQuery);
      const codeMatch = country.code.toLowerCase().includes(normalizedQuery);
      const localizedName = getCountryDisplayName(country)?.toLowerCase() ?? '';
      const localizedMatch = localizedName.includes(normalizedQuery);
      return nameMatch || codeMatch || localizedMatch;
    });
  }, [countries, countryQuery, getCountryDisplayName]);

  const languageOptionByCode = useMemo(() => {
    const map = new Map<string, LanguageOption>();
    LANGUAGE_OPTIONS.forEach((option) => {
      map.set(option.code.toLowerCase(), option);
    });
    return map;
  }, []);

  const languageOptionsSorted = useMemo(
    () =>
      [...LANGUAGE_OPTIONS].sort((a, b) =>
        a.name.localeCompare(b.name, i18n.language || undefined, { sensitivity: 'base' })
      ),
    [i18n.language]
  );

  const filteredAvailableLanguages = useMemo(() => {
    const chosen = new Set(coreLanguages.map((code) => code.toLowerCase()));
    const normalizedQuery = languageQuery.trim().toLowerCase();

    return languageOptionsSorted.filter((option) => {
      if (chosen.has(option.code.toLowerCase())) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return (
        option.code.toLowerCase().includes(normalizedQuery) ||
        option.name.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [coreLanguages, languageOptionsSorted, languageQuery]);

  const getLanguageBadgeLabel = useCallback(
    (code: string) => {
      const normalized = code.toLowerCase();
      const option = languageOptionByCode.get(normalized);
      if (!option) {
        return normalized.toUpperCase();
      }
      return `${option.name} (${option.code.toUpperCase()})`;
    },
    [languageOptionByCode]
  );

  const normalizedSelectedCountry = useMemo(() => {
    if (!selectedCountry) {
      return null;
    }
    if (selectedCountry.code.length === 2) {
      return selectedCountry.code;
    }
    return selectedCountry.name;
  }, [selectedCountry]);

  const trimmedFirstName = coreFirstName.trim();
  const trimmedLastName = coreLastName.trim();

  const isFirstNameDirty = trimmedFirstName !== originalFirstName;
  const isLastNameDirty = trimmedLastName !== originalLastName;
  const isCountryDirty = normalizedSelectedCountry !== (originalCountry ?? null);
  const isLanguagesDirty = !languagesEqual(coreLanguages, originalLanguages);

  const isCoreDirty = isFirstNameDirty || isLastNameDirty || isCountryDirty || isLanguagesDirty;

  const handleStartEditingCore = () => {
    setIsEditingCore(true);
    setCoreSaved(false);
    setCoreSaveError(null);
  };

  const handleCancelEditingCore = () => {
    setIsEditingCore(false);
    setCoreSaved(false);
    setCoreSaveError(null);
    setCoreFirstName(originalFirstName ?? '');
    setCoreLastName(originalLastName ?? '');
    setCoreLanguages(originalLanguages);
    setLanguageToAddOption(null);
    setLanguageQuery('');
    setSelectedCountry(resolveCountryOption(originalCountry));
  };

  const handleAddLanguage = () => {
    if (!languageToAddOption) {
      return;
    }

    const normalized = languageToAddOption.code.toLowerCase();
    if (coreLanguages.includes(normalized)) {
      setLanguageToAddOption(null);
      setLanguageQuery('');
      return;
    }

    setCoreLanguages((prev) => normalizeLanguages([...prev, normalized]));
    setLanguageToAddOption(null);
    setLanguageQuery('');
    setCoreSaved(false);
    setCoreSaveError(null);
  };

  const handleRemoveLanguage = (code: string) => {
    const normalized = code.toLowerCase();
    setCoreLanguages((prev) => normalizeLanguages(prev.filter((item) => item !== normalized)));
    setCoreSaved(false);
    setCoreSaveError(null);
  };

  const handleSaveCore = async () => {
    if (!user?.id) {
      setCoreSaveError(
        t('profile.errors.mustBeSignedIn', {
          defaultValue: 'Sign in to update your profile.',
        })
      );
      return;
    }

    if (!isCoreDirty) {
      setIsEditingCore(false);
      return;
    }

    try {
      setSavingCore(true);
      setCoreSaveError(null);

      const payload: Partial<Profile> = {};

      if (isFirstNameDirty) {
        payload.user_firstname = trimmedFirstName.length > 0 ? trimmedFirstName : null;
      }

      if (isLastNameDirty) {
        payload.user_lastname = trimmedLastName.length > 0 ? trimmedLastName : null;
      }

      if (isCountryDirty) {
        payload.core_country_of_residence = selectedCountry?.name ?? null;
      }

      if (isLanguagesDirty) {
        payload.core_languages = coreLanguages.length > 0 ? coreLanguages : null;
      }

      if (Object.keys(payload).length === 0) {
        setIsEditingCore(false);
        return;
      }

      const { error: updateError } = await updateRecord<Profile>('profiles', payload, {
        match: { user_id: user.id },
      });

      if (updateError) {
        throw updateError;
      }

      await refreshProfile();
      setIsEditingCore(false);
      setCoreSaved(true);
      setOriginalFirstName(trimmedFirstName);
      setOriginalLastName(trimmedLastName);
      setOriginalLanguages(coreLanguages);
      setOriginalCountry(selectedCountry?.name ?? null);
    } catch (saveError) {
      console.error('Failed to save core profile data', saveError);
      setCoreSaveError(
        saveError instanceof Error
          ? saveError.message
          : t('profile.errors.countrySaveFailed', {
              defaultValue: 'We couldn’t save your changes. Try again.',
            })
      );
    } finally {
      setSavingCore(false);
    }
  };

  const countryDisplayOption = useMemo(() => {
    if (!normalizedSelectedCountry) {
      return null;
    }

    if (!selectedCountry) {
      return resolveCountryOption(normalizedSelectedCountry);
    }

    return selectedCountry;
  }, [normalizedSelectedCountry, resolveCountryOption, selectedCountry]);

  const selectedCountryDisplayName = useMemo(() => {
    if (!countryDisplayOption) {
      return normalizedSelectedCountry;
    }

    return getCountryDisplayName(countryDisplayOption) ?? normalizedSelectedCountry;
  }, [countryDisplayOption, getCountryDisplayName, normalizedSelectedCountry]);

  const emailValue = user?.email ?? t('profile.fallback.notSet');
  const isGoogleSignIn = authMethod === 'google';
  const signInMethodDisplay = isGoogleSignIn
    ? t('profile.fields.authMethodProvider', { provider: 'Google', defaultValue: 'Google' })
    : authMethod === 'email'
    ? t('profile.fields.authMethodPassword', { defaultValue: 'Email / Passwort' })
    : authMethod
    ? t('profile.fields.authMethodProvider', {
        provider: authMethod,
        defaultValue: authMethod.charAt(0).toUpperCase() + authMethod.slice(1),
      })
    : t('profile.fallback.notSet');

  const fallbackLabel = t('profile.fallback.notSet');

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/60 p-6 shadow dark:border-slate-800/60 dark:bg-slate-900/60 lg:col-span-2">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-lg font-semibold">{t('profile.sections.core')}</h2>
        {isEditingCore ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCancelEditingCore}
              className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:text-slate-200 dark:hover:border-slate-500"
              disabled={savingCore}
            >
              {t('profile.actions.cancel', { defaultValue: 'Cancel' })}
            </button>
            <button
              type="button"
              onClick={handleSaveCore}
              className="rounded-full border border-brand-secondary px-4 py-2 text-xs font-semibold text-brand-secondary transition hover:bg-brand-secondary hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              disabled={savingCore || !isCoreDirty}
            >
              {savingCore
                ? t('profile.actions.saving', { defaultValue: 'Saving…' })
                : t('profile.actions.save', { defaultValue: 'Save changes' })}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleStartEditingCore}
            className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-brand-secondary hover:text-brand-secondary disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:text-slate-200 dark:hover:border-brand-primary dark:hover:text-brand-primary"
            disabled={countriesLoading}
          >
            {t('profile.actions.edit', { defaultValue: 'Edit' })}
          </button>
        )}
      </div>
      {coreSaveError ? <p className="text-xs text-red-500">{coreSaveError}</p> : null}
      {!coreSaveError && coreSaved ? (
        <p className="text-xs text-emerald-600">
          {t('profile.state.settingsSaved', { defaultValue: 'Your settings have been saved.' })}
        </p>
      ) : null}
      <dl className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <dt className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
            {t('profile.fields.firstname')}
          </dt>
          <dd className="text-sm font-medium text-[var(--text-primary)]">
            {isEditingCore ? (
              <input
                type="text"
                value={coreFirstName}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  setCoreFirstName(event.target.value);
                  setCoreSaved(false);
                  setCoreSaveError(null);
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              />
            ) : (
              formatValue(profile?.user_firstname, fallbackLabel, t)
            )}
          </dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
            {t('profile.fields.lastname')}
          </dt>
          <dd className="text-sm font-medium text-[var(--text-primary)]">
            {isEditingCore ? (
              <input
                type="text"
                value={coreLastName}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  setCoreLastName(event.target.value);
                  setCoreSaved(false);
                  setCoreSaveError(null);
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              />
            ) : (
              formatValue(profile?.user_lastname, fallbackLabel, t)
            )}
          </dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
            {t('profile.fields.country')}
          </dt>
          <dd className="text-sm font-medium text-[var(--text-primary)]">
            {isEditingCore ? (
              <div className="relative">
                <Combobox
                  value={selectedCountry}
                  onChange={(value: CountryOption | null) => {
                    setSelectedCountry(value);
                    setCoreSaved(false);
                    setCoreSaveError(null);
                  }}
                >
                  <div className="relative">
                    <Combobox.Input
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                      displayValue={(country: CountryOption | null) =>
                        getCountryDisplayName(country) ?? country?.name ?? ''
                      }
                      placeholder={t('profile.actions.selectCountry', {
                        defaultValue: 'Select your country',
                      })}
                      onChange={(event) => {
                        setCountryQuery(event.target.value);
                        setCoreSaved(false);
                        setCoreSaveError(null);
                      }}
                    />
                    <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500">
                      <ChevronUpDownIcon className="h-5 w-5" aria-hidden="true" />
                    </Combobox.Button>
                  </div>
                  <Combobox.Options className="absolute z-10 mt-2 max-h-56 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-lg focus:outline-none dark:border-slate-700 dark:bg-slate-900">
                    {countriesLoading ? (
                      <p className="px-3 py-2 text-xs text-[var(--text-secondary)]">
                        {t('profile.state.countriesLoading', { defaultValue: 'Loading countries…' })}
                      </p>
                    ) : countriesError ? (
                      <p className="px-3 py-2 text-xs text-red-500">{countriesError}</p>
                    ) : filteredCountries.length === 0 ? (
                      <p className="px-3 py-2 text-xs text-[var(--text-secondary)]">
                        {t('profile.state.noCountriesFound', {
                          defaultValue: 'No countries match your search.',
                        })}
                      </p>
                    ) : (
                      filteredCountries.map((country) => (
                        <Combobox.Option
                          key={`${country.code}-${country.name}`}
                          value={country}
                          className={({ active }) =>
                            `flex cursor-pointer items-center gap-2 px-3 py-2 ${
                              active
                                ? 'bg-brand-secondary/10 text-brand-secondary dark:bg-brand-secondary/20 dark:text-brand-secondary'
                                : 'text-[var(--text-primary)]'
                            }`
                          }
                        >
                          <span className="text-lg leading-none">{country.flag}</span>
                          <span className="flex-1 text-left">
                            {getCountryDisplayName(country) ?? country.name}
                          </span>
                        </Combobox.Option>
                      ))
                    )}
                  </Combobox.Options>
                </Combobox>
              </div>
            ) : normalizedSelectedCountry ? (
              <span className="flex items-center gap-2">
                {countryDisplayOption?.flag ? (
                  <span className="text-lg leading-none">{countryDisplayOption.flag}</span>
                ) : null}
                <span>{selectedCountryDisplayName ?? normalizedSelectedCountry}</span>
              </span>
            ) : (
              fallbackLabel
            )}
          </dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
            {t('profile.fields.languages')}
          </dt>
          <dd className="text-sm font-medium text-[var(--text-primary)]">
            {isEditingCore ? (
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                  {coreLanguages.length === 0 ? (
                    <span className="text-xs text-[var(--text-secondary)]">
                      {t('profile.fallback.notSet')}
                    </span>
                  ) : (
                    coreLanguages.map((code) => (
                      <span
                        key={code}
                        className="flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold uppercase text-slate-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                      >
                        {getLanguageBadgeLabel(code)}
                        <button
                          type="button"
                          onClick={() => handleRemoveLanguage(code)}
                          className="text-slate-400 transition hover:text-red-500"
                          aria-label={t('onboard.actions.removeLanguage', {
                            defaultValue: 'Remove language',
                          })}
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Combobox
                      value={languageToAddOption}
                      onChange={(value: LanguageOption | null) => {
                        setLanguageToAddOption(value);
                        setCoreSaved(false);
                        setCoreSaveError(null);
                      }}
                    >
                      <div className="relative">
                        <Combobox.Input
                          className="w-64 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                          displayValue={(language: LanguageOption | null) =>
                            language ? `${language.name} (${language.code.toUpperCase()})` : ''
                          }
                          placeholder={t('profile.actions.selectLanguage', {
                            defaultValue: 'Select language',
                          })}
                          onChange={(event) => {
                            setLanguageQuery(event.target.value);
                            setCoreSaved(false);
                            setCoreSaveError(null);
                          }}
                        />
                        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500">
                          <ChevronUpDownIcon className="h-5 w-5" aria-hidden="true" />
                        </Combobox.Button>
                      </div>
                      <Combobox.Options className="absolute z-10 mt-2 max-h-56 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-lg focus:outline-none dark:border-slate-700 dark:bg-slate-900">
                        {filteredAvailableLanguages.length === 0 ? (
                          <p className="px-3 py-2 text-xs text-[var(--text-secondary)]">
                            {t('profile.state.noLanguagesFound', {
                              defaultValue: 'No languages found.',
                            })}
                          </p>
                        ) : (
                          filteredAvailableLanguages.map((language) => (
                            <Combobox.Option
                              key={language.code}
                              value={language}
                              className={({ active }) =>
                                `flex cursor-pointer items-center gap-2 px-3 py-2 ${
                                  active
                                    ? 'bg-brand-secondary/10 text-brand-secondary dark:bg-brand-secondary/20 dark:text-brand-secondary'
                                    : 'text-[var(--text-primary)]'
                                }`
                              }
                            >
                              {language.emoji ? (
                                <span className="text-lg leading-none">{language.emoji}</span>
                              ) : null}
                              <span className="flex-1 text-left">
                                {language.name} ({language.code.toUpperCase()})
                              </span>
                            </Combobox.Option>
                          ))
                        )}
                      </Combobox.Options>
                    </Combobox>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddLanguage}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-secondary text-lg font-semibold text-brand-secondary transition hover:bg-brand-secondary hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!languageToAddOption}
                    aria-label={t('onboard.actions.addLanguage', { defaultValue: 'Add language' })}
                  >
                    +
                  </button>
                </div>
              </div>
            ) : originalLanguages.length === 0 ? (
              <span className="text-xs text-[var(--text-secondary)]">{fallbackLabel}</span>
            ) : (
              <div className="flex flex-wrap gap-2">
                {originalLanguages.map((code) => (
                  <span
                    key={code}
                    className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold uppercase text-slate-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                  >
                    {getLanguageBadgeLabel(code)}
                  </span>
                ))}
              </div>
            )}
          </dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
            {t('profile.fields.email')}
          </dt>
          <dd className="text-sm font-medium text-[var(--text-primary)]">{emailValue}</dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
            {t('profile.fields.authMethod', { defaultValue: 'Authentication method' })}
          </dt>
          <dd className="text-sm font-medium text-[var(--text-primary)]">
            {isGoogleSignIn ? (
              <span className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#4285F4]/40 bg-white shadow-sm">
                  <svg aria-hidden viewBox="0 0 24 24" className="h-3.5 w-3.5">
                    <path
                      fill="#4285F4"
                      d="M21.35 11.1H12v2.9h5.35c-.23 1.4-.95 2.6-2.03 3.4v2.8h3.28c1.92-1.77 3.03-4.38 3.03-7.5 0-.72-.07-1.42-.2-2.1z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 22c2.7 0 4.96-.9 6.62-2.5l-3.28-2.8c-.91.6-2.08.95-3.34.95-2.56 0-4.72-1.73-5.49-4.05H3.12v2.86C4.77 19.87 8.09 22 12 22z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M6.51 13.6c-.2-.6-.31-1.25-.31-1.9s.11-1.3.31-1.9V6.94H3.12A9.97 9.97 0 0 0 2 11.7c0 1.57.36 3.07 1.12 4.76l3.39-2.86z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.8c1.47 0 2.79.5 3.83 1.47l2.86-2.87C16.96 2.75 14.7 2 12 2 8.09 2 4.77 4.13 3.12 7.64l3.39 2.86C7.28 7.53 9.44 5.8 12 5.8z"
                    />
                  </svg>
                </span>
                <span>{signInMethodDisplay}</span>
              </span>
            ) : (
              signInMethodDisplay
            )}
          </dd>
        </div>
      </dl>
    </article>
  );
};

export default ProfileCoreSection;
