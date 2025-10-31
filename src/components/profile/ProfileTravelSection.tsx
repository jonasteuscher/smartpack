import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { Combobox } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { useTranslation } from 'react-i18next';
import type { User } from '@supabase/supabase-js';
import type { Profile, TravelFrequencyPerYear, TravelTripDurationDays } from '@/types/profile';
import { updateRecord } from '@/services/supabaseCrud';

interface TravelRegionOption {
  value: string;
  translationKey: string;
  defaultLabel: string;
  emoji?: string;
}

interface TravelStyleOption {
  value: string;
  translationKey: string;
  defaultLabel: string;
  emoji?: string;
}

interface TravelSeasonOption {
  value: string;
  translationKey: string;
  defaultLabel: string;
}

const TRAVEL_REGION_OPTIONS: readonly TravelRegionOption[] = [
  { value: 'CH', translationKey: 'profile.travelRegions.CH', defaultLabel: '🇨🇭 Switzerland / Domestic', emoji: '🇨🇭' },
  { value: 'EU', translationKey: 'profile.travelRegions.EU', defaultLabel: '🇪🇺 Europe', emoji: '🇪🇺' },
  { value: 'NA', translationKey: 'profile.travelRegions.NA', defaultLabel: '🇺🇸 North America', emoji: '🇺🇸' },
  { value: 'SA', translationKey: 'profile.travelRegions.SA', defaultLabel: '🇧🇷 South America', emoji: '🇧🇷' },
  { value: 'AS', translationKey: 'profile.travelRegions.AS', defaultLabel: '🇯🇵 Asia', emoji: '🇯🇵' },
  { value: 'AF', translationKey: 'profile.travelRegions.AF', defaultLabel: '🇿🇦 Africa', emoji: '🇿🇦' },
  { value: 'OC', translationKey: 'profile.travelRegions.OC', defaultLabel: '🇦🇺 Oceania', emoji: '🇦🇺' },
  { value: 'ME', translationKey: 'profile.travelRegions.ME', defaultLabel: '🕌 Middle East', emoji: '🕌' },
];

const TRAVEL_STYLE_OPTIONS: readonly TravelStyleOption[] = [
  { value: 'citytrip', translationKey: 'profile.travelStyles.citytrip', defaultLabel: '🏙️ City trips', emoji: '🏙️' },
  { value: 'beach', translationKey: 'profile.travelStyles.beach', defaultLabel: '🏖️ Beach holidays', emoji: '🏖️' },
  { value: 'outdoor', translationKey: 'profile.travelStyles.outdoor', defaultLabel: '🧗 Adventure & outdoor', emoji: '🧗' },
  { value: 'business', translationKey: 'profile.travelStyles.business', defaultLabel: '💼 Business travel', emoji: '💼' },
  { value: 'camping', translationKey: 'profile.travelStyles.camping', defaultLabel: '🚐 Camping / Vanlife', emoji: '🚐' },
  { value: 'luxury', translationKey: 'profile.travelStyles.luxury', defaultLabel: '✨ Luxury travel', emoji: '✨' },
  { value: 'backpacking', translationKey: 'profile.travelStyles.backpacking', defaultLabel: '🎒 Backpacking', emoji: '🎒' },
  { value: 'culture', translationKey: 'profile.travelStyles.culture', defaultLabel: '🗺️ Culture & sightseeing', emoji: '🗺️' },
];

const TRAVEL_SEASON_OPTIONS: readonly TravelSeasonOption[] = [
  { value: 'spring', translationKey: 'profile.travelSeasons.spring', defaultLabel: '🌸 Spring' },
  { value: 'summer', translationKey: 'profile.travelSeasons.summer', defaultLabel: '☀️ Summer' },
  { value: 'autumn', translationKey: 'profile.travelSeasons.autumn', defaultLabel: '🍂 Autumn' },
  { value: 'winter', translationKey: 'profile.travelSeasons.winter', defaultLabel: '❄️ Winter' },
  { value: 'all_year', translationKey: 'profile.travelSeasons.all_year', defaultLabel: '🗓️ All year round' },
];

const TRAVEL_FREQUENCY_VALUES: readonly TravelFrequencyPerYear[] = [
  'rarely',
  'sometimes',
  'often',
  'frequent',
];

