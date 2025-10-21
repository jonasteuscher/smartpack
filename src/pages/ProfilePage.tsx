import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Combobox } from '@headlessui/react';
import { ArrowPathIcon, ChevronUpDownIcon, InformationCircleIcon } from '@heroicons/react/20/solid';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { removeProfileAvatar, uploadProfileAvatar } from '../services/profileAvatar';
import { updateRecord } from '../services/supabaseCrud';
import type { Profile } from '../types/profile';

interface CountryOption {
  name: string;
  code: string;
  flag: string;
}

interface LanguageOption {
  code: string;
  name: string;
}

interface DetailSectionField {
  label: string;
  value: unknown;
  id?: string;
}

interface DetailSection {
  id: string;
  title: string;
  fields: DetailSectionField[];
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

const ProfilePage = () => {
  const { t, i18n } = useTranslation('dashboard');
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
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [removingAvatar, setRemovingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [refreshing, setRefreshing] = useState(false);

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
  const [languageToAdd, setLanguageToAdd] = useState('');

  const [isEditingCore, setIsEditingCore] = useState(false);
  const [savingCore, setSavingCore] = useState(false);
  const [coreSaveError, setCoreSaveError] = useState<string | null>(null);
  const [coreSaved, setCoreSaved] = useState(false);

  const [isEditingTravel, setIsEditingTravel] = useState(false);
  const [savingTravel, setSavingTravel] = useState(false);
  const [travelSaveError, setTravelSaveError] = useState<string | null>(null);
  const [travelSaved, setTravelSaved] = useState(false);
  const [travelFrequency, setTravelFrequency] = useState<string | null>(null);
  const [originalTravelFrequency, setOriginalTravelFrequency] = useState<string | null>(null);

  useEffect(() => {
    setLocalAvatarUrl(avatarUrl);
  }, [avatarUrl]);

  useEffect(() => {
    const sanitizedFirst =
      typeof profile?.user_firstname === 'string' ? profile.user_firstname.trim() : '';
    const sanitizedLast =
      typeof profile?.user_lastname === 'string' ? profile.user_lastname.trim() : '';

    setOriginalFirstName(sanitizedFirst);
    setOriginalLastName(sanitizedLast);

    if (!isEditingCore) {
      setCoreFirstName(sanitizedFirst);
      setCoreLastName(sanitizedLast);
    }
  }, [profile?.user_firstname, profile?.user_lastname, isEditingCore]);

  useEffect(() => {
    const normalized = Array.isArray(profile?.core_languages)
      ? normalizeLanguages(profile.core_languages as string[])
      : [];

    setOriginalLanguages(normalized);

    if (!isEditingCore) {
      setCoreLanguages(normalized);
      setLanguageToAdd('');
    }
  }, [profile?.core_languages, isEditingCore]);

  useEffect(() => {
    const rawFrequency =
      typeof profile?.travel_frequency_per_year === 'string'
        ? profile.travel_frequency_per_year.trim()
        : null;

    const sanitizedFrequency = rawFrequency && rawFrequency.length > 0 ? rawFrequency : null;

    setOriginalTravelFrequency(sanitizedFrequency);

    if (!isEditingTravel) {
      setTravelFrequency(sanitizedFrequency);
    }
  }, [profile?.travel_frequency_per_year, isEditingTravel]);

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
    const currentValue = typeof profile?.core_country_of_residence === 'string'
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
    const chosen = new Set(coreLanguages.map((code) => code.toLowerCase()));
    return LANGUAGE_OPTIONS.filter((language) => !chosen.has(language.code.toLowerCase())).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [coreLanguages]);

  const travelFrequencyOptions = useMemo(
    () => [
      {
        value: 'rarely',
        label: t('profile.travelFrequency.rarely', {
          defaultValue: 'Rarely (1-2 trips)',
        }),
      },
      {
        value: 'sometimes',
        label: t('profile.travelFrequency.sometimes', {
          defaultValue: 'Sometimes (3-5 trips)',
        }),
      },
      {
        value: 'often',
        label: t('profile.travelFrequency.often', {
          defaultValue: 'Often (6-10 trips)',
        }),
      },
      {
        value: 'frequent',
        label: t('profile.travelFrequency.frequent', {
          defaultValue: 'Very often (10+ trips)',
        }),
      },
    ],
    [t]
  );

  const travelFrequencyLabelByValue = useMemo(() => {
    const map = new Map<string, string>();
    travelFrequencyOptions.forEach((option) => {
      map.set(option.value, option.label);
    });
    return map;
  }, [travelFrequencyOptions]);

  const travelFrequencyProfileLabel = useMemo(() => {
    if (typeof profile?.travel_frequency_per_year !== 'string') {
      return null;
    }

    const trimmed = profile.travel_frequency_per_year.trim();
    if (trimmed.length === 0) {
      return null;
    }

    return travelFrequencyLabelByValue.get(trimmed) ?? null;
  }, [profile?.travel_frequency_per_year, travelFrequencyLabelByValue]);

  const trimmedFirstName = coreFirstName.trim();
  const trimmedLastName = coreLastName.trim();
  const normalizedSelectedCountry = selectedCountry?.name ?? null;

  const normalizedTravelFrequency = travelFrequency ?? null;
  const isTravelDirty = normalizedTravelFrequency !== (originalTravelFrequency ?? null);
  const travelFrequencyDisplayLabel = normalizedTravelFrequency
    ? travelFrequencyLabelByValue.get(normalizedTravelFrequency) ?? normalizedTravelFrequency
    : null;

  const isFirstNameDirty = trimmedFirstName !== originalFirstName;
  const isLastNameDirty = trimmedLastName !== originalLastName;
  const isCountryDirty = normalizedSelectedCountry !== (originalCountry ?? null);
  const isLanguagesDirty = !languagesEqual(coreLanguages, originalLanguages);

  const isCoreDirty = isFirstNameDirty || isLastNameDirty || isCountryDirty || isLanguagesDirty;

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

  const memberSince = useMemo(() => {
    if (!profile?.created_at) {
      return null;
    }

    const parsedDate = new Date(profile.created_at);
    if (Number.isNaN(parsedDate.getTime())) {
      return null;
    }

    try {
      return new Intl.DateTimeFormat(i18n.language ?? 'en', {
        month: 'long',
        year: 'numeric',
      }).format(parsedDate);
    } catch {
      return parsedDate.toLocaleDateString(undefined, {
        month: 'long',
        year: 'numeric',
      });
    }
  }, [i18n.language, profile?.created_at]);

  const lastUpdated = useMemo(() => {
    if (!profile?.updated_at) {
      return null;
    }

    const parsedDate = new Date(profile.updated_at);
    if (Number.isNaN(parsedDate.getTime())) {
      return null;
    }

    try {
      const monthFormatter = new Intl.DateTimeFormat(i18n.language ?? 'en', { month: 'long' });
      const month = monthFormatter.format(parsedDate);
      const day = parsedDate.getDate();
      const year = parsedDate.getFullYear();
      return `${day} ${month} ${year}`;
    } catch {
      const fallbackMonth = parsedDate.toLocaleString(undefined, { month: 'long' });
      return `${parsedDate.getDate()} ${fallbackMonth} ${parsedDate.getFullYear()}`;
    }
  }, [i18n.language, profile?.updated_at]);

  const secondarySections = useMemo<DetailSection[]>(
    () => [
      {
        id: 'travel',
        title: t('profile.sections.travel'),
        fields: [
          {
            id: 'travel_frequency_per_year',
            label: t('profile.fields.travelFrequency'),
            value: profile?.travel_frequency_per_year,
          },
          { label: t('profile.fields.tripDuration'), value: profile?.travel_avg_trip_duration_days },
          { label: t('profile.fields.countriesVisited'), value: profile?.travel_countries_visited_count },
          { label: t('profile.fields.regionsVisited'), value: profile?.travel_regions_often_visited },
          { label: t('profile.fields.travelStyles'), value: profile?.travel_usual_travel_styles },
          { label: t('profile.fields.travelSeasonality'), value: profile?.travel_seasonality_preference },
        ],
      },
      {
        id: 'transport',
        title: t('profile.sections.transport'),
        fields: [
          { label: t('profile.fields.transportModes'), value: profile?.transport_usual_transport_modes },
          { label: t('profile.fields.luggageTypes'), value: profile?.transport_preferred_luggage_types },
        ],
      },
      {
        id: 'accommodation',
        title: t('profile.sections.accommodation'),
        fields: [
          { label: t('profile.fields.accommodationTypes'), value: profile?.accommodation_common_types },
          { label: t('profile.fields.laundryAccess'), value: profile?.accommodation_laundry_access_expectation },
          { label: t('profile.fields.workspaceNeeded'), value: profile?.accommodation_workspace_needed },
        ],
      },
      {
        id: 'activities',
        title: t('profile.sections.activities'),
        fields: [
          { label: t('profile.fields.activitiesSports'), value: profile?.activity_sports_outdoor },
          { label: t('profile.fields.activitiesAdventure'), value: profile?.activity_adventure_activities },
          { label: t('profile.fields.activitiesCultural'), value: profile?.activity_cultural_activities },
        ],
      },
      {
        id: 'sustainability',
        title: t('profile.sections.sustainability'),
        fields: [
          { label: t('profile.fields.sustainabilityFocus'), value: profile?.sustainability_focus },
          { label: t('profile.fields.sustainabilityWeight'), value: profile?.sustainability_weight_priority },
        ],
      },
      {
        id: 'budget',
        title: t('profile.sections.budget'),
        fields: [
          { label: t('profile.fields.budgetLevel'), value: profile?.budget_level },
          { label: t('profile.fields.buyAtDestination'), value: profile?.budget_buy_at_destination_preference },
          { label: t('profile.fields.souvenirSpace'), value: profile?.budget_souvenir_space_preference },
        ],
      },
    ],
    [profile, t]
  );

  const emailValue = user?.email ?? t('profile.fallback.notSet');
  const isGoogleSignIn = authMethod === 'google';
  const canManageAvatar = !isGoogleSignIn;
  const countryDisplayOption = useMemo(() => {
    if (!normalizedSelectedCountry) {
      return null;
    }

    if (!selectedCountry) {
      return resolveCountryOption(normalizedSelectedCountry);
    }

    return selectedCountry;
  }, [normalizedSelectedCountry, resolveCountryOption, selectedCountry]);
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
              defaultValue: 'We couldn’t remove your profile picture. Try again.',
            });
      setAvatarError(message);
    } finally {
      setRemovingAvatar(false);
    }
  };

  const handleAddLanguage = () => {
    if (!languageToAdd) {
      return;
    }

    const normalized = languageToAdd.toLowerCase();
    if (coreLanguages.includes(normalized)) {
      setLanguageToAdd('');
      return;
    }

    setCoreLanguages((prev) => normalizeLanguages([...prev, normalized]));
    setLanguageToAdd('');
    setCoreSaved(false);
    setCoreSaveError(null);
  };

  const handleRemoveLanguage = (code: string) => {
    const normalized = code.toLowerCase();
    setCoreLanguages((prev) => normalizeLanguages(prev.filter((item) => item !== normalized)));
    setCoreSaved(false);
    setCoreSaveError(null);
  };

  const handleStartEditingCore = () => {
    setIsEditingCore(true);
    setCoreSaved(false);
    setCoreSaveError(null);
    setCoreFirstName(originalFirstName);
    setCoreLastName(originalLastName);
    setCoreLanguages(originalLanguages);
    setSelectedCountry(resolveCountryOption(originalCountry));
    setCountryQuery('');
    setLanguageToAdd('');
  };

  const handleCancelEditingCore = () => {
    setIsEditingCore(false);
    setCoreSaved(false);
    setCoreSaveError(null);
    setCoreFirstName(originalFirstName);
    setCoreLastName(originalLastName);
    setCoreLanguages(originalLanguages);
    setSelectedCountry(resolveCountryOption(originalCountry));
    setCountryQuery('');
    setLanguageToAdd('');
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

      await refresh();
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

  const handleStartEditingTravel = () => {
    setIsEditingTravel(true);
    setTravelSaved(false);
    setTravelSaveError(null);
    setTravelFrequency(originalTravelFrequency);
  };

  const handleCancelEditingTravel = () => {
    setIsEditingTravel(false);
    setTravelSaved(false);
    setTravelSaveError(null);
    setTravelFrequency(originalTravelFrequency);
  };

  const handleSaveTravel = async () => {
    if (!user?.id) {
      setTravelSaveError(
        t('profile.errors.mustBeSignedIn', {
          defaultValue: 'Sign in to update your profile.',
        })
      );
      return;
    }

    if (!isTravelDirty) {
      setIsEditingTravel(false);
      return;
    }

    try {
      setSavingTravel(true);
      setTravelSaveError(null);

      const payload: Partial<Profile> = {
        travel_frequency_per_year: normalizedTravelFrequency,
      };

      const { error: updateError } = await updateRecord<Profile>('profiles', payload, {
        match: { user_id: user.id },
      });

      if (updateError) {
        throw updateError;
      }

      await refresh();
      setIsEditingTravel(false);
      setTravelSaved(true);
      setOriginalTravelFrequency(normalizedTravelFrequency);
    } catch (saveError) {
      console.error('Failed to save travel frequency', saveError);
      setTravelSaveError(
        saveError instanceof Error
          ? saveError.message
          : t('profile.errors.travelSaveFailed', {
              defaultValue: 'We couldn’t save your travel preferences. Try again.',
            })
      );
    } finally {
      setSavingTravel(false);
    }
  };

  const handleRefreshProfile = async () => {
    try {
      setRefreshing(true);
      setCoreSaved(false);
      setCoreSaveError(null);
      setAvatarError(null);
      setTravelSaved(false);
      setTravelSaveError(null);
      await refresh();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <section className="flex flex-col gap-6">
      <header className="rounded-2xl border border-white/10 bg-white/70 p-6 shadow dark:border-slate-800/70 dark:bg-slate-900/70">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col items-center gap-4 lg:w-72">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white shadow dark:border-slate-700 dark:bg-slate-800">
              {localAvatarUrl ? (
                <img
                  src={localAvatarUrl}
                  alt={resolvedName}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-2xl font-semibold text-slate-600 dark:text-slate-200">
                  {avatarInitials}
                </span>
              )}
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <h1 className="text-3xl font-semibold">{resolvedName}</h1>
              {memberSince ? (
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {t('profile.memberSince', {
                    defaultValue: 'Member since {{date}}',
                    date: memberSince,
                  })}
                </p>
              ) : null}
            </div>
            {canManageAvatar ? (
              <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={handleTriggerUpload}
                  className="flex-1 rounded-full border border-dashed border-slate-300 px-4 py-2 text-xs font-semibold text-slate-500 transition hover:border-brand-secondary hover:text-brand-secondary disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:text-slate-300 dark:hover:border-brand-primary dark:hover:text-brand-primary"
                  disabled={uploadingAvatar || removingAvatar}
                >
                  {uploadingAvatar
                    ? t('profile.actions.updateAvatarUploading', { defaultValue: 'Uploading…' })
                    : t('profile.actions.updateAvatar', { defaultValue: 'Change photo' })}
                </button>
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="flex-1 rounded-full border border-red-300 px-4 py-2 text-xs font-semibold text-red-500 transition hover:border-red-400 hover:bg-red-500/10 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-500/80 dark:text-red-300 dark:hover:border-red-400"
                  disabled={removingAvatar || uploadingAvatar || !localAvatarUrl}
                >
                  {removingAvatar
                    ? t('profile.actions.removeAvatarRemoving', { defaultValue: 'Removing…' })
                    : t('profile.actions.removeAvatar', { defaultValue: 'Remove photo' })}
                </button>
              </div>
            ) : null}
            {avatarError ? (
              <p className="text-xs text-red-500">{avatarError}</p>
            ) : null}
          </div>

          <div className="flex flex-1 flex-col gap-4">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
                <h2 className="text-3xl font-semibold">
                  {t('profile.sections.details', { defaultValue: 'Profile' })}
                </h2>
                <div className="flex flex-col items-start gap-1 text-left sm:flex-row sm:items-center sm:gap-3">
                  <button
                    type="button"
                    onClick={handleRefreshProfile}
                    className="flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-brand-secondary hover:text-brand-secondary disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:text-slate-200 dark:hover:border-brand-primary dark:hover:text-brand-primary"
                    disabled={refreshing || loading || isEditingCore}
                  >
                    <ArrowPathIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
                    {refreshing
                      ? t('profile.actions.refreshing', { defaultValue: 'Refreshing…' })
                      : t('profile.actions.refresh', { defaultValue: 'Refresh' })}
                  </button>
                  {lastUpdated ? (
                    <span className="text-xs text-[var(--text-secondary)] dark:text-slate-300">
                      {t('profile.lastUpdated', {
                        defaultValue: 'Last updated {{date}}',
                        date: lastUpdated,
                      })}
                    </span>
                  ) : null}
                </div>
              </div>
              <p className="text-s text-[var(--text-secondary)]">
                {t('profile.subheading', {
                  defaultValue: 'View and update your personal information.',
                })}
              </p>
              <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-slate-700/70 dark:bg-slate-800/70">
                <InformationCircleIcon
                  className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-secondary dark:text-brand-primary"
                  aria-hidden="true"
                />
                <p className="text-xs leading-relaxed text-[var(--text-secondary)] dark:text-slate-200">
                  {t('profile.description', {
                    defaultValue:
                      'The more you tell us about yourself, the better we can tailor your packing lists to you and your trips. That way you get suggestions that truly match your style, your activities, and your destination.',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />
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
            {coreSaveError ? (
              <p className="text-xs text-red-500">{coreSaveError}</p>
            ) : null}
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
                      onChange={(event) => {
                        setCoreFirstName(event.target.value);
                        setCoreSaved(false);
                      }}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    />
                  ) : (
                    formatValue(profile?.user_firstname)
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
                      onChange={(event) => {
                        setCoreLastName(event.target.value);
                        setCoreSaved(false);
                      }}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    />
                  ) : (
                    formatValue(profile?.user_lastname)
                  )}
                </dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                  {t('profile.fields.country')}
                </dt>
                <dd className="text-sm font-medium text-[var(--text-primary)]">
                  {isEditingCore ? (
                    <div className="flex flex-col gap-2">
                      {countriesError ? (
                        <p className="text-xs text-red-500">{countriesError}</p>
                      ) : null}
                      <div className="relative max-w-xs">
                        <Combobox
                          value={selectedCountry}
                          onChange={(country: CountryOption | null) => {
                            setSelectedCountry(country);
                            setCoreSaved(false);
                            setCoreSaveError(null);
                          }}
                          disabled={countriesLoading || !!countriesError}
                        >
                          <div className="relative">
                            <Combobox.Input
                              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                              displayValue={(country: CountryOption | null) => country?.name ?? ''}
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
                                  <span className="flex-1 text-left">{country.name}</span>
                                </Combobox.Option>
                              ))
                            )}
                          </Combobox.Options>
                        </Combobox>
                      </div>
                    </div>
                  ) : normalizedSelectedCountry ? (
                    <span className="flex items-center gap-2">
                      {countryDisplayOption?.flag ? (
                        <span className="text-lg leading-none">{countryDisplayOption.flag}</span>
                      ) : null}
                      <span>{normalizedSelectedCountry}</span>
                    </span>
                  ) : (
                    t('profile.fallback.notSet')
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
                  ) : originalLanguages.length === 0 ? (
                    <span className="text-xs text-[var(--text-secondary)]">
                      {t('profile.fallback.notSet')}
                    </span>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {originalLanguages.map((code) => (
                        <span
                          key={code}
                          className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold uppercase text-slate-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                        >
                          {code.toUpperCase()}
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

          {secondarySections.map((section) => (
            <article
              key={section.id}
              className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/60 p-6 shadow dark:border-slate-800/60 dark:bg-slate-900/60"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="text-lg font-semibold">{section.title}</h2>
                {section.id === 'travel' ? (
                  isEditingTravel ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCancelEditingTravel}
                        className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-brand-secondary hover:text-brand-secondary disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:text-slate-200 dark:hover:border-brand-primary dark:hover:text-brand-primary"
                        disabled={savingTravel}
                      >
                        {t('profile.actions.cancel', { defaultValue: 'Cancel' })}
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveTravel}
                        className="rounded-full border border-brand-secondary bg-brand-secondary px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-secondary/90 disabled:cursor-not-allowed disabled:opacity-60 dark:border-brand-secondary"
                        disabled={savingTravel}
                      >
                        {savingTravel
                          ? t('profile.actions.saving', { defaultValue: 'Saving…' })
                          : t('profile.actions.save', { defaultValue: 'Save' })}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStartEditingTravel}
                      className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-brand-secondary hover:text-brand-secondary disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:text-slate-200 dark:hover:border-brand-primary dark:hover:text-brand-primary"
                      disabled={savingTravel}
                    >
                      {t('profile.actions.edit', { defaultValue: 'Edit' })}
                    </button>
                  )
                ) : null}
              </div>
              {section.id === 'travel' ? (
                <>
                  {travelSaveError ? (
                    <p className="text-xs text-red-500">{travelSaveError}</p>
                  ) : null}
                  {!travelSaveError && travelSaved ? (
                    <p className="text-xs text-emerald-600">
                      {t('profile.state.settingsSaved', { defaultValue: 'Your settings have been saved.' })}
                    </p>
                  ) : null}
                </>
              ) : null}
              <dl className="grid gap-4 sm:grid-cols-2">
                {section.fields.map((field) => (
                  <div key={field.label} className="flex flex-col gap-1">
                    <dt className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                      {field.label}
                    </dt>
                    <dd className="text-sm font-medium text-[var(--text-primary)]">
                      {section.id === 'travel' && field.id === 'travel_frequency_per_year' ? (
                        isEditingTravel ? (
                          <select
                            value={travelFrequency ?? ''}
                            onChange={(event) => {
                              const nextValue = event.target.value;
                              setTravelFrequency(nextValue.length > 0 ? nextValue : null);
                              setTravelSaved(false);
                              setTravelSaveError(null);
                            }}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                            disabled={savingTravel}
                          >
                            <option value="">
                              {t('profile.actions.selectTravelFrequency', {
                                defaultValue: 'Select your travel frequency',
                              })}
                            </option>
                            {travelFrequencyOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          travelFrequencyDisplayLabel ??
                          travelFrequencyProfileLabel ??
                          t('profile.fallback.notSet')
                        )
                      ) : (
                        formatValue(field.value)
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
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
