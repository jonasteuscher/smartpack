import { ChangeEvent, Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Combobox, Menu, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import LanguageSwitcher from '@components/common/LanguageSwitcher';
import ThemeToggle from '@components/common/ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { getAvatarInitials, getUserAvatarUrl } from '../utils/getUserAvatarUrl';
import { uploadProfileAvatar, removeProfileAvatar } from '../services/profileAvatar';
import { useProfile } from '../hooks/useProfile';
import { updateRecord } from '../services/supabaseCrud';
import type { Profile } from '../types/profile';

const OnboardPage = () => {
  const { t } = useTranslation('dashboard');
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { profile, refresh } = useProfile();

  const [signingOut, setSigningOut] = useState(false);
  const avatarUrl = useMemo(() => getUserAvatarUrl(user), [user]);
  const [localAvatarUrl, setLocalAvatarUrl] = useState<string | null>(avatarUrl);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [removingAvatar, setRemovingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setLocalAvatarUrl(avatarUrl);
  }, [avatarUrl]);

  const avatarInitials = useMemo(
    () =>
      getAvatarInitials(
        (user?.user_metadata?.first_name as string | undefined) ?? user?.user_metadata?.given_name ?? null,
        (user?.user_metadata?.last_name as string | undefined) ?? user?.user_metadata?.family_name ?? null,
        (user?.user_metadata?.display_name as string | null) ?? user?.email ?? null
      ),
    [user?.email, user?.user_metadata]
  );

  const handleTriggerUpload = () => {
    setAvatarError(null);
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setAvatarError(
        t('profile.errors.avatarInvalidType', {
          defaultValue: 'Please choose an image file.',
        })
      );
      return;
    }

    if (!user) {
      setAvatarError(
        t('profile.errors.mustBeSignedIn', {
          defaultValue: 'Sign in to update your profile.',
        })
      );
      return;
    }

    try {
      setUploadingAvatar(true);
      setAvatarError(null);
      const publicUrl = await uploadProfileAvatar(user, file);
      setLocalAvatarUrl(publicUrl);
      await refresh();
    } catch (uploadError) {
      const message =
        uploadError instanceof Error
          ? uploadError.message === 'avatar_upload_forbidden'
            ? t('profile.errors.avatarUploadForbidden', {
                defaultValue:
                  'Uploading is blocked by storage policies. Please contact support to enable profile photo uploads.',
              })
            : uploadError.message
          : t('profile.errors.avatarUploadFailed', {
              defaultValue: 'We couldn’t upload your profile picture. Try again.',
            });
      setAvatarError(message);
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = async () => {
    if (removingAvatar) {
      return;
    }

    if (!user) {
      setAvatarError(
        t('profile.errors.mustBeSignedIn', {
          defaultValue: 'Sign in to update your profile.',
        })
      );
      return;
    }

    try {
      setRemovingAvatar(true);
      setAvatarError(null);
      await removeProfileAvatar(user);
      setLocalAvatarUrl(null);
      await refresh();
    } catch (removeError) {
      const message =
        removeError instanceof Error
          ? removeError.message
          : t('profile.errors.avatarRemoveFailed', {
              defaultValue: 'We could not remove your profile picture.',
            });
      setAvatarError(message);
    } finally {
      setRemovingAvatar(false);
    }
  };

  const handleSignOut = async () => {
    if (signingOut) {
      return;
    }

    try {
      setSigningOut(true);
      const error = await signOut();
      if (error) {
        console.error('Failed to sign out', error);
      }
    } finally {
      setSigningOut(false);
    }
  };

  const handleCountrySaved = async () => {
    await refresh();
    navigate('/app/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[var(--surface-primary)] text-[var(--text-primary)]">
      <header className="pointer-events-auto">
        <div className="container-responsive pt-6">
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/80 px-6 py-4 shadow-sm backdrop-blur-md transition dark:border-slate-800/80 dark:bg-slate-900/70">
            <Link
              to="/app/dashboard"
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

            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <ThemeToggle />
              <Menu as="div" className="relative">
                <Menu.Button
                  className="flex items-center rounded-full border border-slate-200 bg-white p-0.5 text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  aria-label={t('nav.openUserMenu')}
                >
                  {localAvatarUrl ? (
                    <img
                      src={localAvatarUrl}
                      alt={t('nav.openUserMenu')}
                      className="h-9 w-9 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-200">
                      {avatarInitials}
                    </span>
                  )}
                </Menu.Button>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-50 mt-3 w-48 origin-top-right rounded-xl border border-slate-200 bg-white py-2 shadow-lg focus:outline-none dark:border-slate-700 dark:bg-slate-800">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          type="button"
                          onClick={handleSignOut}
                          disabled={signingOut}
                          className={`${
                            active
                              ? 'bg-red-50 text-red-600 dark:bg-red-900/40 dark:text-red-300'
                              : 'text-red-500 dark:text-red-400'
                          } block w-full px-4 py-2 text-left text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60`}
                        >
                          {t(`nav.${signingOut ? 'signingOut' : 'signOut'}`)}
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>
        </div>
      </header>
      <main className="container-responsive flex flex-col gap-8 pb-16 pt-12">
        <section className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/70 p-8 shadow dark:border-slate-800/70 dark:bg-slate-900/70">
          <h1 className="text-3xl font-semibold">{t('onboard.heading')}</h1>
          <p className="text-base text-[var(--text-secondary)]">{t('onboard.description')}</p>
        </section>
        <section className="grid gap-6 rounded-2xl border border-white/10 bg-white/70 p-8 shadow dark:border-slate-800/70 dark:bg-slate-900/70">
          <div className="grid gap-6 lg:grid-cols-[auto,1fr] lg:items-start lg:gap-10">
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white shadow dark:border-slate-700 dark:bg-slate-800">
                {localAvatarUrl ? (
                  <img
                    src={localAvatarUrl}
                    alt={t('profile.actions.updateAvatar')}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="text-2xl font-semibold text-slate-600 dark:text-slate-200">{avatarInitials}</span>
                )}
              </div>
              <div className="flex flex-col items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <div className="flex flex-col items-center gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleTriggerUpload}
                    className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    disabled={uploadingAvatar || removingAvatar}
                  >
                    {t(
                      uploadingAvatar
                        ? 'profile.actions.updateAvatarUploading'
                        : 'profile.actions.updateAvatar'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="rounded-full border border-red-300 px-4 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-500/80 dark:text-red-300 dark:hover:border-red-400 dark:hover:bg-red-500/20"
                    disabled={removingAvatar || uploadingAvatar || !localAvatarUrl}
                  >
                    {t(
                      removingAvatar
                        ? 'profile.actions.removeAvatarRemoving'
                        : 'profile.actions.removeAvatar'
                    )}
                  </button>
                </div>
                {avatarError ? <p className="text-xs text-red-500">{avatarError}</p> : null}
              </div>
            </div>

            <CountrySelector
              initialCountry={profile?.core_country_of_residence ?? null}
              initialLanguages={(profile?.core_languages as string[] | null) ?? []}
              onSuccess={handleCountrySaved}
            />
          </div>
        </section>
      </main>
    </div>
  );
};

interface CountryOption {
  name: string;
  code: string;
  flag: string;
}

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

interface CountrySelectorProps {
  initialCountry: string | null;
  initialLanguages: string[];
  onSuccess: () => void;
}

interface LanguageOption {
  code: string;
  name: string;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'en', name: 'English' },
  { code: 'de', name: 'German' },
  { code: 'fr', name: 'French' },
  { code: 'it', name: 'Italian' },
  { code: 'es', name: 'Spanish' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'nl', name: 'Dutch' },
  { code: 'sv', name: 'Swedish' },
  { code: 'no', name: 'Norwegian' },
  { code: 'da', name: 'Danish' },
  { code: 'fi', name: 'Finnish' },
  { code: 'pl', name: 'Polish' },
  { code: 'cs', name: 'Czech' },
  { code: 'ru', name: 'Russian' },
  { code: 'tr', name: 'Turkish' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
];

const CountrySelector = ({ initialCountry, initialLanguages, onSuccess }: CountrySelectorProps) => {
  const { t } = useTranslation('dashboard');
  const { user } = useAuth();
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [countriesError, setCountriesError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<CountryOption | null>(null);
  const [countryQuery, setCountryQuery] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(
    (initialLanguages ?? []).map((code) => code.toLowerCase())
  );
  const [languageToAdd, setLanguageToAdd] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

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
        setCountryQuery('');
      } catch (loadError) {
        if (loadError instanceof DOMException && loadError.name === 'AbortError') {
          return;
        }
        setCountriesError(
          t('profile.errors.countriesLoadFailed', {
            defaultValue: 'We could not load the list of countries.',
          })
        );
      } finally {
        setCountriesLoading(false);
      }
    };

    void loadCountries();

    return () => controller.abort();
  }, [t]);

  useEffect(() => {
    if (!countries.length) {
      return;
    }

    if (!initialCountry) {
      setSelectedCountry(null);
      return;
    }

    const normalized = initialCountry.toLowerCase();
    const match = countries.find(
      (country) =>
        country.name.toLowerCase() === normalized || country.code.toLowerCase() === normalized
    );

    if (match) {
      setSelectedCountry(match);
    } else {
      setSelectedCountry({ name: initialCountry, code: initialCountry, flag: toFlagEmoji(initialCountry) });
    }
    setCountryQuery('');
  }, [countries, initialCountry]);

  useEffect(() => {
    if (Array.isArray(initialLanguages)) {
      setSelectedLanguages(initialLanguages.map((code) => code.toLowerCase()));
    }
  }, [initialLanguages]);

  const filteredCountries = useMemo(() => {
    if (!countryQuery.trim()) {
      return countries;
    }

    const normalizedQuery = countryQuery.trim().toLowerCase();
    return countries.filter((country) => {
      const nameMatch = country.name.toLowerCase().includes(normalizedQuery);
      const codeMatch = country.code.toLowerCase().includes(normalizedQuery);
      return nameMatch || codeMatch;
    });
  }, [countries, countryQuery]);
  const availableLanguages = useMemo(() => {
    const chosen = new Set(selectedLanguages.map((code) => code.toLowerCase()));
    return LANGUAGE_OPTIONS.filter((language) => !chosen.has(language.code.toLowerCase()));
  }, [selectedLanguages]);

  const handleAddLanguage = () => {
    if (!languageToAdd) {
      return;
    }

    const code = languageToAdd.toLowerCase();
    if (selectedLanguages.map((item) => item.toLowerCase()).includes(code)) {
      setLanguageToAdd('');
      return;
    }

    setSelectedLanguages((prev) => [...prev, code]);
    setLanguageToAdd('');
    setSaved(false);
    setSaveError(null);
  };

  const handleRemoveLanguage = (code: string) => {
    const normalized = code.toLowerCase();
    setSelectedLanguages((prev) => prev.filter((item) => item !== normalized));
    setSaved(false);
    setSaveError(null);
  };

  const handleSave = async () => {
    if (!user?.id) {
      setSaveError(
        t('profile.errors.mustBeSignedIn', {
          defaultValue: 'Sign in to update your profile.',
        })
      );
      return;
    }

    if (!selectedCountry) {
      setSaveError(
        t('profile.errors.countrySelectRequired', {
          defaultValue: 'Please choose your home country.',
        })
      );
      return;
    }

    try {
      setSaving(true);
      setSaveError(null);
      setSaved(false);

      const payload: Partial<Profile> = {
        core_country_of_residence: selectedCountry.name,
      };

      if (selectedLanguages.length > 0) {
        payload.core_languages = selectedLanguages;
      } else {
        payload.core_languages = null;
      }

      const { error } = await updateRecord<Profile>(
        'profiles',
        payload,
        { match: { user_id: user.id } }
      );

      if (error) {
        throw error;
      }

      setSaved(true);
      onSuccess();
    } catch (saveError) {
      console.error('Failed to save country during onboarding', saveError);
      setSaveError(
        saveError instanceof Error
          ? saveError.message
          : t('profile.errors.countrySaveFailed', {
              defaultValue: 'We could not save your selected country.',
            })
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:items-start lg:gap-8">
      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-[var(--text-primary)]">
          {t('profile.fields.country')}
          <span className="ml-1 text-red-500" aria-hidden="true">
            *
          </span>
        </span>
        <div className="relative max-w-md">
          <Combobox
            value={selectedCountry}
            onChange={(country: CountryOption | null) => {
              setSelectedCountry(country);
              setSaved(false);
              setSaveError(null);
            }}
            disabled={countriesLoading || !!countriesError}
          >
            <div className="relative">
              <Combobox.Input
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                displayValue={(country: CountryOption | null) => country?.name ?? ''}
                placeholder={t('profile.actions.selectCountry', { defaultValue: 'Select your country' })}
                onChange={(event) => {
                  setCountryQuery(event.target.value);
                  setSaved(false);
                  setSaveError(null);
                }}
              />
              <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500">
                <ChevronUpDownIcon className="h-5 w-5" aria-hidden="true" />
              </Combobox.Button>
            </div>

            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
              afterLeave={() => setCountryQuery('')}
            >
              <Combobox.Options className="absolute left-0 right-0 z-10 mt-2 max-h-60 overflow-auto rounded-lg border border-slate-200 bg-white py-2 text-sm shadow-lg focus:outline-none dark:border-slate-700 dark:bg-slate-900">
                {countriesError ? (
                  <div className="px-4 py-2 text-xs text-red-500">{countriesError}</div>
                ) : countriesLoading ? (
                  <div className="px-4 py-2 text-[var(--text-secondary)]">
                    {t('profile.state.countriesLoading')}
                  </div>
                ) : filteredCountries.length === 0 ? (
                  <div className="px-4 py-2 text-[var(--text-secondary)]">
                    {t('profile.state.noCountriesFound', {
                      defaultValue: 'No countries match your search.',
                    })}
                  </div>
                ) : (
                  filteredCountries.map((country) => (
                    <Combobox.Option
                      key={country.code}
                      value={country}
                      className={({ active }) =>
                        `flex cursor-pointer items-center gap-2 px-4 py-2 ${
                          active
                            ? 'bg-brand-secondary/10 text-brand-secondary dark:bg-brand-secondary/20 dark:text-brand-secondary'
                            : 'text-[var(--text-primary)]'
                        }`
                      }
                    >
                      <span className="text-lg leading-none">{country.flag}</span>
                      <span className="flex-1 text-left">{country.name}</span>
                      {selectedCountry?.code === country.code ? (
                        <CheckIcon className="h-4 w-4 text-brand-secondary" aria-hidden="true" />
                      ) : null}
                    </Combobox.Option>
                  ))
                )}
              </Combobox.Options>
            </Transition>
          </Combobox>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-[var(--text-primary)]">
          {t('profile.fields.languages', { defaultValue: 'Languages' })}
        </span>
        <div className="flex flex-wrap gap-2">
          {selectedLanguages.length === 0 ? (
            <p className="text-xs text-[var(--text-secondary)]">
              {t('profile.fallback.notSet', { defaultValue: 'Not set' })}
            </p>
          ) : (
            selectedLanguages.map((code) => (
              <span
                key={code}
                className="flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold uppercase text-slate-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
              >
                {code.toUpperCase()}
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
          <select
            value={languageToAdd}
            onChange={(event) => setLanguageToAdd(event.target.value)}
            className="w-40 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="">
              {t('onboard.actions.selectLanguage', { defaultValue: 'Select language' })}
            </option>
            {availableLanguages.map((language) => (
              <option key={language.code} value={language.code}>
                {language.name} ({language.code.toUpperCase()})
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleAddLanguage}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-secondary text-lg font-semibold text-brand-secondary transition hover:bg-brand-secondary hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!languageToAdd}
            aria-label={t('onboard.actions.addLanguage', { defaultValue: 'Add language' })}
          >
            +
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 justify-end lg:col-span-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || countriesLoading || !selectedCountry}
          className="mt-4 rounded-full border border-brand-secondary px-4 py-2 text-sm font-semibold text-brand-secondary transition hover:bg-brand-secondary hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving
            ? t('profile.actions.saving', { defaultValue: 'Saving…' })
            : t('onboard.actions.continue', { defaultValue: 'Continue' })}
        </button>
        {countriesLoading ? (
          <span className="text-xs text-[var(--text-secondary)]">{t('profile.state.countriesLoading')}</span>
        ) : null}
      </div>

      {saveError ? (
        <p className="text-xs text-red-500 lg:col-span-2">{saveError}</p>
      ) : null}
      {saved ? (
        <p className="text-xs text-green-600 lg:col-span-2">
          {t('profile.state.settingsSaved', { defaultValue: 'Your settings have been saved.' })}
        </p>
      ) : null}
      {countriesError ? (
        <p className="text-xs text-red-500 lg:col-span-2">{countriesError}</p>
      ) : null}
    </div>
  );
};

export default OnboardPage;
