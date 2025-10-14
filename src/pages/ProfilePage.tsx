import { ChangeEvent, useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { Combobox } from '@headlessui/react';
import { ArrowPathIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { uploadProfileAvatar } from '../services/profileAvatar';
import { updateRecord } from '../services/supabaseCrud';
import type { Profile } from '../types/profile';

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

const ProfilePage = () => {
  const { t } = useTranslation('dashboard');
  const { user } = useAuth();
  const {
    profile,
    loading,
    error,
    refresh,
    avatarUrl,
    avatarInitials,
    displayName,
    authMethod,
  } = useProfile();

  const [localAvatarUrl, setLocalAvatarUrl] = useState<string | null>(avatarUrl);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [countriesError, setCountriesError] = useState<string | null>(null);
  const [countryQuery, setCountryQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryOption | null>(null);
  const [originalCountry, setOriginalCountry] = useState<string | null>(null);
  const [savingCountry, setSavingCountry] = useState(false);
  const [countrySaveError, setCountrySaveError] = useState<string | null>(null);
  const [countrySaved, setCountrySaved] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setLocalAvatarUrl(avatarUrl);
  }, [avatarUrl]);

  useEffect(() => {
    setOriginalCountry(profile?.core_country_of_residence ?? null);
  }, [profile?.core_country_of_residence]);

  useEffect(() => {
    if (!countries.length) {
      return;
    }

    const currentValue = profile?.core_country_of_residence ?? null;

    if (!currentValue) {
      setSelectedCountry(null);
      return;
    }

    const normalized = currentValue.toLowerCase();
    const match = countries.find(
      (country) =>
        country.name.toLowerCase() === normalized || country.code.toLowerCase() === normalized
    );

    if (match) {
      setSelectedCountry(match);
    } else {
      setSelectedCountry({ name: currentValue, code: currentValue, flag: toFlagEmoji(currentValue) });
    }

    setCountryQuery('');
  }, [countries, profile?.core_country_of_residence]);

  const filteredCountries = useMemo(() => {
    if (!countryQuery.trim()) {
      return countries;
    }

    const normalizedQuery = countryQuery.trim().toLowerCase();
    return countries.filter(
      (country) =>
        country.name.toLowerCase().includes(normalizedQuery) ||
        country.code.toLowerCase().includes(normalizedQuery)
    );
  }, [countries, countryQuery]);

  const isCountryDirty = (selectedCountry?.name ?? null) !== (originalCountry ?? null);

  const handleCountryChange = (country: CountryOption | null) => {
    setSelectedCountry(country);
    setCountrySaved(false);
    setCountrySaveError(null);
    setCountryQuery('');
  };

  const handleSaveCountry = async () => {
    if (!user) {
      setCountrySaveError(
        t('profile.errors.mustBeSignedIn', {
          defaultValue: 'Sign in to update your profile.',
        })
      );
      return;
    }

    if (!selectedCountry) {
      setCountrySaveError(
        t('profile.errors.countrySelectRequired', {
          defaultValue: 'Please choose your home country.',
        })
      );
      return;
    }

    if (!isCountryDirty) {
      return;
    }

    try {
      setSavingCountry(true);
      setCountrySaveError(null);
      setCountrySaved(false);

      const { error: updateError } = await updateRecord<Profile>(
        'profiles',
        { core_country_of_residence: selectedCountry.name },
        {
          match: { user_id: user.id },
        }
      );

      if (updateError) {
        if (
          updateError.message &&
          updateError.message.toLowerCase().includes('row-level security')
        ) {
          throw new Error('country_update_forbidden');
        }
        throw updateError;
      }

      setOriginalCountry(selectedCountry.name);
      setCountrySaved(true);
      await refresh();
    } catch (saveError) {
      const message =
        saveError instanceof Error
          ? saveError.message === 'country_update_forbidden'
            ? t('profile.errors.countrySaveForbidden', {
                defaultValue:
                  'Unable to save due to security rules. Please contact your administrator.',
              })
            : saveError.message
          : t('profile.errors.countrySaveFailed', {
              defaultValue: 'We could not save your selected country.',
            });
      setCountrySaveError(message);
    } finally {
      setSavingCountry(false);
    }
  };

  const handleRefreshProfile = async () => {
    try {
      setRefreshing(true);
      setCountrySaveError(null);
      setCountrySaved(false);
      await refresh();
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    const loadCountries = async () => {
      try {
        setCountriesLoading(true);
        setCountriesError(null);
        const response = await fetch(
          'https://restcountries.com/v3.1/all?fields=name,cca2',
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(`Failed to load countries: ${response.status}`);
        }

        const rawCountries: { name: { common: string }; cca2: string }[] = await response.json();
        const options = rawCountries
          .map((country) => ({
            name: country.name.common,
            code: country.cca2,
            flag: toFlagEmoji(country.cca2),
          }))
          .filter((option) => option.name)
          .sort((a, b) => a.name.localeCompare(b.name));

        setCountries(options);
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

  const handleTriggerUpload = () => {
    setAvatarError(null);
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setAvatarError(t('profile.errors.avatarInvalidType', { defaultValue: 'Please select an image file.' }));
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
      setUploading(true);
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
          : t('profile.errors.avatarUploadFailed', { defaultValue: 'Could not upload profile picture.' });
      setAvatarError(message);
    } finally {
      setUploading(false);
      // reset input so same file can be re-selected
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const formatValue = useCallback(
    (value: unknown) => {
      if (value === null || value === undefined) {
        return t('profile.fallback.notSet');
      }

      if (Array.isArray(value)) {
        return value.length ? value.join(', ') : t('profile.fallback.notSet');
      }

      if (typeof value === 'string') {
        return value.trim().length > 0 ? value : t('profile.fallback.notSet');
      }

      return String(value);
    },
    [t]
  );

  const resolvedName = useMemo(() => {
    const firstName = profile?.user_firstname ?? (user?.user_metadata?.first_name as string | undefined);
    const lastName = profile?.user_lastname ?? (user?.user_metadata?.last_name as string | undefined);

    const combinedName = [firstName, lastName]
      .map((value) => (typeof value === 'string' ? value.trim() : ''))
      .filter(Boolean)
      .join(' ');

    if (combinedName.length > 0) {
      return combinedName;
    }

    const metadataDisplayName = (user?.user_metadata?.display_name as string | undefined)?.trim();
    if (metadataDisplayName) {
      return metadataDisplayName;
    }

    if (displayName && displayName.trim().length > 0) {
      return displayName;
    }

    return user?.email ?? t('profile.fallback.notSet');
  }, [
    displayName,
    profile?.user_firstname,
    profile?.user_lastname,
    t,
    user?.email,
    user?.user_metadata,
  ]);

  const sections = useMemo(
    () => [
      {
        title: t('profile.sections.details'),
        fields: [
          { label: t('profile.fields.email'), value: user?.email ?? null },
          {
            label: t('profile.fields.authMethod', { defaultValue: 'Authentication method' }),
            value:
              authMethod === 'email'
                ? t('profile.fields.authMethodPassword', { defaultValue: 'Email & password' })
                : t('profile.fields.authMethodProvider', {
                    provider: authMethod,
                    defaultValue: authMethod.charAt(0).toUpperCase() + authMethod.slice(1),
                  }),
          },
        ],
      },
      {
        title: t('profile.sections.core'),
        fields: [
          {
            id: 'country',
            label: t('profile.fields.country'),
            value: selectedCountry?.name ?? profile?.core_country_of_residence ?? null,
          },
          { label: t('profile.fields.languages'), value: profile?.core_languages },
        ],
      },
      {
        title: t('profile.sections.travel'),
        fields: [
          { label: t('profile.fields.travelFrequency'), value: profile?.travel_frequency_per_year },
          { label: t('profile.fields.tripDuration'), value: profile?.travel_avg_trip_duration_days },
          { label: t('profile.fields.countriesVisited'), value: profile?.travel_countries_visited_count },
          { label: t('profile.fields.regionsVisited'), value: profile?.travel_regions_often_visited },
          { label: t('profile.fields.travelStyles'), value: profile?.travel_usual_travel_styles },
          { label: t('profile.fields.travelSeasonality'), value: profile?.travel_seasonality_preference },
        ],
      },
      {
        title: t('profile.sections.transport'),
        fields: [
          { label: t('profile.fields.transportModes'), value: profile?.transport_usual_transport_modes },
          { label: t('profile.fields.luggageTypes'), value: profile?.transport_preferred_luggage_types },
        ],
      },
      {
        title: t('profile.sections.accommodation'),
        fields: [
          { label: t('profile.fields.accommodationTypes'), value: profile?.accommodation_common_types },
          { label: t('profile.fields.laundryAccess'), value: profile?.accommodation_laundry_access_expectation },
          { label: t('profile.fields.workspaceNeeded'), value: profile?.accommodation_workspace_needed },
        ],
      },
      {
        title: t('profile.sections.activities'),
        fields: [
          { label: t('profile.fields.activitiesSports'), value: profile?.activity_sports_outdoor },
          { label: t('profile.fields.activitiesAdventure'), value: profile?.activity_adventure_activities },
          { label: t('profile.fields.activitiesCultural'), value: profile?.activity_cultural_activities },
        ],
      },
      {
        title: t('profile.sections.sustainability'),
        fields: [
          { label: t('profile.fields.sustainabilityFocus'), value: profile?.sustainability_focus },
          { label: t('profile.fields.sustainabilityWeight'), value: profile?.sustainability_weight_priority },
        ],
      },
      {
        title: t('profile.sections.budget'),
        fields: [
          { label: t('profile.fields.budgetLevel'), value: profile?.budget_level },
          { label: t('profile.fields.buyAtDestination'), value: profile?.budget_buy_at_destination_preference },
          { label: t('profile.fields.souvenirSpace'), value: profile?.budget_souvenir_space_preference },
        ],
      },
    ],
    [authMethod, profile, selectedCountry, t, user?.email]
  );

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              {localAvatarUrl ? (
                <img
                  src={localAvatarUrl}
                  alt={resolvedName}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-xl font-semibold text-slate-600 dark:text-slate-200">
                  {avatarInitials}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-semibold">{resolvedName}</h1>
              <p className="text-sm text-[var(--text-secondary)]">{t('profile.subheading')}</p>
              <p className="text-xs font-medium text-[var(--text-secondary)]">
                {[profile?.user_firstname ?? (user?.user_metadata?.first_name as string | undefined), profile?.user_lastname ?? (user?.user_metadata?.last_name as string | undefined)]
                  .map((value) => (typeof value === 'string' ? value.trim() : ''))
                  .filter(Boolean)
                  .join(' ') || t('profile.fallback.notSet')}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:items-end sm:justify-end">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
              <button
                type="button"
                onClick={handleTriggerUpload}
                className="w-max rounded-full border border-dashed border-slate-300 px-4 py-2 text-xs font-semibold text-slate-500 transition hover:border-brand-secondary hover:text-brand-secondary disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:text-slate-300 dark:hover:border-brand-primary dark:hover:text-brand-primary"
                disabled={uploading}
              >
                {uploading
                  ? t('profile.actions.updateAvatarUploading', { defaultValue: 'Uploading…' })
                  : t('profile.actions.updateAvatar', { defaultValue: 'Change photo' })}
              </button>
              <button
                type="button"
                onClick={handleSaveCountry}
                className="flex w-max items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-brand-secondary hover:text-brand-secondary disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:text-slate-200 dark:hover:border-brand-primary dark:hover:text-brand-primary"
                disabled={
                  !selectedCountry ||
                  !isCountryDirty ||
                  savingCountry ||
                  !!countriesError ||
                  countriesLoading
                }
              >
                {savingCountry
                  ? t('profile.actions.saving', { defaultValue: 'Saving…' })
                  : t('profile.actions.save', { defaultValue: 'Save changes' })}
              </button>
              <button
                type="button"
                onClick={handleRefreshProfile}
                className="flex w-max items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-brand-secondary hover:text-brand-secondary disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:text-slate-200 dark:hover:border-brand-primary dark:hover:text-brand-primary"
                disabled={loading || refreshing}
              >
                <ArrowPathIcon
                  className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
                  aria-hidden="true"
                />
                {refreshing
                  ? t('profile.actions.refreshing', { defaultValue: 'Refreshing…' })
                  : t('profile.actions.refresh', { defaultValue: 'Refresh' })}
              </button>
            </div>

            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
              {avatarError && (
                <p className="text-xs text-red-600 dark:text-red-400">{avatarError}</p>
              )}
              {countrySaveError && (
                <p className="text-xs text-red-600 dark:text-red-400">{countrySaveError}</p>
              )}
              {!countrySaveError && countrySaved && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  {t('profile.state.settingsSaved', { defaultValue: 'Your settings have been saved.' })}
                </p>
              )}
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelected}
          />
        </div>
      </header>

      {loading ? (
        <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/60 p-6 shadow dark:border-slate-800/60 dark:bg-slate-900/60">
          <p className="text-sm font-medium text-[var(--text-secondary)]">
            {t('profile.state.loading')}
          </p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
          {t('profile.state.error')}
        </div>
      ) : profile ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {sections.map((section) => (
            <article
              key={section.title}
              className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/60 p-6 shadow dark:border-slate-800/60 dark:bg-slate-900/60"
            >
              <h2 className="text-lg font-semibold">{section.title}</h2>
              <dl className="grid gap-4 sm:grid-cols-2">
                {section.fields.map((field) => {
                  const { label, value } = field;
                  const isCountryField = 'id' in field && field.id === 'country';

                  return (
                    <div key={label} className="flex flex-col gap-1">
                      <dt className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                        {label}
                      </dt>
                      <dd className="text-sm font-medium text-[var(--text-primary)]">
                        {isCountryField ? (
                          <div className="flex flex-col gap-2">
                            {countriesError && (
                              <p className="text-xs text-red-600 dark:text-red-400">
                                {countriesError}
                              </p>
                            )}
                            <Combobox
                              value={selectedCountry}
                              onChange={handleCountryChange}
                              disabled={countriesLoading || savingCountry || !!countriesError}
                            >
                              <div className="relative">
                                <div className="relative w-full cursor-default overflow-hidden rounded-md border border-slate-300 bg-white text-left shadow-sm focus-within:border-brand-secondary focus-within:ring-1 focus-within:ring-brand-secondary dark:border-slate-600 dark:bg-slate-900">
                                  <Combobox.Input
                                    className="w-full border-none bg-transparent py-2 pl-3 pr-10 text-sm text-slate-700 focus:outline-none dark:text-slate-100"
                                    displayValue={(country: CountryOption | null) => {
                                      if (!country) {
                                        return '';
                                      }
                                      const parts = [country.flag, country.name].filter(
                                        (part) => part && part.trim().length > 0
                                      );
                                      return parts.join(' ');
                                    }}
                                    onChange={(event) => setCountryQuery(event.target.value)}
                                    placeholder={
                                      countriesLoading
                                        ? t('profile.state.countriesLoading', {
                                            defaultValue: 'Loading countries…',
                                          })
                                        : t('profile.actions.selectCountry', {
                                            defaultValue: 'Select your country',
                                          })
                                    }
                                  />
                                  <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
                                    <ChevronUpDownIcon className="h-5 w-5" aria-hidden="true" />
                                  </Combobox.Button>
                                </div>
                                <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-slate-200 bg-white py-1 text-sm shadow-lg focus:outline-none dark:border-slate-700 dark:bg-slate-800">
                                  {countriesError ? (
                                    <div className="cursor-default px-3 py-2 text-xs text-red-600 dark:text-red-400">
                                      {countriesError}
                                    </div>
                                  ) : filteredCountries.length === 0 ? (
                                    <div className="cursor-default px-3 py-2 text-xs text-[var(--text-secondary)]">
                                      {countriesLoading
                                        ? t('profile.state.countriesLoading', {
                                            defaultValue: 'Loading countries…',
                                          })
                                        : t('profile.state.noCountriesFound', {
                                            defaultValue: 'No countries match your search.',
                                          })}
                                    </div>
                                  ) : (
                                    filteredCountries.map((country) => (
                                      <Combobox.Option
                                        key={`${country.code}-${country.name}`}
                                        value={country}
                                        className={({ active }) =>
                                          `cursor-pointer px-3 py-2 ${
                                            active
                                              ? 'bg-brand-secondary/10 text-brand-secondary dark:bg-brand-primary/20 dark:text-brand-primary'
                                              : 'text-slate-700 dark:text-slate-100'
                                          }`
                                        }
                                      >
                                        {({ selected }) => (
                                          <div className="flex items-center gap-2">
                                            {country.flag ? (
                                              <span className="text-lg" aria-hidden="true">
                                                {country.flag}
                                              </span>
                                            ) : null}
                                            <span
                                              className={`text-sm ${
                                                selected ? 'font-semibold' : 'font-medium'
                                              }`}
                                            >
                                              {country.name}
                                            </span>
                                          </div>
                                        )}
                                      </Combobox.Option>
                                    ))
                                  )}
                                </Combobox.Options>
                              </div>
                            </Combobox>
                        </div>
                      ) : (
                        formatValue(value)
                      )}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </article>
          ))}
          <article className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/40 p-6 shadow dark:border-slate-800/60 dark:bg-slate-900/60">
            <h2 className="text-lg font-semibold">{t('profile.sections.meta')}</h2>
            <dl className="grid gap-4">
              <div className="flex flex-col gap-1">
                <dt className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                  {t('profile.fields.createdAt')}
                </dt>
                <dd className="text-sm font-medium text-[var(--text-primary)]">
                  {profile.created_at
                    ? new Date(profile.created_at).toLocaleString()
                    : t('profile.fallback.notAvailable')}
                </dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                  {t('profile.fields.updatedAt')}
                </dt>
                <dd className="text-sm font-medium text-[var(--text-primary)]">
                  {profile.updated_at
                    ? new Date(profile.updated_at).toLocaleString()
                    : t('profile.fallback.notAvailable')}
                </dd>
              </div>
            </dl>
          </article>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/60 p-6 text-sm text-[var(--text-secondary)] shadow dark:border-slate-800/60 dark:bg-slate-900/60">
          {t('profile.state.empty')}
        </div>
      )}
    </section>
  );
};

export default ProfilePage;