const TRAVEL_FREQUENCY_FALLBACK_LABELS: Record<TravelFrequencyPerYear, string> = {
  rarely: '🌱 Rarely (1-2 trips)',
  sometimes: '🌤️ Sometimes (3-5 trips)',
  often: '✈️ Often (6-10 trips)',
  frequent: '🌍 Very often (10+ trips)',
};

const TRAVEL_DURATION_VALUES: readonly TravelTripDurationDays[] = ['short', 'medium', 'long', 'extended'];

const TRAVEL_DURATION_FALLBACK_LABELS: Record<TravelTripDurationDays, string> = {
  short: '📅 Short (1-3 days)',
  medium: '🧳 Medium (4-7 days)',
  long: '🌏 Long (8-14 days)',
  extended: '🗺️ Extended (15+ days)',
};

const isTravelFrequencyValue = (value: unknown): value is TravelFrequencyPerYear =>
  typeof value === 'string' && (TRAVEL_FREQUENCY_VALUES as readonly string[]).includes(value);

const isTravelDurationValue = (value: unknown): value is TravelTripDurationDays =>
  typeof value === 'string' && (TRAVEL_DURATION_VALUES as readonly string[]).includes(value);

const normalizeRegions = (regions: string[]): string[] => {
  const allowed = new Set(TRAVEL_REGION_OPTIONS.map((option) => option.value));
  return regions
    .map((code) => (typeof code === 'string' ? code.trim().toUpperCase() : ''))
    .filter((code) => code.length > 0 && allowed.has(code))
    .sort();
};

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

interface ProfileTravelSectionProps {
  profile: Profile | null;
  user: User | null;
  refreshProfile: () => Promise<void>;
  refreshSignal: number;
  onEditingChange?: (isEditing: boolean) => void;
}

