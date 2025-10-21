import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Combobox } from '@headlessui/react';
import { ArrowPathIcon, ChevronUpDownIcon, InformationCircleIcon } from '@heroicons/react/20/solid';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { removeProfileAvatar, uploadProfileAvatar } from '../services/profileAvatar';
import { updateRecord } from '../services/supabaseCrud';
import type { Profile, TravelFrequencyPerYear, TravelTripDurationDays } from '../types/profile';

interface CountryOption {
  name: string;
  code: string;
  flag: string;
}

interface LanguageOption {
  code: string;
  name: string;
}

interface TravelRegionOption {
  value: string;
  translationKey: string;
  defaultLabel: string;
}

interface TravelStyleOption {
  value: string;
  translationKey: string;
  defaultLabel: string;
}

interface TravelSeasonOption {
  value: string;
  translationKey: string;
  defaultLabel: string;
}

interface TransportModeOption {
  value: string;
  translationKey: string;
  defaultLabel: string;
}

interface LuggageOption {
  value: string;
  translationKey: string;
  defaultLabel: string;
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

const TRAVEL_FREQUENCY_VALUES: readonly TravelFrequencyPerYear[] = [
  'rarely',
  'sometimes',
  'often',
  'frequent',
];

const TRAVEL_FREQUENCY_FALLBACK_LABELS: Record<TravelFrequencyPerYear, string> = {
  rarely: 'Rarely (1-2 trips)',
  sometimes: 'Sometimes (3-5 trips)',
  often: 'Often (6-10 trips)',
  frequent: 'Very often (10+ trips)',
};

const isTravelFrequencyValue = (value: unknown): value is TravelFrequencyPerYear =>
  typeof value === 'string' && (TRAVEL_FREQUENCY_VALUES as readonly string[]).includes(value);

const TRAVEL_DURATION_VALUES: readonly TravelTripDurationDays[] = ['short', 'medium', 'long', 'extended'];

const TRAVEL_DURATION_FALLBACK_LABELS: Record<TravelTripDurationDays, string> = {
  short: 'Short (1-3 days)',
  medium: 'Medium (4-7 days)',
  long: 'Long (8-14 days)',
  extended: 'Extended (15+ days)',
};

const isTravelDurationValue = (value: unknown): value is TravelTripDurationDays =>
  typeof value === 'string' && (TRAVEL_DURATION_VALUES as readonly string[]).includes(value);

const TRAVEL_REGION_OPTIONS: readonly TravelRegionOption[] = [
  { value: 'CH', translationKey: 'profile.travelRegions.CH', defaultLabel: 'Switzerland / Domestic' },
  { value: 'EU', translationKey: 'profile.travelRegions.EU', defaultLabel: 'Europe' },
  { value: 'NA', translationKey: 'profile.travelRegions.NA', defaultLabel: 'North America' },
  { value: 'SA', translationKey: 'profile.travelRegions.SA', defaultLabel: 'South America' },
  { value: 'AS', translationKey: 'profile.travelRegions.AS', defaultLabel: 'Asia' },
  { value: 'AF', translationKey: 'profile.travelRegions.AF', defaultLabel: 'Africa' },
  { value: 'OC', translationKey: 'profile.travelRegions.OC', defaultLabel: 'Oceania' },
  { value: 'ME', translationKey: 'profile.travelRegions.ME', defaultLabel: 'Middle East' },
];

const TRAVEL_STYLE_OPTIONS: readonly TravelStyleOption[] = [
  { value: 'citytrip', translationKey: 'profile.travelStyles.citytrip', defaultLabel: 'City trips' },
  { value: 'beach', translationKey: 'profile.travelStyles.beach', defaultLabel: 'Beach holidays' },
  { value: 'outdoor', translationKey: 'profile.travelStyles.outdoor', defaultLabel: 'Adventure & outdoor' },
  { value: 'business', translationKey: 'profile.travelStyles.business', defaultLabel: 'Business travel' },
  { value: 'camping', translationKey: 'profile.travelStyles.camping', defaultLabel: 'Camping / Vanlife' },
  { value: 'luxury', translationKey: 'profile.travelStyles.luxury', defaultLabel: 'Luxury travel' },
  { value: 'backpacking', translationKey: 'profile.travelStyles.backpacking', defaultLabel: 'Backpacking' },
  { value: 'culture', translationKey: 'profile.travelStyles.culture', defaultLabel: 'Culture & sightseeing' },
];

const TRAVEL_SEASON_OPTIONS: readonly TravelSeasonOption[] = [
  { value: 'spring', translationKey: 'profile.travelSeasons.spring', defaultLabel: 'Spring' },
  { value: 'summer', translationKey: 'profile.travelSeasons.summer', defaultLabel: 'Summer' },
  { value: 'autumn', translationKey: 'profile.travelSeasons.autumn', defaultLabel: 'Autumn' },
  { value: 'winter', translationKey: 'profile.travelSeasons.winter', defaultLabel: 'Winter' },
  { value: 'all_year', translationKey: 'profile.travelSeasons.all_year', defaultLabel: 'All year round' },
];

const TRANSPORT_MODE_OPTIONS: readonly TransportModeOption[] = [
  { value: 'plane', translationKey: 'profile.transportModes.plane', defaultLabel: '✈️ Plane' },
  { value: 'train', translationKey: 'profile.transportModes.train', defaultLabel: '🚆 Train' },
  { value: 'car', translationKey: 'profile.transportModes.car', defaultLabel: '🚗 Car' },
  { value: 'bus', translationKey: 'profile.transportModes.bus', defaultLabel: '🚌 Bus' },
  { value: 'camper', translationKey: 'profile.transportModes.camper', defaultLabel: '🚐 Camper / Van' },
  { value: 'bike', translationKey: 'profile.transportModes.bike', defaultLabel: '🚴‍♀️ Bike' },
  { value: 'boat', translationKey: 'profile.transportModes.boat', defaultLabel: '🚢 Boat / Ferry' },
  { value: 'foot', translationKey: 'profile.transportModes.foot', defaultLabel: '🚶 On foot' },
];

const LUGGAGE_OPTIONS: readonly LuggageOption[] = [
  { value: 'carry_on', translationKey: 'profile.luggageTypes.carry_on', defaultLabel: '💼 Carry-on (Trolley / Backpack)' },
  { value: 'checked_suitcase', translationKey: 'profile.luggageTypes.checked_suitcase', defaultLabel: '🧳 Checked suitcase' },
  { value: 'travel_backpack', translationKey: 'profile.luggageTypes.travel_backpack', defaultLabel: '🎒 Travel backpack' },
  { value: 'duffle_bag', translationKey: 'profile.luggageTypes.duffle_bag', defaultLabel: '👝 Duffle bag / Travel bag' },
  { value: 'hiking_backpack', translationKey: 'profile.luggageTypes.hiking_backpack', defaultLabel: '🥾 Hiking backpack' },
  { value: 'weekender', translationKey: 'profile.luggageTypes.weekender', defaultLabel: '👜 Weekender' },
  { value: 'special_equipment', translationKey: 'profile.luggageTypes.special_equipment', defaultLabel: '🎿 Special equipment (e.g. sports gear)' },
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

const normalizeRegions = (regions: string[]): string[] =>
  regions
    .map((code) => (typeof code === 'string' ? code.trim().toUpperCase() : ''))
    .filter((code) => code.length > 0)
    .sort();

const normalizeStyles = (styles: string[]): string[] =>
  styles
    .map((style) => (typeof style === 'string' ? style.trim().toLowerCase() : ''))
    .filter((style) => style.length > 0)
    .sort();

const normalizeSeasons = (seasons: string[]): string[] =>
  seasons
    .map((season) => (typeof season === 'string' ? season.trim().toLowerCase() : ''))
    .filter((season) => season.length > 0)
    .sort();

const normalizeTransportModes = (modes: string[]): string[] => {
  const allowedValues = new Set(TRANSPORT_MODE_OPTIONS.map((option) => option.value));
  const chosen = new Set(
    modes
      .map((mode) => (typeof mode === 'string' ? mode.trim().toLowerCase() : ''))
      .filter((mode) => mode.length > 0 && allowedValues.has(mode))
  );

  return TRANSPORT_MODE_OPTIONS.map((option) => option.value).filter((value) => chosen.has(value));
};

const normalizeLuggageTypes = (types: string[]): string[] => {
  const allowedValues = new Set(LUGGAGE_OPTIONS.map((option) => option.value));
  const chosen = new Set(
    types
      .map((type) => (typeof type === 'string' ? type.trim().toLowerCase() : ''))
      .filter((type) => type.length > 0 && allowedValues.has(type))
  );

  return LUGGAGE_OPTIONS.map((option) => option.value).filter((value) => chosen.has(value));
};

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

const transportModesEqual = (a: string[], b: string[]): boolean => {
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

const luggageTypesEqual = (a: string[], b: string[]): boolean => {
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
  const [travelFrequency, setTravelFrequency] = useState<TravelFrequencyPerYear | null>(null);
  const [originalTravelFrequency, setOriginalTravelFrequency] = useState<TravelFrequencyPerYear | null>(null);
  const [travelDuration, setTravelDuration] = useState<TravelTripDurationDays | null>(null);
  const [originalTravelDuration, setOriginalTravelDuration] = useState<TravelTripDurationDays | null>(null);
  const [travelCountriesVisited, setTravelCountriesVisited] = useState('');
  const [originalTravelCountriesVisited, setOriginalTravelCountriesVisited] = useState<number | null>(null);
  const [travelRegions, setTravelRegions] = useState<string[]>([]);
  const [originalTravelRegions, setOriginalTravelRegions] = useState<string[]>([]);
  const [travelRegionToAdd, setTravelRegionToAdd] = useState('');
  const [travelStyles, setTravelStyles] = useState<string[]>([]);
  const [originalTravelStyles, setOriginalTravelStyles] = useState<string[]>([]);
  const [travelStyleToAdd, setTravelStyleToAdd] = useState('');
  const [travelSeason, setTravelSeason] = useState<string | null>(null);
  const [originalTravelSeason, setOriginalTravelSeason] = useState<string | null>(null);
  const [isEditingTransport, setIsEditingTransport] = useState(false);
  const [savingTransport, setSavingTransport] = useState(false);
  const [transportSaveError, setTransportSaveError] = useState<string | null>(null);
  const [transportSaved, setTransportSaved] = useState(false);
  const [transportModes, setTransportModes] = useState<string[]>([]);
  const [originalTransportModes, setOriginalTransportModes] = useState<string[]>([]);
  const [transportModeToAdd, setTransportModeToAdd] = useState('');
  const [luggageTypes, setLuggageTypes] = useState<string[]>([]);
  const [originalLuggageTypes, setOriginalLuggageTypes] = useState<string[]>([]);
  const [luggageTypeToAdd, setLuggageTypeToAdd] = useState('');

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
    const rawFrequency = profile?.travel_frequency_per_year;
    const sanitizedFrequency = isTravelFrequencyValue(rawFrequency) ? rawFrequency : null;

    setOriginalTravelFrequency(sanitizedFrequency);

    if (!isEditingTravel) {
      setTravelFrequency(sanitizedFrequency);
    }
  }, [profile?.travel_frequency_per_year, isEditingTravel]);

  useEffect(() => {
    const rawDuration = profile?.travel_avg_trip_duration_days;
    const sanitizedDuration = isTravelDurationValue(rawDuration) ? rawDuration : null;

    setOriginalTravelDuration(sanitizedDuration);

    if (!isEditingTravel) {
      setTravelDuration(sanitizedDuration);
    }
  }, [profile?.travel_avg_trip_duration_days, isEditingTravel]);

  useEffect(() => {
    const rawCount =
      typeof profile?.travel_countries_visited_count === 'number' && Number.isFinite(profile.travel_countries_visited_count)
        ? profile.travel_countries_visited_count
        : null;

    setOriginalTravelCountriesVisited(rawCount);

    if (!isEditingTravel) {
      setTravelCountriesVisited(rawCount !== null ? String(rawCount) : '');
    }
  }, [profile?.travel_countries_visited_count, isEditingTravel]);

  useEffect(() => {
    const regionsArray = Array.isArray(profile?.travel_regions_often_visited)
      ? normalizeRegions(profile.travel_regions_often_visited as string[])
      : [];

    setOriginalTravelRegions(regionsArray);

    if (!isEditingTravel) {
      setTravelRegions(regionsArray);
      setTravelRegionToAdd('');
    }
  }, [profile?.travel_regions_often_visited, isEditingTravel]);

  useEffect(() => {
    const stylesArray = Array.isArray(profile?.travel_usual_travel_styles)
      ? normalizeStyles(profile.travel_usual_travel_styles as string[])
      : [];

    setOriginalTravelStyles(stylesArray);

    if (!isEditingTravel) {
      setTravelStyles(stylesArray);
      setTravelStyleToAdd('');
    }
  }, [profile?.travel_usual_travel_styles, isEditingTravel]);

  useEffect(() => {
    const seasonsArray = Array.isArray(profile?.travel_seasonality_preference)
      ? normalizeSeasons(profile.travel_seasonality_preference as string[])
      : [];

    const primarySeason = seasonsArray[0] ?? null;

    setOriginalTravelSeason(primarySeason);

    if (!isEditingTravel) {
      setTravelSeason(primarySeason);
    }
  }, [profile?.travel_seasonality_preference, isEditingTravel]);

  useEffect(() => {
    const modesArray = Array.isArray(profile?.transport_usual_transport_modes)
      ? normalizeTransportModes(profile.transport_usual_transport_modes as string[])
      : [];

    setOriginalTransportModes(modesArray);

    if (!isEditingTransport) {
      setTransportModes(modesArray);
      setTransportModeToAdd('');
    }
  }, [profile?.transport_usual_transport_modes, isEditingTransport]);

  useEffect(() => {
    const luggageArray = Array.isArray(profile?.transport_preferred_luggage_types)
      ? normalizeLuggageTypes(profile.transport_preferred_luggage_types as string[])
      : [];

    setOriginalLuggageTypes(luggageArray);

    if (!isEditingTransport) {
      setLuggageTypes(luggageArray);
      setLuggageTypeToAdd('');
    }
  }, [profile?.transport_preferred_luggage_types, isEditingTransport]);

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

  const availableLanguages = useMemo(() => {
    const chosen = new Set(coreLanguages.map((code) => code.toLowerCase()));
    return LANGUAGE_OPTIONS.filter((language) => !chosen.has(language.code.toLowerCase())).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [coreLanguages]);

  const travelFrequencyOptions = useMemo(
    (): { value: TravelFrequencyPerYear; label: string }[] =>
      TRAVEL_FREQUENCY_VALUES.map((value) => ({
        value,
        label: t(`profile.travelFrequency.${value}`, {
          defaultValue: TRAVEL_FREQUENCY_FALLBACK_LABELS[value],
        }),
      })),
    [t]
  );

  const travelFrequencyLabelByValue = useMemo(() => {
    const map = new Map<TravelFrequencyPerYear, string>();
    travelFrequencyOptions.forEach((option) => {
      map.set(option.value, option.label);
    });
    return map;
  }, [travelFrequencyOptions]);

  const travelFrequencyProfileLabel = useMemo(() => {
    const value = profile?.travel_frequency_per_year;
    if (!isTravelFrequencyValue(value)) {
      return null;
    }

    return travelFrequencyLabelByValue.get(value) ?? null;
  }, [profile?.travel_frequency_per_year, travelFrequencyLabelByValue]);

  const travelDurationOptions = useMemo(
    (): { value: TravelTripDurationDays; label: string }[] =>
      TRAVEL_DURATION_VALUES.map((value) => ({
        value,
        label: t(`profile.travelDuration.${value}`, {
          defaultValue: TRAVEL_DURATION_FALLBACK_LABELS[value],
        }),
      })),
    [t]
  );

  const travelDurationLabelByValue = useMemo(() => {
    const map = new Map<TravelTripDurationDays, string>();
    travelDurationOptions.forEach((option) => {
      map.set(option.value, option.label);
    });
    return map;
  }, [travelDurationOptions]);

  const travelDurationProfileLabel = useMemo(() => {
    const value = profile?.travel_avg_trip_duration_days;
    if (!isTravelDurationValue(value)) {
      return null;
    }

    return travelDurationLabelByValue.get(value) ?? null;
  }, [profile?.travel_avg_trip_duration_days, travelDurationLabelByValue]);

  const travelRegionOptions = useMemo(
    () =>
      TRAVEL_REGION_OPTIONS.map((option) => ({
        value: option.value,
        label: t(option.translationKey, { defaultValue: option.defaultLabel }),
      })),
    [t]
  );

  const travelRegionLabelByValue = useMemo(() => {
    const map = new Map<string, string>();
    travelRegionOptions.forEach((option) => {
      map.set(option.value, option.label);
    });
    return map;
  }, [travelRegionOptions]);

  const availableTravelRegions = useMemo(() => {
    const chosen = new Set(travelRegions);
    return travelRegionOptions.filter((region) => !chosen.has(region.value));
  }, [travelRegionOptions, travelRegions]);

  const travelStyleOptions = useMemo(
    () =>
      TRAVEL_STYLE_OPTIONS.map((option) => ({
        value: option.value,
        label: t(option.translationKey, { defaultValue: option.defaultLabel }),
      })),
    [t]
  );

  const travelStyleLabelByValue = useMemo(() => {
    const map = new Map<string, string>();
    travelStyleOptions.forEach((option) => {
      map.set(option.value, option.label);
    });
    return map;
  }, [travelStyleOptions]);

  const availableTravelStyles = useMemo(() => {
    const chosen = new Set(travelStyles);
    return travelStyleOptions.filter((style) => !chosen.has(style.value));
  }, [travelStyleOptions, travelStyles]);

  const travelSeasonOptions = useMemo(
    () =>
      TRAVEL_SEASON_OPTIONS.map((option) => ({
        value: option.value,
        label: t(option.translationKey, { defaultValue: option.defaultLabel }),
      })),
    [t]
  );

  const travelSeasonLabelByValue = useMemo(() => {
    const map = new Map<string, string>();
    travelSeasonOptions.forEach((option) => {
      map.set(option.value, option.label);
    });
    return map;
  }, [travelSeasonOptions]);

  const transportModeOptions = useMemo(
    () =>
      TRANSPORT_MODE_OPTIONS.map((option) => ({
        value: option.value,
        label: t(option.translationKey, { defaultValue: option.defaultLabel }),
      })),
    [t]
  );

  const transportModeLabelByValue = useMemo(() => {
    const map = new Map<string, string>();
    transportModeOptions.forEach((option) => {
      map.set(option.value, option.label);
    });
    return map;
  }, [transportModeOptions]);

  const availableTransportModes = useMemo(
    () => transportModeOptions.filter((option) => !transportModes.includes(option.value)),
    [transportModeOptions, transportModes]
  );

  const luggageTypeOptions = useMemo(
    () =>
      LUGGAGE_OPTIONS.map((option) => ({
        value: option.value,
        label: t(option.translationKey, { defaultValue: option.defaultLabel }),
      })),
    [t]
  );

  const luggageTypeLabelByValue = useMemo(() => {
    const map = new Map<string, string>();
    luggageTypeOptions.forEach((option) => {
      map.set(option.value, option.label);
    });
    return map;
  }, [luggageTypeOptions]);

  const availableLuggageTypes = useMemo(
    () => luggageTypeOptions.filter((option) => !luggageTypes.includes(option.value)),
    [luggageTypeOptions, luggageTypes]
  );

  const trimmedFirstName = coreFirstName.trim();
  const trimmedLastName = coreLastName.trim();
  const normalizedSelectedCountry = selectedCountry?.name ?? null;

  const normalizedTravelFrequency = travelFrequency;
  const normalizedTravelDuration = travelDuration;
  const trimmedTravelCountriesVisited = travelCountriesVisited.trim();
  const parsedTravelCountriesVisited =
    trimmedTravelCountriesVisited.length > 0
      ? Number.parseInt(trimmedTravelCountriesVisited, 10)
      : Number.NaN;
  const travelCountriesVisitedValue = Number.isFinite(parsedTravelCountriesVisited)
    ? Math.max(0, parsedTravelCountriesVisited)
    : null;
  const isTravelFrequencyDirty = normalizedTravelFrequency !== originalTravelFrequency;
  const isTravelDurationDirty = normalizedTravelDuration !== originalTravelDuration;
  const isTravelRegionsDirty =
    travelRegions.length !== originalTravelRegions.length ||
    travelRegions.some((region, index) => region !== originalTravelRegions[index]);
  const isTravelStylesDirty =
    travelStyles.length !== originalTravelStyles.length ||
    travelStyles.some((style, index) => style !== originalTravelStyles[index]);
  const isTravelSeasonDirty = travelSeason !== originalTravelSeason;
  const isTravelCountriesVisitedDirty = travelCountriesVisitedValue !== originalTravelCountriesVisited;
  const isTravelDirty =
    isTravelFrequencyDirty ||
    isTravelDurationDirty ||
    isTravelRegionsDirty ||
    isTravelStylesDirty ||
    isTravelSeasonDirty ||
    isTravelCountriesVisitedDirty;
  const isTransportModesDirty = !transportModesEqual(transportModes, originalTransportModes);
  const isLuggageTypesDirty = !luggageTypesEqual(luggageTypes, originalLuggageTypes);
  const isTransportDirty = isTransportModesDirty || isLuggageTypesDirty;
  const travelFrequencyDisplayLabel = normalizedTravelFrequency
    ? travelFrequencyLabelByValue.get(normalizedTravelFrequency) ?? null
    : null;
  const travelDurationDisplayLabel = normalizedTravelDuration
    ? travelDurationLabelByValue.get(normalizedTravelDuration) ?? null
    : null;
  const travelRegionsDisplayLabels = useMemo(
    () =>
      travelRegions.map((code) => travelRegionLabelByValue.get(code) ?? code),
    [travelRegions, travelRegionLabelByValue]
  );
  const originalTravelRegionsDisplayLabels = useMemo(
    () =>
      originalTravelRegions.map((code) => travelRegionLabelByValue.get(code) ?? code),
    [originalTravelRegions, travelRegionLabelByValue]
  );
  const travelStylesDisplayLabels = useMemo(
    () => travelStyles.map((code) => travelStyleLabelByValue.get(code) ?? code),
    [travelStyles, travelStyleLabelByValue]
  );
  const originalTravelStylesDisplayLabels = useMemo(
    () => originalTravelStyles.map((code) => travelStyleLabelByValue.get(code) ?? code),
    [originalTravelStyles, travelStyleLabelByValue]
  );
  const travelSeasonDisplayLabel = travelSeason
    ? travelSeasonLabelByValue.get(travelSeason) ?? travelSeason
    : null;
  const originalTravelSeasonDisplayLabel = originalTravelSeason
    ? travelSeasonLabelByValue.get(originalTravelSeason) ?? originalTravelSeason
    : null;
  const transportModesDisplayLabels = useMemo(
    () => transportModes.map((mode) => transportModeLabelByValue.get(mode) ?? mode),
    [transportModes, transportModeLabelByValue]
  );
  const originalTransportModesDisplayLabels = useMemo(
    () => originalTransportModes.map((mode) => transportModeLabelByValue.get(mode) ?? mode),
    [originalTransportModes, transportModeLabelByValue]
  );
  const luggageTypesDisplayLabels = useMemo(
    () => luggageTypes.map((type) => luggageTypeLabelByValue.get(type) ?? type),
    [luggageTypes, luggageTypeLabelByValue]
  );
  const originalLuggageTypesDisplayLabels = useMemo(
    () => originalLuggageTypes.map((type) => luggageTypeLabelByValue.get(type) ?? type),
    [originalLuggageTypes, luggageTypeLabelByValue]
  );

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
          {
            id: 'travel_avg_trip_duration_days',
            label: t('profile.fields.tripDuration'),
            value: profile?.travel_avg_trip_duration_days,
          },
          {
            id: 'travel_countries_visited_count',
            label: t('profile.fields.countriesVisited'),
            value: profile?.travel_countries_visited_count,
          },
          {
            id: 'travel_seasonality_preference',
            label: t('profile.fields.travelSeasonality'),
            value: profile?.travel_seasonality_preference,
          },
          {
            id: 'travel_usual_travel_styles',
            label: t('profile.fields.travelStyles'),
            value: profile?.travel_usual_travel_styles,
          },
          {
            id: 'travel_regions_often_visited',
            label: t('profile.fields.regionsVisited'),
            value: profile?.travel_regions_often_visited,
          },
        ],
      },
      {
        id: 'transport',
        title: t('profile.sections.transport'),
        fields: [
          {
            id: 'transport_usual_transport_modes',
            label: t('profile.fields.transportModes'),
            value: profile?.transport_usual_transport_modes,
          },
          {
            id: 'transport_preferred_luggage_types',
            label: t('profile.fields.luggageTypes'),
            value: profile?.transport_preferred_luggage_types,
          },
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

  const selectedCountryDisplayName = useMemo(() => {
    if (!countryDisplayOption) {
      return normalizedSelectedCountry;
    }

    return getCountryDisplayName(countryDisplayOption) ?? normalizedSelectedCountry;
  }, [countryDisplayOption, getCountryDisplayName, normalizedSelectedCountry]);
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

  const handleAddTravelRegion = () => {
    if (!travelRegionToAdd) {
      return;
    }

    const normalized = travelRegionToAdd.toUpperCase();
    if (travelRegions.includes(normalized)) {
      setTravelRegionToAdd('');
      return;
    }

    setTravelRegions((prev) => normalizeRegions([...prev, normalized]));
    setTravelRegionToAdd('');
    setTravelSaved(false);
    setTravelSaveError(null);
  };

  const handleRemoveTravelRegion = (code: string) => {
    const normalized = code.toUpperCase();
    setTravelRegions((prev) => normalizeRegions(prev.filter((item) => item !== normalized)));
    setTravelSaved(false);
    setTravelSaveError(null);
  };

  const handleAddTravelStyle = () => {
    if (!travelStyleToAdd) {
      return;
    }

    const normalized = travelStyleToAdd.toLowerCase();
    if (travelStyles.includes(normalized)) {
      setTravelStyleToAdd('');
      return;
    }

    setTravelStyles((prev) => normalizeStyles([...prev, normalized]));
    setTravelStyleToAdd('');
    setTravelSaved(false);
    setTravelSaveError(null);
  };

  const handleRemoveTravelStyle = (style: string) => {
    const normalized = style.toLowerCase();
    setTravelStyles((prev) => normalizeStyles(prev.filter((item) => item !== normalized)));
    setTravelSaved(false);
    setTravelSaveError(null);
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
    setTravelDuration(originalTravelDuration);
    setTravelCountriesVisited(
      originalTravelCountriesVisited !== null ? String(originalTravelCountriesVisited) : ''
    );
    setTravelRegions(originalTravelRegions);
    setTravelRegionToAdd('');
    setTravelStyles(originalTravelStyles);
    setTravelStyleToAdd('');
    setTravelSeason(originalTravelSeason);
  };

  const handleCancelEditingTravel = () => {
    setIsEditingTravel(false);
    setTravelSaved(false);
    setTravelSaveError(null);
    setTravelFrequency(originalTravelFrequency);
    setTravelDuration(originalTravelDuration);
    setTravelCountriesVisited(
      originalTravelCountriesVisited !== null ? String(originalTravelCountriesVisited) : ''
    );
    setTravelRegions(originalTravelRegions);
    setTravelRegionToAdd('');
    setTravelStyles(originalTravelStyles);
    setTravelStyleToAdd('');
    setTravelSeason(originalTravelSeason);
  };

  const handleStartEditingTransport = () => {
    setIsEditingTransport(true);
    setTransportSaved(false);
    setTransportSaveError(null);
    setTransportModes(originalTransportModes);
    setTransportModeToAdd('');
    setLuggageTypes(originalLuggageTypes);
    setLuggageTypeToAdd('');
  };

  const handleCancelEditingTransport = () => {
    setIsEditingTransport(false);
    setTransportSaved(false);
    setTransportSaveError(null);
    setTransportModes(originalTransportModes);
    setTransportModeToAdd('');
    setLuggageTypes(originalLuggageTypes);
    setLuggageTypeToAdd('');
  };

  const handleAddTransportMode = () => {
    if (!transportModeToAdd) {
      return;
    }

    if (transportModes.includes(transportModeToAdd)) {
      setTransportModeToAdd('');
      return;
    }

    setTransportModes((prev) => normalizeTransportModes([...prev, transportModeToAdd]));
    setTransportModeToAdd('');
    setTransportSaved(false);
    setTransportSaveError(null);
  };

  const handleRemoveTransportMode = (mode: string) => {
    setTransportModes((prev) => normalizeTransportModes(prev.filter((item) => item !== mode)));
    setTransportSaved(false);
    setTransportSaveError(null);
  };

  const handleAddLuggageType = () => {
    if (!luggageTypeToAdd) {
      return;
    }

    if (luggageTypes.includes(luggageTypeToAdd)) {
      setLuggageTypeToAdd('');
      return;
    }

    setLuggageTypes((prev) => normalizeLuggageTypes([...prev, luggageTypeToAdd]));
    setLuggageTypeToAdd('');
    setTransportSaved(false);
    setTransportSaveError(null);
  };

  const handleRemoveLuggageType = (type: string) => {
    setLuggageTypes((prev) => normalizeLuggageTypes(prev.filter((item) => item !== type)));
    setTransportSaved(false);
    setTransportSaveError(null);
  };

  const handleSaveTransport = async () => {
    if (!user?.id) {
      setTransportSaveError(
        t('profile.errors.mustBeSignedIn', {
          defaultValue: 'Sign in to update your profile.',
        })
      );
      return;
    }

    if (!isTransportDirty) {
      setIsEditingTransport(false);
      return;
    }

    try {
      setSavingTransport(true);
      setTransportSaveError(null);

      const normalizedModes = normalizeTransportModes(transportModes);
      const normalizedLuggage = normalizeLuggageTypes(luggageTypes);
      const payload: Partial<Profile> = {};

      if (isTransportModesDirty) {
        payload.transport_usual_transport_modes = normalizedModes.length > 0 ? normalizedModes : null;
      }

      if (isLuggageTypesDirty) {
        payload.transport_preferred_luggage_types =
          normalizedLuggage.length > 0 ? normalizedLuggage : null;
      }

      if (Object.keys(payload).length === 0) {
        setIsEditingTransport(false);
        return;
      }

      const { error: updateError } = await updateRecord<Profile>('profiles', payload, {
        match: { user_id: user.id },
      });

      if (updateError) {
        throw updateError;
      }

      await refresh();
      setIsEditingTransport(false);
      setTransportSaved(true);
      setOriginalTransportModes(normalizedModes);
      setTransportModes(normalizedModes);
      setTransportModeToAdd('');
      setOriginalLuggageTypes(normalizedLuggage);
      setLuggageTypes(normalizedLuggage);
      setLuggageTypeToAdd('');
    } catch (saveError) {
      console.error('Failed to save transport preferences', saveError);
      setTransportSaveError(
        saveError instanceof Error
          ? saveError.message
          : t('profile.errors.transportSaveFailed', {
              defaultValue: 'We couldn’t save your transport preferences. Try again.',
            })
      );
    } finally {
      setSavingTransport(false);
    }
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

      const payload: Partial<Profile> = {};

      if (isTravelFrequencyDirty) {
        payload.travel_frequency_per_year = normalizedTravelFrequency ?? null;
      }

      if (isTravelDurationDirty) {
        payload.travel_avg_trip_duration_days = normalizedTravelDuration ?? null;
      }

      if (isTravelRegionsDirty) {
        payload.travel_regions_often_visited = travelRegions.length > 0 ? travelRegions : null;
      }

      if (isTravelStylesDirty) {
        payload.travel_usual_travel_styles = travelStyles.length > 0 ? travelStyles : null;
      }

      if (isTravelSeasonDirty) {
        payload.travel_seasonality_preference = travelSeason ? [travelSeason] : null;
      }

      if (isTravelCountriesVisitedDirty) {
        payload.travel_countries_visited_count = travelCountriesVisitedValue ?? null;
      }

      if (Object.keys(payload).length === 0) {
        setIsEditingTravel(false);
        return;
      }

      const { error: updateError } = await updateRecord<Profile>('profiles', payload, {
        match: { user_id: user.id },
      });

      if (updateError) {
        throw updateError;
      }

      await refresh();
      setIsEditingTravel(false);
      setTravelSaved(true);
      setOriginalTravelFrequency(normalizedTravelFrequency ?? null);
      setOriginalTravelDuration(normalizedTravelDuration ?? null);
      setOriginalTravelRegions(travelRegions);
      setOriginalTravelStyles(travelStyles);
      setOriginalTravelSeason(travelSeason ?? null);
      setOriginalTravelCountriesVisited(travelCountriesVisitedValue ?? null);
      setTravelCountriesVisited(
        travelCountriesVisitedValue !== null ? String(travelCountriesVisitedValue) : ''
      );
    } catch (saveError) {
      console.error('Failed to save travel preferences', saveError);
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
                    </div>
                  ) : normalizedSelectedCountry ? (
                    <span className="flex items-center gap-2">
                      {countryDisplayOption?.flag ? (
                        <span className="text-lg leading-none">{countryDisplayOption.flag}</span>
                      ) : null}
                      <span>{selectedCountryDisplayName ?? normalizedSelectedCountry}</span>
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
                ) : section.id === 'transport' ? (
                  isEditingTransport ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCancelEditingTransport}
                        className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-brand-secondary hover:text-brand-secondary disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:text-slate-200 dark:hover:border-brand-primary dark:hover:text-brand-primary"
                        disabled={savingTransport}
                      >
                        {t('profile.actions.cancel', { defaultValue: 'Cancel' })}
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveTransport}
                        className="rounded-full border border-brand-secondary bg-brand-secondary px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-secondary/90 disabled:cursor-not-allowed disabled:opacity-60 dark:border-brand-secondary"
                        disabled={savingTransport}
                      >
                        {savingTransport
                          ? t('profile.actions.saving', { defaultValue: 'Saving…' })
                          : t('profile.actions.save', { defaultValue: 'Save' })}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStartEditingTransport}
                      className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-brand-secondary hover:text-brand-secondary disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:text-slate-200 dark:hover:border-brand-primary dark:hover:text-brand-primary"
                      disabled={savingTransport}
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
              ) : section.id === 'transport' ? (
                <>
                  {transportSaveError ? (
                    <p className="text-xs text-red-500">{transportSaveError}</p>
                  ) : null}
                  {!transportSaveError && transportSaved ? (
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
                      {section.id === 'travel' && field.id === 'travel_frequency_per_year'
                        ? isEditingTravel
                          ? (
                              <select
                                value={travelFrequency ?? ''}
                                onChange={(event) => {
                                  const nextValue = event.target.value;
                                  setTravelFrequency(isTravelFrequencyValue(nextValue) ? nextValue : null);
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
                            )
                          : travelFrequencyDisplayLabel ??
                            travelFrequencyProfileLabel ??
                            t('profile.fallback.notSet')
                        : section.id === 'travel' && field.id === 'travel_regions_often_visited'
                        ? isEditingTravel
                          ? (
                              <div className="flex flex-col gap-3">
                                <div className="flex flex-wrap gap-2">
                                  {travelRegions.length === 0 ? (
                                    <span className="text-xs text-[var(--text-secondary)]">
                                      {t('profile.fallback.notSet')}
                                    </span>
                                  ) : (
                                    travelRegionsDisplayLabels.map((label, index) => (
                                      <span
                                        key={`${travelRegions[index]}-${label}`}
                                        className="flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold uppercase text-slate-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                                      >
                                        {label}
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveTravelRegion(travelRegions[index])}
                                          className="text-slate-400 transition hover:text-red-500"
                                          aria-label={t('profile.actions.removeTravelRegion', {
                                            defaultValue: 'Remove region',
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
                                    value={travelRegionToAdd}
                                    onChange={(event) => setTravelRegionToAdd(event.target.value)}
                                    className="w-60 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                                    disabled={savingTravel}
                                  >
                                    <option value="">
                                      {t('profile.actions.selectTravelRegion', {
                                        defaultValue: 'Select region',
                                      })}
                                    </option>
                                    {availableTravelRegions.map((option) => (
                                      <option key={option.value} value={option.value}>
                                        {option.label}
                                      </option>
                                    ))}
                                  </select>
                                  <button
                                    type="button"
                                    onClick={handleAddTravelRegion}
                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-secondary text-lg font-semibold text-brand-secondary transition hover:bg-brand-secondary hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                                    disabled={savingTravel || !travelRegionToAdd}
                                    aria-label={t('profile.actions.addTravelRegion', {
                                      defaultValue: 'Add region',
                                    })}
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            )
                          : originalTravelRegions.length === 0
                            ? (
                                <span className="text-xs text-[var(--text-secondary)]">
                                  {t('profile.fallback.notSet')}
                                </span>
                              )
                            : (
                                <div className="flex flex-wrap gap-2">
                                  {originalTravelRegionsDisplayLabels.map((label, index) => (
                                    <span
                                      key={`${originalTravelRegions[index]}-${label}`}
                                      className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold uppercase text-slate-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                                    >
                                      {label}
                                    </span>
                                  ))}
                                </div>
                              )
                        : section.id === 'travel' && field.id === 'travel_usual_travel_styles'
                        ? isEditingTravel
                          ? (
                              <div className="flex flex-col gap-3">
                                <div className="flex flex-wrap gap-2">
                                  {travelStyles.length === 0 ? (
                                    <span className="text-xs text-[var(--text-secondary)]">
                                      {t('profile.fallback.notSet')}
                                    </span>
                                  ) : (
                                    travelStylesDisplayLabels.map((label, index) => (
                                      <span
                                        key={`${travelStyles[index]}-${label}`}
                                        className="flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold uppercase text-slate-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                                      >
                                        {label}
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveTravelStyle(travelStyles[index])}
                                          className="text-slate-400 transition hover:text-red-500"
                                          aria-label={t('profile.actions.removeTravelStyle', {
                                            defaultValue: 'Remove travel style',
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
                                    value={travelStyleToAdd}
                                    onChange={(event) => setTravelStyleToAdd(event.target.value)}
                                    className="w-60 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                                    disabled={savingTravel}
                                  >
                                    <option value="">
                                      {t('profile.actions.selectTravelStyle', {
                                        defaultValue: 'Select travel style',
                                      })}
                                    </option>
                                    {availableTravelStyles.map((option) => (
                                      <option key={option.value} value={option.value}>
                                        {option.label}
                                      </option>
                                    ))}
                                  </select>
                                  <button
                                    type="button"
                                    onClick={handleAddTravelStyle}
                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-secondary text-lg font-semibold text-brand-secondary transition hover:bg-brand-secondary hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                                    disabled={savingTravel || !travelStyleToAdd}
                                    aria-label={t('profile.actions.addTravelStyle', {
                                      defaultValue: 'Add travel style',
                                    })}
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            )
                          : originalTravelStyles.length === 0
                            ? (
                                <span className="text-xs text-[var(--text-secondary)]">
                                  {t('profile.fallback.notSet')}
                                </span>
                              )
                            : (
                                <div className="flex flex-wrap gap-2">
                                  {originalTravelStylesDisplayLabels.map((label, index) => (
                                    <span
                                      key={`${originalTravelStyles[index]}-${label}`}
                                      className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold uppercase text-slate-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                                    >
                                      {label}
                                    </span>
                                  ))}
                                </div>
                              )
                        : section.id === 'travel' && field.id === 'travel_seasonality_preference'
                        ? isEditingTravel
                          ? (
                              <select
                                value={travelSeason ?? ''}
                                onChange={(event) => {
                                  const nextValue = event.target.value;
                                  setTravelSeason(nextValue ? nextValue : null);
                                  setTravelSaved(false);
                                  setTravelSaveError(null);
                                }}
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                                disabled={savingTravel}
                              >
                                <option value="">
                                  {t('profile.actions.selectTravelSeason', {
                                    defaultValue: 'Select season',
                                  })}
                                </option>
                                {travelSeasonOptions.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            )
                          : travelSeasonDisplayLabel ??
                            originalTravelSeasonDisplayLabel ??
                            t('profile.fallback.notSet')
                        : section.id === 'travel' && field.id === 'travel_countries_visited_count'
                        ? isEditingTravel
                          ? (
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextValue = travelCountriesVisitedValue ?? 0;
                                    if (nextValue <= 0) {
                                      setTravelCountriesVisited('');
                                    } else {
                                      const decremented = Math.max(nextValue - 1, 0);
                                      setTravelCountriesVisited(String(decremented));
                                    }
                                    setTravelSaved(false);
                                    setTravelSaveError(null);
                                  }}
                                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 text-lg font-semibold text-slate-600 transition hover:border-brand-secondary hover:text-brand-secondary disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:text-slate-200 dark:hover:border-brand-primary dark:hover:text-brand-primary"
                                  disabled={savingTravel}
                                  aria-label={t('profile.actions.decreaseTravelCountriesVisited', {
                                    defaultValue: 'Decrease countries visited',
                                  })}
                                >
                                  −
                                </button>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  value={travelCountriesVisited}
                                  onChange={(event) => {
                                    const digitsOnly = event.target.value.replace(/[^0-9]/g, '');
                                    setTravelCountriesVisited(digitsOnly);
                                    setTravelSaved(false);
                                    setTravelSaveError(null);
                                  }}
                                  className="w-24 rounded-lg border border-slate-300 bg-white px-3 py-2 text-center text-sm text-slate-700 shadow-sm focus:border-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                                  placeholder={t('profile.actions.enterTravelCountriesVisited', {
                                    defaultValue: 'Enter number',
                                  })}
                                  disabled={savingTravel}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextValue = (travelCountriesVisitedValue ?? 0) + 1;
                                    setTravelCountriesVisited(String(nextValue));
                                    setTravelSaved(false);
                                    setTravelSaveError(null);
                                  }}
                                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 text-lg font-semibold text-slate-600 transition hover:border-brand-secondary hover:text-brand-secondary disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:text-slate-200 dark:hover:border-brand-primary dark:hover:text-brand-primary"
                                  disabled={savingTravel}
                                  aria-label={t('profile.actions.increaseTravelCountriesVisited', {
                                    defaultValue: 'Increase countries visited',
                                  })}
                                >
                                  +
                                </button>
                              </div>
                            )
                          : originalTravelCountriesVisited !== null
                            ? String(originalTravelCountriesVisited)
                            : t('profile.fallback.notSet')
                        : section.id === 'travel' && field.id === 'travel_avg_trip_duration_days'
                        ? isEditingTravel
                          ? (
                              <select
                                value={travelDuration ?? ''}
                                onChange={(event) => {
                                  const nextValue = event.target.value;
                                  setTravelDuration(isTravelDurationValue(nextValue) ? nextValue : null);
                                  setTravelSaved(false);
                                  setTravelSaveError(null);
                                }}
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                                disabled={savingTravel}
                              >
                                <option value="">
                                  {t('profile.actions.selectTravelDuration', {
                                    defaultValue: 'Select your average trip length',
                                  })}
                                </option>
                                {travelDurationOptions.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            )
                          : travelDurationDisplayLabel ??
                            travelDurationProfileLabel ??
                            t('profile.fallback.notSet')
                        : section.id === 'transport' && field.id === 'transport_usual_transport_modes'
                        ? isEditingTransport
                          ? (
                              <div className="flex flex-col gap-3">
                                <div className="flex flex-wrap gap-2">
                                  {transportModes.length === 0 ? (
                                    <span className="text-xs text-[var(--text-secondary)]">
                                      {t('profile.fallback.notSet')}
                                    </span>
                                  ) : (
                                    transportModes.map((mode, index) => (
                                      <span
                                        key={mode}
                                        className="flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                                      >
                                        {transportModesDisplayLabels[index]}
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveTransportMode(mode)}
                                          className="text-slate-400 transition hover:text-red-500"
                                          aria-label={t('profile.actions.removeTransportMode', {
                                            defaultValue: 'Remove transport mode',
                                          })}
                                          disabled={savingTransport}
                                        >
                                          ×
                                        </button>
                                      </span>
                                    ))
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <select
                                    value={transportModeToAdd}
                                    onChange={(event) => setTransportModeToAdd(event.target.value)}
                                    className="w-48 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                                    disabled={savingTransport}
                                  >
                                    <option value="">
                                      {t('profile.actions.selectTransportMode', {
                                        defaultValue: 'Select transport mode',
                                      })}
                                    </option>
                                    {availableTransportModes.map((option) => (
                                      <option key={option.value} value={option.value}>
                                        {option.label}
                                      </option>
                                    ))}
                                  </select>
                                  <button
                                    type="button"
                                    onClick={handleAddTransportMode}
                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-secondary text-lg font-semibold text-brand-secondary transition hover:bg-brand-secondary hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                                    disabled={!transportModeToAdd || savingTransport}
                                    aria-label={t('profile.actions.addTransportMode', {
                                      defaultValue: 'Add transport mode',
                                    })}
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            )
                          : originalTransportModes.length === 0
                            ? (
                                <span className="text-xs text-[var(--text-secondary)]">
                                  {t('profile.fallback.notSet')}
                                </span>
                              )
                            : (
                                <div className="flex flex-wrap gap-2">
                                  {originalTransportModes.map((mode, index) => (
                                    <span
                                      key={mode}
                                      className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                                    >
                                      {originalTransportModesDisplayLabels[index]}
                                    </span>
                                  ))}
                                </div>
                              )
                        : section.id === 'transport' && field.id === 'transport_preferred_luggage_types'
                        ? isEditingTransport
                          ? (
                              <div className="flex flex-col gap-3">
                                <div className="flex flex-wrap gap-2">
                                  {luggageTypes.length === 0 ? (
                                    <span className="text-xs text-[var(--text-secondary)]">
                                      {t('profile.fallback.notSet')}
                                    </span>
                                  ) : (
                                    luggageTypes.map((type, index) => (
                                      <span
                                        key={type}
                                        className="flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                                      >
                                        {luggageTypesDisplayLabels[index]}
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveLuggageType(type)}
                                          className="text-slate-400 transition hover:text-red-500"
                                          aria-label={t('profile.actions.removeLuggageType', {
                                            defaultValue: 'Remove luggage type',
                                          })}
                                          disabled={savingTransport}
                                        >
                                          ×
                                        </button>
                                      </span>
                                    ))
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <select
                                    value={luggageTypeToAdd}
                                    onChange={(event) => setLuggageTypeToAdd(event.target.value)}
                                    className="w-48 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                                    disabled={savingTransport}
                                  >
                                    <option value="">
                                      {t('profile.actions.selectLuggageType', {
                                        defaultValue: 'Select luggage type',
                                      })}
                                    </option>
                                    {availableLuggageTypes.map((option) => (
                                      <option key={option.value} value={option.value}>
                                        {option.label}
                                      </option>
                                    ))}
                                  </select>
                                  <button
                                    type="button"
                                    onClick={handleAddLuggageType}
                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-secondary text-lg font-semibold text-brand-secondary transition hover:bg-brand-secondary hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                                    disabled={!luggageTypeToAdd || savingTransport}
                                    aria-label={t('profile.actions.addLuggageType', {
                                      defaultValue: 'Add luggage type',
                                    })}
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            )
                          : originalLuggageTypes.length === 0
                            ? (
                                <span className="text-xs text-[var(--text-secondary)]">
                                  {t('profile.fallback.notSet')}
                                </span>
                              )
                            : (
                                <div className="flex flex-wrap gap-2">
                                  {originalLuggageTypes.map((type, index) => (
                                    <span
                                      key={type}
                                      className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                                    >
                                      {originalLuggageTypesDisplayLabels[index]}
                                    </span>
                                  ))}
                                </div>
                              )
                        : (
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