const ProfileTravelSection = ({
  profile,
  user,
  refreshProfile,
  refreshSignal,
  onEditingChange,
}: ProfileTravelSectionProps) => {
  const { t } = useTranslation('dashboard');

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

  useEffect(() => {
    onEditingChange?.(isEditingTravel);
  }, [isEditingTravel, onEditingChange]);

  useEffect(() => {
    setTravelSaved(false);
    setTravelSaveError(null);
  }, [refreshSignal]);

  useEffect(() => {
    const value = profile?.travel_frequency_per_year;
    const normalized = isTravelFrequencyValue(value) ? value : null;
    setOriginalTravelFrequency(normalized);
    if (!isEditingTravel) {
      setTravelFrequency(normalized);
    }
  }, [isEditingTravel, profile?.travel_frequency_per_year]);

  useEffect(() => {
    const value = profile?.travel_avg_trip_duration_days;
    const normalized = isTravelDurationValue(value) ? value : null;
    setOriginalTravelDuration(normalized);
    if (!isEditingTravel) {
      setTravelDuration(normalized);
    }
  }, [isEditingTravel, profile?.travel_avg_trip_duration_days]);

  useEffect(() => {
    const rawCount =
      typeof profile?.travel_countries_visited_count === 'number'
        ? profile.travel_countries_visited_count
        : typeof profile?.travel_countries_visited_count === 'string'
        ? Number.parseInt(profile.travel_countries_visited_count, 10)
        : null;

    setOriginalTravelCountriesVisited(Number.isFinite(rawCount) ? Number(rawCount) : null);

    if (!isEditingTravel) {
      setTravelCountriesVisited(rawCount !== null ? String(rawCount) : '');
    }
  }, [isEditingTravel, profile?.travel_countries_visited_count]);

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

  const travelFrequencyLabelByValue = useMemo(() => {
    const map = new Map<TravelFrequencyPerYear, string>();
    TRAVEL_FREQUENCY_VALUES.forEach((value) => {
      map.set(value, t(`profile.travelFrequency.${value}`, { defaultValue: TRAVEL_FREQUENCY_FALLBACK_LABELS[value] }));
    });
    return map;
  }, [t]);

  const travelDurationLabelByValue = useMemo(() => {
    const map = new Map<TravelTripDurationDays, string>();
    TRAVEL_DURATION_VALUES.forEach((value) => {
      map.set(value, t(`profile.travelDuration.${value}`, { defaultValue: TRAVEL_DURATION_FALLBACK_LABELS[value] }));
    });
    return map;
  }, [t]);

  const travelRegionLabelByValue = useMemo(() => {
    const map = new Map<string, string>();
    TRAVEL_REGION_OPTIONS.forEach((option) => {
      map.set(option.value, t(option.translationKey, { defaultValue: option.defaultLabel }));
    });
    return map;
  }, [t]);

  const travelStyleLabelByValue = useMemo(() => {
    const map = new Map<string, string>();
    TRAVEL_STYLE_OPTIONS.forEach((option) => {
      map.set(option.value, t(option.translationKey, { defaultValue: option.defaultLabel }));
    });
    return map;
  }, [t]);

  const travelSeasonLabelByValue = useMemo(() => {
    const map = new Map<string, string>();
    TRAVEL_SEASON_OPTIONS.forEach((option) => {
      map.set(option.value, t(option.translationKey, { defaultValue: option.defaultLabel }));
    });
    return map;
  }, [t]);

  const travelSeasonDisplayLabel = travelSeason
    ? travelSeasonLabelByValue.get(travelSeason) ?? travelSeason
    : null;
  const originalTravelSeasonDisplayLabel = originalTravelSeason
    ? travelSeasonLabelByValue.get(originalTravelSeason) ?? originalTravelSeason
    : null;

  const travelDurationDisplayLabel = travelDuration
    ? travelDurationLabelByValue.get(travelDuration) ?? TRAVEL_DURATION_FALLBACK_LABELS[travelDuration]
    : null;
  const travelDurationProfileLabel = isTravelDurationValue(profile?.travel_avg_trip_duration_days)
    ? travelDurationLabelByValue.get(profile?.travel_avg_trip_duration_days) ??
      TRAVEL_DURATION_FALLBACK_LABELS[profile?.travel_avg_trip_duration_days]
    : null;

  const travelFrequencyDisplayLabel = travelFrequency
    ? travelFrequencyLabelByValue.get(travelFrequency) ?? TRAVEL_FREQUENCY_FALLBACK_LABELS[travelFrequency]
    : null;
  const travelFrequencyProfileLabel = isTravelFrequencyValue(profile?.travel_frequency_per_year)
    ? travelFrequencyLabelByValue.get(profile?.travel_frequency_per_year) ??
      TRAVEL_FREQUENCY_FALLBACK_LABELS[profile?.travel_frequency_per_year]
    : null;

  const travelRegionsDisplayLabels = useMemo(
    () => travelRegions.map((code) => travelRegionLabelByValue.get(code) ?? code),
    [travelRegions, travelRegionLabelByValue]
  );
  const originalTravelRegionsDisplayLabels = useMemo(
    () => originalTravelRegions.map((code) => travelRegionLabelByValue.get(code) ?? code),
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

  const availableTravelRegions = useMemo(() => {
    const chosen = new Set(travelRegions);
    return TRAVEL_REGION_OPTIONS.filter((option) => !chosen.has(option.value)).map((option) => ({
      value: option.value,
      label: travelRegionLabelByValue.get(option.value) ?? option.defaultLabel,
    }));
  }, [travelRegions, travelRegionLabelByValue]);

  const availableTravelStyles = useMemo(() => {
    const chosen = new Set(travelStyles);
    return TRAVEL_STYLE_OPTIONS.filter((option) => !chosen.has(option.value)).map((option) => ({
      value: option.value,
      label: travelStyleLabelByValue.get(option.value) ?? option.defaultLabel,
    }));
  }, [travelStyleLabelByValue, travelStyles]);

  const availableTravelSeasons = useMemo(() => {
    if (travelSeason) {
      return [];
    }
    return TRAVEL_SEASON_OPTIONS.map((option) => ({
      value: option.value,
      label: travelSeasonLabelByValue.get(option.value) ?? option.defaultLabel,
    }));
  }, [travelSeason, travelSeasonLabelByValue]);

  const isTravelFrequencyDirty = travelFrequency !== originalTravelFrequency;
  const isTravelDurationDirty = travelDuration !== originalTravelDuration;
  const isTravelCountriesVisitedDirty =
    travelCountriesVisited.trim() !== (originalTravelCountriesVisited !== null ? String(originalTravelCountriesVisited) : '');
  const isTravelRegionsDirty =
    travelRegions.length !== originalTravelRegions.length ||
    travelRegions.some((item, index) => item !== originalTravelRegions[index]);
  const isTravelStylesDirty =
    travelStyles.length !== originalTravelStyles.length ||
    travelStyles.some((item, index) => item !== originalTravelStyles[index]);
  const isTravelSeasonDirty = travelSeason !== originalTravelSeason;

  const isTravelDirty =
    isTravelFrequencyDirty ||
    isTravelDurationDirty ||
    isTravelCountriesVisitedDirty ||
    isTravelRegionsDirty ||
    isTravelStylesDirty ||
    isTravelSeasonDirty;

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

  const handleRemoveTravelRegion = (value: string) => {
    const normalized = value.toUpperCase();
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

  const handleRemoveTravelStyle = (value: string) => {
    const normalized = value.toLowerCase();
    setTravelStyles((prev) => normalizeStyles(prev.filter((item) => item !== normalized)));
    setTravelSaved(false);
    setTravelSaveError(null);
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

      const normalizedFrequency = travelFrequency;
      const normalizedDuration = travelDuration;
      const normalizedCountriesVisited = travelCountriesVisited.trim();
      const normalizedRegions = normalizeRegions(travelRegions);
      const normalizedStyles = normalizeStyles(travelStyles);
      const normalizedSeason = travelSeason ?? null;

      if (isTravelFrequencyDirty) {
        payload.travel_frequency_per_year = normalizedFrequency;
      }

      if (isTravelDurationDirty) {
        payload.travel_avg_trip_duration_days = normalizedDuration;
      }

      if (isTravelCountriesVisitedDirty) {
        payload.travel_countries_visited_count =
          normalizedCountriesVisited.length > 0
            ? Number.parseInt(normalizedCountriesVisited, 10)
            : null;
      }

      if (isTravelRegionsDirty) {
        payload.travel_regions_often_visited = normalizedRegions.length > 0 ? normalizedRegions : null;
      }

      if (isTravelStylesDirty) {
        payload.travel_usual_travel_styles = normalizedStyles.length > 0 ? normalizedStyles : null;
      }

      if (isTravelSeasonDirty) {
        payload.travel_seasonality_preference = normalizedSeason ? [normalizedSeason] : null;
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

      await refreshProfile();
      setIsEditingTravel(false);
      setTravelSaved(true);
      setOriginalTravelFrequency(normalizedFrequency ?? null);
      setOriginalTravelDuration(normalizedDuration ?? null);
      setOriginalTravelCountriesVisited(
        normalizedCountriesVisited.length > 0 ? Number.parseInt(normalizedCountriesVisited, 10) : null
      );
      setOriginalTravelRegions(normalizedRegions);
      setOriginalTravelStyles(normalizedStyles);
      setOriginalTravelSeason(normalizedSeason);
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

  const fallbackLabel = t('profile.fallback.notSet');

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/60 p-6 shadow dark:border-slate-800/60 dark:bg-slate-900/60">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-lg font-semibold">{t('profile.sections.travel')}</h2>
        {isEditingTravel ? (
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
        )}
      </div>
      {travelSaveError ? <p className="text-xs text-red-500">{travelSaveError}</p> : null}
      {!travelSaveError && travelSaved ? (
        <p className="text-xs text-emerald-600">
          {t('profile.state.settingsSaved', { defaultValue: 'Your settings have been saved.' })}
        </p>
      ) : null}
      <dl className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <dt className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
            {t('profile.fields.travelFrequency')}
          </dt>
          <dd className="text-sm font-medium text-[var(--text-primary)]">
            {isEditingTravel ? (
              <Combobox
                value={travelFrequency}
                onChange={(value: TravelFrequencyPerYear | null) => {
                  setTravelFrequency(value);
                  setTravelSaved(false);
                  setTravelSaveError(null);
                }}
              >
                <div className="relative">
                  <Combobox.Button className="flex w-60 max-w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary/30 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                    <span className={travelFrequency ? '' : 'text-[var(--text-secondary)] dark:text-slate-400'}>
                      {travelFrequencyDisplayLabel ??
                        travelFrequencyProfileLabel ??
                        t('profile.actions.selectTravelFrequency', { defaultValue: 'Select frequency' })}
                    </span>
                    <ChevronUpDownIcon className="h-5 w-5 text-slate-500" aria-hidden="true" />
                  </Combobox.Button>
                  <Combobox.Options className="absolute z-10 mt-2 max-h-56 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-lg focus:outline-none dark:border-slate-700 dark:bg-slate-900">
                    <Combobox.Option
                      value={null}
                      className={({ active }) =>
                        `cursor-pointer px-3 py-2 ${
                          active
                            ? 'bg-brand-secondary/10 text-brand-secondary dark:bg-brand-secondary/20 dark:text-brand-secondary'
                            : 'text-[var(--text-primary)]'
                        }`
                      }
                    >
                      {t('profile.actions.selectTravelFrequency', { defaultValue: 'Select frequency' })}
                    </Combobox.Option>
                    {TRAVEL_FREQUENCY_VALUES.map((value) => (
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
                        {travelFrequencyLabelByValue.get(value) ?? TRAVEL_FREQUENCY_FALLBACK_LABELS[value]}
                      </Combobox.Option>
                    ))}
                  </Combobox.Options>
                </div>
              </Combobox>
            ) : (
              travelFrequencyProfileLabel ?? fallbackLabel
            )}
          </dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
            {t('profile.fields.tripDuration')}
          </dt>
          <dd className="text-sm font-medium text-[var(--text-primary)]">
            {isEditingTravel ? (
              <Combobox
                value={travelDuration}
                onChange={(value: TravelTripDurationDays | null) => {
                  setTravelDuration(value);
                  setTravelSaved(false);
                  setTravelSaveError(null);
                }}
              >
                <div className="relative">
                  <Combobox.Button className="flex w-60 max-w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary/30 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                    <span className={travelDuration ? '' : 'text-[var(--text-secondary)] dark:text-slate-400'}>
                      {travelDurationDisplayLabel ??
                        travelDurationProfileLabel ??
                        t('profile.actions.selectTravelDuration', { defaultValue: 'Select duration' })}
                    </span>
                    <ChevronUpDownIcon className="h-5 w-5 text-slate-500" aria-hidden="true" />
                  </Combobox.Button>
                  <Combobox.Options className="absolute z-10 mt-2 max-h-56 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-lg focus:outline-none dark:border-slate-700 dark:bg-slate-900">
                    <Combobox.Option
                      value={null}
                      className={({ active }) =>
                        `cursor-pointer px-3 py-2 ${
                          active
                            ? 'bg-brand-secondary/10 text-brand-secondary dark:bg-brand-secondary/20 dark:text-brand-secondary'
                            : 'text-[var(--text-primary)]'
                        }`
                      }
                    >
                      {t('profile.actions.selectTravelDuration', { defaultValue: 'Select duration' })}
                    </Combobox.Option>
                    {TRAVEL_DURATION_VALUES.map((value) => (
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
                        {travelDurationLabelByValue.get(value) ?? TRAVEL_DURATION_FALLBACK_LABELS[value]}
                      </Combobox.Option>
                    ))}
                  </Combobox.Options>
                </div>
              </Combobox>
            ) : (
              travelDurationProfileLabel ?? fallbackLabel
            )}
          </dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
            {t('profile.fields.countriesVisited')}
          </dt>
          <dd className="text-sm font-medium text-[var(--text-primary)]">
            {isEditingTravel ? (
              <input
                type="number"
                min={0}
                value={travelCountriesVisited}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  setTravelCountriesVisited(event.target.value);
                  setTravelSaved(false);
                  setTravelSaveError(null);
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                placeholder="0"
              />
            ) : originalTravelCountriesVisited !== null ? (
              originalTravelCountriesVisited
            ) : (
              fallbackLabel
            )}
          </dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
            {t('profile.fields.travelSeasonality')}
          </dt>
          <dd className="text-sm font-medium text-[var(--text-primary)]">
            {isEditingTravel ? (
              <Combobox
                value={travelSeason}
                onChange={(value: string | null) => {
                  setTravelSeason(value);
                  setTravelSaved(false);
                  setTravelSaveError(null);
                }}
              >
                <div className="relative">
                  <Combobox.Button className="flex w-60 max-w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary/30 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                    <span className={travelSeason ? '' : 'text-[var(--text-secondary)] dark:text-slate-400'}>
                      {travelSeasonDisplayLabel ??
                        travelSeasonLabelByValue.get(originalTravelSeason ?? '') ??
                        fallbackLabel}
                    </span>
                    <ChevronUpDownIcon className="h-5 w-5 text-slate-500" aria-hidden="true" />
                  </Combobox.Button>
                  {availableTravelSeasons.length > 0 ? (
                    <Combobox.Options className="absolute z-10 mt-2 max-h-56 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-lg focus:outline-none dark:border-slate-700 dark:bg-slate-900">
                      <Combobox.Option
                        value={null}
                        className={({ active }) =>
                          `cursor-pointer px-3 py-2 ${
                            active
                              ? 'bg-brand-secondary/10 text-brand-secondary dark:bg-brand-secondary/20 dark:text-brand-secondary'
                              : 'text-[var(--text-primary)]'
                          }`
                        }
                      >
                        {t('profile.actions.selectTravelSeason', { defaultValue: 'Select season' })}
                      </Combobox.Option>
                      {TRAVEL_SEASON_OPTIONS.map((option) => (
                        <Combobox.Option
                          key={option.value}
                          value={option.value}
                          className={({ active }) =>
                            `cursor-pointer px-3 py-2 ${
                              active
                                ? 'bg-brand-secondary/10 text-brand-secondary dark:bg-brand-secondary/20 dark:text-brand-secondary'
                                : 'text-[var(--text-primary)]'
                            }`
                          }
                        >
                          {travelSeasonLabelByValue.get(option.value) ?? option.defaultLabel}
                        </Combobox.Option>
                      ))}
                    </Combobox.Options>
                  ) : null}
                </div>
              </Combobox>
            ) : (
              originalTravelSeasonDisplayLabel ?? fallbackLabel
            )}
          </dd>
        </div>
        <div className="flex flex-col gap-1 md:col-span-2">
          <dt className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
            {t('profile.fields.travelStyles')}
          </dt>
          <dd className="text-sm font-medium text-[var(--text-primary)]">
            {isEditingTravel ? (
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                  {travelStyles.length === 0 ? (
                    <span className="text-xs text-[var(--text-secondary)]">{fallbackLabel}</span>
                  ) : (
                    travelStyles.map((style, index) => (
                      <span
                        key={style}
                        className="flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                      >
                        {travelStylesDisplayLabels[index]}
                        <button
                          type="button"
                          onClick={() => handleRemoveTravelStyle(style)}
                          className="text-slate-400 transition hover:text-red-500"
                          aria-label={t('profile.actions.removeTravelStyle', {
                            defaultValue: 'Remove travel style',
                          })}
                          disabled={savingTravel}
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
                      value={travelStyleToAdd || null}
                      onChange={(value: string | null) => {
                        setTravelStyleToAdd(value ?? '');
                      }}
                      disabled={savingTravel || availableTravelStyles.length === 0}
                    >
                      <div className="relative">
                        <Combobox.Button className="flex w-60 max-w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary/30 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                          <span
                            className={
                              travelStyleToAdd ? '' : 'text-[var(--text-secondary)] dark:text-slate-400'
                            }
                          >
                            {travelStyleToAdd
                              ? travelStyleLabelByValue.get(travelStyleToAdd) ?? travelStyleToAdd
                              : availableTravelStyles.length === 0
                              ? t('profile.state.emptyOptions', { defaultValue: 'No options available.' })
                              : t('profile.actions.selectTravelStyle', { defaultValue: 'Select style' })}
                          </span>
                          <ChevronUpDownIcon className="h-5 w-5 text-slate-500" aria-hidden="true" />
                        </Combobox.Button>
                        {availableTravelStyles.length > 0 ? (
                          <Combobox.Options className="absolute z-10 mt-2 max-h-56 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-lg focus:outline-none dark:border-slate-700 dark:bg-slate-900">
                            {availableTravelStyles.map((option) => (
                              <Combobox.Option
                                key={option.value}
                                value={option.value}
                                className={({ active }) =>
                                  `cursor-pointer px-3 py-2 ${
                                    active
                                      ? 'bg-brand-secondary/10 text-brand-secondary dark:bg-brand-secondary/20 dark:text-brand-secondary'
                                      : 'text-[var(--text-primary)]'
                                  }`
                                }
                              >
                                {option.label}
                              </Combobox.Option>
                            ))}
                          </Combobox.Options>
                        ) : null}
                      </div>
                    </Combobox>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddTravelStyle}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-secondary text-lg font-semibold text-brand-secondary transition hover:bg-brand-secondary hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!travelStyleToAdd}
                    aria-label={t('profile.actions.addTravelStyle', { defaultValue: 'Add travel style' })}
                  >
                    +
                  </button>
                </div>
              </div>
            ) : originalTravelStyles.length === 0 ? (
              <span className="text-xs text-[var(--text-secondary)]">{fallbackLabel}</span>
            ) : (
              <div className="flex flex-wrap gap-2">
                {originalTravelStyles.map((style, index) => (
                  <span
                    key={style}
                    className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                  >
                    {originalTravelStylesDisplayLabels[index]}
                  </span>
                ))}
              </div>
            )}
          </dd>
        </div>
        <div className="flex flex-col gap-1 md:col-span-2">
          <dt className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
            {t('profile.fields.regionsVisited')}
          </dt>
          <dd className="text-sm font-medium text-[var(--text-primary)]">
            {isEditingTravel ? (
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                  {travelRegions.length === 0 ? (
                    <span className="text-xs text-[var(--text-secondary)]">{fallbackLabel}</span>
                  ) : (
                    travelRegions.map((region, index) => (
                      <span
                        key={region}
                        className="flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                      >
                        {travelRegionsDisplayLabels[index]}
                        <button
                          type="button"
                          onClick={() => handleRemoveTravelRegion(region)}
                          className="text-slate-400 transition hover:text-red-500"
                          aria-label={t('profile.actions.removeTravelRegion', {
                            defaultValue: 'Remove travel region',
                          })}
                          disabled={savingTravel}
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
                      value={travelRegionToAdd || null}
                      onChange={(value: string | null) => {
                        setTravelRegionToAdd(value ?? '');
                      }}
                      disabled={savingTravel || availableTravelRegions.length === 0}
                    >
                      <div className="relative">
                        <Combobox.Button className="flex w-60 items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary/30 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                          <span
                            className={
                              travelRegionToAdd ? '' : 'text-[var(--text-secondary)] dark:text-slate-400'
                            }
                          >
                            {travelRegionToAdd
                              ? travelRegionLabelByValue.get(travelRegionToAdd) ?? travelRegionToAdd
                              : availableTravelRegions.length === 0
                              ? t('profile.state.emptyOptions', { defaultValue: 'No options available.' })
                              : t('profile.actions.selectTravelRegion', { defaultValue: 'Select region' })}
                          </span>
                          <ChevronUpDownIcon className="h-5 w-5 text-slate-500" aria-hidden="true" />
                        </Combobox.Button>
                        {availableTravelRegions.length > 0 ? (
                          <Combobox.Options className="absolute z-10 mt-2 max-h-56 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-lg focus:outline-none dark:border-slate-700 dark:bg-slate-900">
                            <Combobox.Option
                              value={null}
                              className={({ active }) =>
                                `cursor-pointer px-3 py-2 ${
                                  active
                                    ? 'bg-brand-secondary/10 text-brand-secondary dark:bg-brand-secondary/20 dark:text-brand-secondary'
                                    : 'text-[var(--text-primary)]'
                                }`
                              }
                            >
                              {t('profile.actions.selectTravelRegion', { defaultValue: 'Select region' })}
                            </Combobox.Option>
                            {availableTravelRegions.map((option) => (
                              <Combobox.Option
                                key={option.value}
                                value={option.value}
                                className={({ active }) =>
                                  `cursor-pointer px-3 py-2 ${
                                    active
                                      ? 'bg-brand-secondary/10 text-brand-secondary dark:bg-brand-secondary/20 dark:text-brand-secondary'
                                      : 'text-[var(--text-primary)]'
                                  }`
                                }
                              >
                                {option.label}
                              </Combobox.Option>
                            ))}
                          </Combobox.Options>
                        ) : null}
                      </div>
                    </Combobox>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddTravelRegion}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-secondary text-lg font-semibold text-brand-secondary transition hover:bg-brand-secondary hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!travelRegionToAdd}
                    aria-label={t('profile.actions.addTravelRegion', { defaultValue: 'Add travel region' })}
                  >
                    +
                  </button>
                </div>
              </div>
            ) : originalTravelRegions.length === 0 ? (
              <span className="text-xs text-[var(--text-secondary)]">{fallbackLabel}</span>
            ) : (
              <div className="flex flex-wrap gap-2">
                {originalTravelRegions.map((region, index) => (
                  <span
                    key={region}
                    className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                  >
                    {originalTravelRegionsDisplayLabels[index]}
                  </span>
                ))}
              </div>
            )}
          </dd>
        </div>
      </dl>
    </article>
  );
};

export default ProfileTravelSection;
