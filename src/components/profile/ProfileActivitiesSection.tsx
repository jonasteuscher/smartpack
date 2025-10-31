import { useEffect, useMemo, useState } from 'react';
import { Combobox } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/20/solid';
import type { User } from '@supabase/supabase-js';
import { useTranslation } from 'react-i18next';
import { updateRecord } from '@/services/supabaseCrud';
import type { Profile } from '@/types/profile';

interface ActivityOption {
  value: string;
  translationKey: string;
  defaultLabel: string;
  emoji: string;
}

const ACTIVITY_SPORTS_OPTIONS: readonly ActivityOption[] = [
  { value: 'hiking', translationKey: 'profile.activities.sports.hiking', defaultLabel: '🥾 Hiking', emoji: '🥾' },
  {
    value: 'trekking',
    translationKey: 'profile.activities.sports.trekking',
    defaultLabel: '⛰️ Trekking & mountain tours',
    emoji: '⛰️',
  },
  {
    value: 'trailrunning',
    translationKey: 'profile.activities.sports.trailrunning',
    defaultLabel: '🏃 Trail running',
    emoji: '🏃',
  },
  {
    value: 'climbing_bouldering',
    translationKey: 'profile.activities.sports.climbing_bouldering',
    defaultLabel: '🧗 Climbing & bouldering',
    emoji: '🧗',
  },
  {
    value: 'via_ferrata',
    translationKey: 'profile.activities.sports.via_ferrata',
    defaultLabel: '🧗‍♂️ Via ferrata',
    emoji: '🧗‍♂️',
  },
  {
    value: 'mtb',
    translationKey: 'profile.activities.sports.mtb',
    defaultLabel: '🚵 Mountain biking',
    emoji: '🚵',
  },
  {
    value: 'road_gravel',
    translationKey: 'profile.activities.sports.road_gravel',
    defaultLabel: '🚴 Road & gravel cycling',
    emoji: '🚴',
  },
  {
    value: 'running',
    translationKey: 'profile.activities.sports.running',
    defaultLabel: '🏃‍♀️ Running & jogging',
    emoji: '🏃‍♀️',
  },
  {
    value: 'snowsport',
    translationKey: 'profile.activities.sports.snowsport',
    defaultLabel: '🎿 Ski & snowboard',
    emoji: '🎿',
  },
  {
    value: 'xc_skiing',
    translationKey: 'profile.activities.sports.xc_skiing',
    defaultLabel: '⛷️ Cross-country skiing',
    emoji: '⛷️',
  },
  {
    value: 'snowshoeing',
    translationKey: 'profile.activities.sports.snowshoeing',
    defaultLabel: '🥾 Snowshoeing',
    emoji: '🥾',
  },
  {
    value: 'paddle_sports',
    translationKey: 'profile.activities.sports.paddle_sports',
    defaultLabel: '🛶 SUP & kayaking',
    emoji: '🛶',
  },
  {
    value: 'surf_kite',
    translationKey: 'profile.activities.sports.surf_kite',
    defaultLabel: '🏄 Surfing & kitesurfing',
    emoji: '🏄',
  },
  {
    value: 'swimming',
    translationKey: 'profile.activities.sports.swimming',
    defaultLabel: '🏊 Swimming',
    emoji: '🏊',
  },
  {
    value: 'diving_snorkeling',
    translationKey: 'profile.activities.sports.diving_snorkeling',
    defaultLabel: '🤿 Diving & snorkeling',
    emoji: '🤿',
  },
  {
    value: 'gym',
    translationKey: 'profile.activities.sports.gym',
    defaultLabel: '🏋️ Gym workouts',
    emoji: '🏋️',
  },
  {
    value: 'yoga_pilates',
    translationKey: 'profile.activities.sports.yoga_pilates',
    defaultLabel: '🧘 Yoga & Pilates',
    emoji: '🧘',
  },
  {
    value: 'team_sports',
    translationKey: 'profile.activities.sports.team_sports',
    defaultLabel: '⚽ Team sports',
    emoji: '⚽',
  },
  {
    value: 'golf',
    translationKey: 'profile.activities.sports.golf',
    defaultLabel: '⛳ Golf',
    emoji: '⛳',
  },
  {
    value: 'tennis',
    translationKey: 'profile.activities.sports.tennis',
    defaultLabel: '🎾 Tennis & racket sports',
    emoji: '🎾',
  },
  {
    value: 'equestrian',
    translationKey: 'profile.activities.sports.equestrian',
    defaultLabel: '🐎 Horseback riding',
    emoji: '🐎',
  },
];

const ACTIVITY_ADVENTURE_OPTIONS: readonly ActivityOption[] = [
  {
    value: 'camping',
    translationKey: 'profile.activities.adventure.camping',
    defaultLabel: '⛺ Camping & bivouac',
    emoji: '⛺',
  },
  {
    value: 'vanlife',
    translationKey: 'profile.activities.adventure.vanlife',
    defaultLabel: '🚐 Vanlife & road trips',
    emoji: '🚐',
  },
  {
    value: 'wildlife_safaris',
    translationKey: 'profile.activities.adventure.wildlife_safaris',
    defaultLabel: '🦁 Wildlife safaris',
    emoji: '🦁',
  },
  {
    value: 'boat_sailing',
    translationKey: 'profile.activities.adventure.boat_sailing',
    defaultLabel: '⛵ Sailing & boating',
    emoji: '⛵',
  },
  {
    value: 'cruise',
    translationKey: 'profile.activities.adventure.cruise',
    defaultLabel: '🚢 Cruise trips',
    emoji: '🚢',
  },
  {
    value: 'island_hopping',
    translationKey: 'profile.activities.adventure.island_hopping',
    defaultLabel: '🏝️ Island hopping',
    emoji: '🏝️',
  },
  {
    value: 'scenic_drives',
    translationKey: 'profile.activities.adventure.scenic_drives',
    defaultLabel: '🛣️ Scenic drives',
    emoji: '🛣️',
  },
  {
    value: 'offroad',
    translationKey: 'profile.activities.adventure.offroad',
    defaultLabel: '🚙 Off-road adventures',
    emoji: '🚙',
  },
  {
    value: 'desert_tours',
    translationKey: 'profile.activities.adventure.desert_tours',
    defaultLabel: '🏜️ Desert tours',
    emoji: '🏜️',
  },
  {
    value: 'rainforest',
    translationKey: 'profile.activities.adventure.rainforest',
    defaultLabel: '🌴 Rainforest adventures',
    emoji: '🌴',
  },
  {
    value: 'arctic',
    translationKey: 'profile.activities.adventure.arctic',
    defaultLabel: '❄️ Arctic & polar expeditions',
    emoji: '❄️',
  },
  {
    value: 'volcanoes',
    translationKey: 'profile.activities.adventure.volcanoes',
    defaultLabel: '🌋 Volcano tours',
    emoji: '🌋',
  },
  {
    value: 'hot_air_balloon',
    translationKey: 'profile.activities.adventure.hot_air_balloon',
    defaultLabel: '🎈 Hot-air ballooning',
    emoji: '🎈',
  },
  {
    value: 'paragliding',
    translationKey: 'profile.activities.adventure.paragliding',
    defaultLabel: '🪂 Paragliding',
    emoji: '🪂',
  },
  {
    value: 'skydiving',
    translationKey: 'profile.activities.adventure.skydiving',
    defaultLabel: '🪂 Skydiving',
    emoji: '🪂',
  },
  {
    value: 'ziplining',
    translationKey: 'profile.activities.adventure.ziplining',
    defaultLabel: '🚡 Ziplining',
    emoji: '🚡',
  },
  {
    value: 'caving',
    translationKey: 'profile.activities.adventure.caving',
    defaultLabel: '🕳️ Caving & spelunking',
    emoji: '🕳️',
  },
  {
    value: 'wild_swimming',
    translationKey: 'profile.activities.adventure.wild_swimming',
    defaultLabel: '🏞️ Wild swimming',
    emoji: '🏞️',
  },
  {
    value: 'stargazing',
    translationKey: 'profile.activities.adventure.stargazing',
    defaultLabel: '✨ Stargazing',
    emoji: '✨',
  },
  {
    value: 'photo_travel',
    translationKey: 'profile.activities.adventure.photo_travel',
    defaultLabel: '📸 Photo expeditions',
    emoji: '📸',
  },
];

const ACTIVITY_CULTURAL_OPTIONS: readonly ActivityOption[] = [
  {
    value: 'city_tours',
    translationKey: 'profile.activities.cultural.city_tours',
    defaultLabel: '🏙️ City tours',
    emoji: '🏙️',
  },
  {
    value: 'museums_galleries',
    translationKey: 'profile.activities.cultural.museums_galleries',
    defaultLabel: '🖼️ Museums & galleries',
    emoji: '🖼️',
  },
  {
    value: 'historical_sites',
    translationKey: 'profile.activities.cultural.historical_sites',
    defaultLabel: '🏰 Historical sites',
    emoji: '🏰',
  },
  {
    value: 'architecture_tours',
    translationKey: 'profile.activities.cultural.architecture_tours',
    defaultLabel: '🏛️ Architecture tours',
    emoji: '🏛️',
  },
  {
    value: 'performing_arts',
    translationKey: 'profile.activities.cultural.performing_arts',
    defaultLabel: '🎭 Theater, opera & ballet',
    emoji: '🎭',
  },
  {
    value: 'live_music',
    translationKey: 'profile.activities.cultural.live_music',
    defaultLabel: '🎶 Concerts & live music',
    emoji: '🎶',
  },
  {
    value: 'festivals',
    translationKey: 'profile.activities.cultural.festivals',
    defaultLabel: '🎉 Festivals',
    emoji: '🎉',
  },
  {
    value: 'local_markets',
    translationKey: 'profile.activities.cultural.local_markets',
    defaultLabel: '🛍️ Local markets',
    emoji: '🛍️',
  },
  {
    value: 'food_tours_cooking',
    translationKey: 'profile.activities.cultural.food_tours_cooking',
    defaultLabel: '🍜 Food tours & cooking classes',
    emoji: '🍜',
  },
  {
    value: 'wine_beer_tastings',
    translationKey: 'profile.activities.cultural.wine_beer_tastings',
    defaultLabel: '🍷 Wine & beer tastings',
    emoji: '🍷',
  },
  {
    value: 'religious_sites',
    translationKey: 'profile.activities.cultural.religious_sites',
    defaultLabel: '⛪ Religious sites',
    emoji: '⛪',
  },
  {
    value: 'street_art',
    translationKey: 'profile.activities.cultural.street_art',
    defaultLabel: '🎨 Street art & graffiti',
    emoji: '🎨',
  },
  {
    value: 'craft_workshops',
    translationKey: 'profile.activities.cultural.craft_workshops',
    defaultLabel: '🧵 Craft workshops',
    emoji: '🧵',
  },
  {
    value: 'cinema_film',
    translationKey: 'profile.activities.cultural.cinema_film',
    defaultLabel: '🎬 Cinema & film culture',
    emoji: '🎬',
  },
  {
    value: 'literature_bookshops',
    translationKey: 'profile.activities.cultural.literature_bookshops',
    defaultLabel: '📚 Literature & bookshops',
    emoji: '📚',
  },
  {
    value: 'wellness_spa',
    translationKey: 'profile.activities.cultural.wellness_spa',
    defaultLabel: '🧖 Wellness & spa',
    emoji: '🧖',
  },
  {
    value: 'family_kids',
    translationKey: 'profile.activities.cultural.family_kids',
    defaultLabel: '👨‍👩‍👧 Family & kids activities',
    emoji: '👨‍👩‍👧',
  },
  {
    value: 'shopping',
    translationKey: 'profile.activities.cultural.shopping',
    defaultLabel: '🛒 Shopping',
    emoji: '🛒',
  },
  {
    value: 'nightlife',
    translationKey: 'profile.activities.cultural.nightlife',
    defaultLabel: '🌙 Nightlife',
    emoji: '🌙',
  },
  {
    value: 'local_meetups',
    translationKey: 'profile.activities.cultural.local_meetups',
    defaultLabel: '🤝 Local meetups',
    emoji: '🤝',
  },
];

const normalizeActivitySports = (sports: string[]): string[] => {
  const allowedValues = new Map(
    ACTIVITY_SPORTS_OPTIONS.map((option, index) => [option.value, index])
  );
  const chosen = new Set(
    sports
      .map((sport) => (typeof sport === 'string' ? sport.trim().toLowerCase() : ''))
      .filter((sport) => sport.length > 0 && allowedValues.has(sport))
  );

  return ACTIVITY_SPORTS_OPTIONS.map((option) => option.value).filter((value) => chosen.has(value));
};

const normalizeActivityAdventures = (adventures: string[]): string[] => {
  const allowedValues = new Map(
    ACTIVITY_ADVENTURE_OPTIONS.map((option, index) => [option.value, index])
  );
  const chosen = new Set(
    adventures
      .map((activity) => (typeof activity === 'string' ? activity.trim().toLowerCase() : ''))
      .filter((activity) => activity.length > 0 && allowedValues.has(activity))
  );

  return ACTIVITY_ADVENTURE_OPTIONS.map((option) => option.value).filter((value) => chosen.has(value));
};

const normalizeActivityCultural = (activities: string[]): string[] => {
  const allowedValues = new Map(
    ACTIVITY_CULTURAL_OPTIONS.map((option, index) => [option.value, index])
  );
  const chosen = new Set(
    activities
      .map((activity) => (typeof activity === 'string' ? activity.trim().toLowerCase() : ''))
      .filter((activity) => activity.length > 0 && allowedValues.has(activity))
  );

  return ACTIVITY_CULTURAL_OPTIONS.map((option) => option.value).filter((value) => chosen.has(value));
};

interface ProfileActivitiesSectionProps {
  profile: Profile | null;
  user: User | null;
  refreshProfile: () => Promise<void>;
  refreshSignal: number;
  onEditingChange?: (isEditing: boolean) => void;
}

const ProfileActivitiesSection = ({
  profile,
  user,
  refreshProfile,
  refreshSignal,
  onEditingChange,
}: ProfileActivitiesSectionProps) => {
  const { t } = useTranslation('dashboard');

  const [activitySports, setActivitySports] = useState<string[]>([]);
  const [originalActivitySports, setOriginalActivitySports] = useState<string[]>([]);
  const [activitySportToAdd, setActivitySportToAdd] = useState('');
  const [activityAdventure, setActivityAdventure] = useState<string[]>([]);
  const [originalActivityAdventure, setOriginalActivityAdventure] = useState<string[]>([]);
  const [activityAdventureToAdd, setActivityAdventureToAdd] = useState('');
  const [activityCultural, setActivityCultural] = useState<string[]>([]);
  const [originalActivityCultural, setOriginalActivityCultural] = useState<string[]>([]);
  const [activityCulturalToAdd, setActivityCulturalToAdd] = useState('');
  const [isEditingActivities, setIsEditingActivities] = useState(false);
  const [savingActivities, setSavingActivities] = useState(false);
  const [activitiesSaveError, setActivitiesSaveError] = useState<string | null>(null);
  const [activitiesSaved, setActivitiesSaved] = useState(false);

  useEffect(() => {
    onEditingChange?.(isEditingActivities);
  }, [isEditingActivities, onEditingChange]);

  useEffect(() => {
    setActivitiesSaved(false);
    setActivitiesSaveError(null);
  }, [refreshSignal]);

  useEffect(() => {
    const sportsArray = Array.isArray(profile?.activity_sports_outdoor)
      ? normalizeActivitySports(profile.activity_sports_outdoor as string[])
      : [];

    setOriginalActivitySports(sportsArray);

    if (!isEditingActivities) {
      setActivitySports(sportsArray);
      setActivitySportToAdd('');
    }
  }, [profile?.activity_sports_outdoor, isEditingActivities]);

  useEffect(() => {
    const adventureArray = Array.isArray(profile?.activity_adventure_activities)
      ? normalizeActivityAdventures(profile.activity_adventure_activities as string[])
      : [];

    setOriginalActivityAdventure(adventureArray);

    if (!isEditingActivities) {
      setActivityAdventure(adventureArray);
      setActivityAdventureToAdd('');
    }
  }, [profile?.activity_adventure_activities, isEditingActivities]);

  useEffect(() => {
    const culturalArray = Array.isArray(profile?.activity_cultural_activities)
      ? normalizeActivityCultural(profile.activity_cultural_activities as string[])
      : [];

    setOriginalActivityCultural(culturalArray);

    if (!isEditingActivities) {
      setActivityCultural(culturalArray);
      setActivityCulturalToAdd('');
    }
  }, [profile?.activity_cultural_activities, isEditingActivities]);

  const activitySportsLabelByValue = useMemo(() => {
    const map = new Map<string, string>();
    ACTIVITY_SPORTS_OPTIONS.forEach((option) => {
      map.set(option.value, t(option.translationKey, { defaultValue: `${option.emoji} ${option.defaultLabel}` }));
    });
    return map;
  }, [t]);

  const activityAdventureLabelByValue = useMemo(() => {
    const map = new Map<string, string>();
    ACTIVITY_ADVENTURE_OPTIONS.forEach((option) => {
      map.set(option.value, t(option.translationKey, { defaultValue: `${option.emoji} ${option.defaultLabel}` }));
    });
    return map;
  }, [t]);

  const activityCulturalLabelByValue = useMemo(() => {
    const map = new Map<string, string>();
    ACTIVITY_CULTURAL_OPTIONS.forEach((option) => {
      map.set(option.value, t(option.translationKey, { defaultValue: `${option.emoji} ${option.defaultLabel}` }));
    });
    return map;
  }, [t]);

  const availableActivitySports = useMemo(() => {
    const chosen = new Set(activitySports);
    return ACTIVITY_SPORTS_OPTIONS.filter((option) => !chosen.has(option.value)).map((option) => ({
      value: option.value,
      label: activitySportsLabelByValue.get(option.value) ?? option.defaultLabel,
    }));
  }, [activitySports, activitySportsLabelByValue]);

  const availableActivityAdventure = useMemo(() => {
    const chosen = new Set(activityAdventure);
    return ACTIVITY_ADVENTURE_OPTIONS.filter((option) => !chosen.has(option.value)).map((option) => ({
      value: option.value,
      label: activityAdventureLabelByValue.get(option.value) ?? option.defaultLabel,
    }));
  }, [activityAdventure, activityAdventureLabelByValue]);

  const availableActivityCultural = useMemo(() => {
    const chosen = new Set(activityCultural);
    return ACTIVITY_CULTURAL_OPTIONS.filter((option) => !chosen.has(option.value)).map((option) => ({
      value: option.value,
      label: activityCulturalLabelByValue.get(option.value) ?? option.defaultLabel,
    }));
  }, [activityCultural, activityCulturalLabelByValue]);

  const activitySportsDisplayLabels = useMemo(
    () => activitySports.map((value) => activitySportsLabelByValue.get(value) ?? value),
    [activitySports, activitySportsLabelByValue]
  );
  const originalActivitySportsDisplayLabels = useMemo(
    () => originalActivitySports.map((value) => activitySportsLabelByValue.get(value) ?? value),
    [activitySportsLabelByValue, originalActivitySports]
  );

  const activityAdventureDisplayLabels = useMemo(
    () => activityAdventure.map((value) => activityAdventureLabelByValue.get(value) ?? value),
    [activityAdventure, activityAdventureLabelByValue]
  );
  const originalActivityAdventureDisplayLabels = useMemo(
    () => originalActivityAdventure.map((value) => activityAdventureLabelByValue.get(value) ?? value),
    [activityAdventureLabelByValue, originalActivityAdventure]
  );

  const activityCulturalDisplayLabels = useMemo(
    () => activityCultural.map((value) => activityCulturalLabelByValue.get(value) ?? value),
    [activityCultural, activityCulturalLabelByValue]
  );
  const originalActivityCulturalDisplayLabels = useMemo(
    () => originalActivityCultural.map((value) => activityCulturalLabelByValue.get(value) ?? value),
    [activityCulturalLabelByValue, originalActivityCultural]
  );

  const isActivitySportsDirty =
    activitySports.length !== originalActivitySports.length ||
    activitySports.some((item, index) => item !== originalActivitySports[index]);
  const isActivityAdventureDirty =
    activityAdventure.length !== originalActivityAdventure.length ||
    activityAdventure.some((item, index) => item !== originalActivityAdventure[index]);
  const isActivityCulturalDirty =
    activityCultural.length !== originalActivityCultural.length ||
    activityCultural.some((item, index) => item !== originalActivityCultural[index]);

  const isActivitiesDirty =
    isActivitySportsDirty || isActivityAdventureDirty || isActivityCulturalDirty;

  const handleStartEditingActivities = () => {
    setIsEditingActivities(true);
    setActivitiesSaved(false);
    setActivitiesSaveError(null);
    setActivitySports(originalActivitySports);
    setActivitySportToAdd('');
    setActivityAdventure(originalActivityAdventure);
    setActivityAdventureToAdd('');
    setActivityCultural(originalActivityCultural);
    setActivityCulturalToAdd('');
  };

  const handleCancelEditingActivities = () => {
    setIsEditingActivities(false);
    setActivitiesSaved(false);
    setActivitiesSaveError(null);
    setActivitySports(originalActivitySports);
    setActivitySportToAdd('');
    setActivityAdventure(originalActivityAdventure);
    setActivityAdventureToAdd('');
    setActivityCultural(originalActivityCultural);
    setActivityCulturalToAdd('');
  };

  const handleAddActivitySport = () => {
    if (!activitySportToAdd) {
      return;
    }

    const normalized = activitySportToAdd.toLowerCase();
    if (activitySports.includes(normalized)) {
      setActivitySportToAdd('');
      return;
    }

    setActivitySports((prev) => normalizeActivitySports([...prev, normalized]));
    setActivitySportToAdd('');
    setActivitiesSaved(false);
    setActivitiesSaveError(null);
  };

  const handleRemoveActivitySport = (value: string) => {
    const normalized = value.toLowerCase();
    setActivitySports((prev) => normalizeActivitySports(prev.filter((item) => item !== normalized)));
    setActivitiesSaved(false);
    setActivitiesSaveError(null);
  };

  const handleAddActivityAdventure = () => {
    if (!activityAdventureToAdd) {
      return;
    }

    const normalized = activityAdventureToAdd.toLowerCase();
    if (activityAdventure.includes(normalized)) {
      setActivityAdventureToAdd('');
      return;
    }

    setActivityAdventure((prev) => normalizeActivityAdventures([...prev, normalized]));
    setActivityAdventureToAdd('');
    setActivitiesSaved(false);
    setActivitiesSaveError(null);
  };

  const handleRemoveActivityAdventure = (value: string) => {
    const normalized = value.toLowerCase();
    setActivityAdventure((prev) =>
      normalizeActivityAdventures(prev.filter((item) => item !== normalized))
    );
    setActivitiesSaved(false);
    setActivitiesSaveError(null);
  };

  const handleAddActivityCultural = () => {
    if (!activityCulturalToAdd) {
      return;
    }

    const normalized = activityCulturalToAdd.toLowerCase();
    if (activityCultural.includes(normalized)) {
      setActivityCulturalToAdd('');
      return;
    }

    setActivityCultural((prev) => normalizeActivityCultural([...prev, normalized]));
    setActivityCulturalToAdd('');
    setActivitiesSaved(false);
    setActivitiesSaveError(null);
  };

  const handleRemoveActivityCultural = (value: string) => {
    const normalized = value.toLowerCase();
    setActivityCultural((prev) =>
      normalizeActivityCultural(prev.filter((item) => item !== normalized))
    );
    setActivitiesSaved(false);
    setActivitiesSaveError(null);
  };

  const handleSaveActivities = async () => {
    if (!user?.id) {
      setActivitiesSaveError(
        t('profile.errors.mustBeSignedIn', {
          defaultValue: 'Sign in to update your profile.',
        })
      );
      return;
    }

    if (!isActivitiesDirty) {
      setIsEditingActivities(false);
      return;
    }

    try {
      setSavingActivities(true);
      setActivitiesSaveError(null);

      const normalizedSports = normalizeActivitySports(activitySports);
      const normalizedAdventure = normalizeActivityAdventures(activityAdventure);
      const normalizedCultural = normalizeActivityCultural(activityCultural);
      const payload: Partial<Profile> = {};

      if (isActivitySportsDirty) {
        payload.activity_sports_outdoor = normalizedSports.length > 0 ? normalizedSports : null;
      }

      if (isActivityAdventureDirty) {
        payload.activity_adventure_activities =
          normalizedAdventure.length > 0 ? normalizedAdventure : null;
      }

      if (isActivityCulturalDirty) {
        payload.activity_cultural_activities =
          normalizedCultural.length > 0 ? normalizedCultural : null;
      }

      if (Object.keys(payload).length === 0) {
        setIsEditingActivities(false);
        return;
      }

      const { error: updateError } = await updateRecord<Profile>('profiles', payload, {
        match: { user_id: user.id },
      });

      if (updateError) {
        throw updateError;
      }

      await refreshProfile();
      setIsEditingActivities(false);
      setActivitiesSaved(true);
      setOriginalActivitySports(normalizedSports);
      setActivitySports(normalizedSports);
      setActivitySportToAdd('');
      setOriginalActivityAdventure(normalizedAdventure);
      setActivityAdventure(normalizedAdventure);
      setActivityAdventureToAdd('');
      setOriginalActivityCultural(normalizedCultural);
      setActivityCultural(normalizedCultural);
      setActivityCulturalToAdd('');
    } catch (saveError) {
      console.error('Failed to save activities', saveError);
      setActivitiesSaveError(
        saveError instanceof Error
          ? saveError.message
          : t('profile.errors.activitiesSaveFailed', {
              defaultValue: 'We couldn’t save your activities. Try again.',
            })
      );
    } finally {
      setSavingActivities(false);
    }
  };

  const fallbackLabel = t('profile.fallback.notSet');

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/60 p-6 shadow dark:border-slate-800/60 dark:bg-slate-900/60">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-lg font-semibold">{t('profile.sections.activities')}</h2>
        {isEditingActivities ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCancelEditingActivities}
              className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-brand-secondary hover:text-brand-secondary disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:text-slate-200 dark:hover:border-brand-primary dark:hover:text-brand-primary"
              disabled={savingActivities}
            >
              {t('profile.actions.cancel', { defaultValue: 'Cancel' })}
            </button>
            <button
              type="button"
              onClick={handleSaveActivities}
              className="rounded-full border border-brand-secondary bg-brand-secondary px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-secondary/90 disabled:cursor-not-allowed disabled:opacity-60 dark:border-brand-secondary"
              disabled={savingActivities}
            >
              {savingActivities
                ? t('profile.actions.saving', { defaultValue: 'Saving…' })
                : t('profile.actions.save', { defaultValue: 'Save' })}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleStartEditingActivities}
            className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-brand-secondary hover:text-brand-secondary disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:text-slate-200 dark:hover:border-brand-primary dark:hover:text-brand-primary"
            disabled={savingActivities}
          >
            {t('profile.actions.edit', { defaultValue: 'Edit' })}
          </button>
        )}
      </div>
      {activitiesSaveError ? <p className="text-xs text-red-500">{activitiesSaveError}</p> : null}
      {!activitiesSaveError && activitiesSaved ? (
        <p className="text-xs text-emerald-600">
          {t('profile.state.settingsSaved', { defaultValue: 'Your settings have been saved.' })}
        </p>
      ) : null}
      <dl className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1 md:col-span-2">
          <dt className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
            {t('profile.fields.activitiesSports')}
          </dt>
          <dd className="text-sm font-medium text-[var(--text-primary)]">
            {isEditingActivities ? (
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                  {activitySports.length === 0 ? (
                    <span className="text-xs text-[var(--text-secondary)]">{fallbackLabel}</span>
                  ) : (
                    activitySports.map((sport, index) => (
                      <span
                        key={sport}
                        className="flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                      >
                        {activitySportsDisplayLabels[index]}
                        <button
                          type="button"
                          onClick={() => handleRemoveActivitySport(sport)}
                          className="text-slate-400 transition hover:text-red-500"
                          aria-label={t('profile.actions.removeActivitySport', {
                            defaultValue: 'Remove sport activity',
                          })}
                          disabled={savingActivities}
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
                      value={activitySportToAdd || null}
                      onChange={(value: string | null) => {
                        setActivitySportToAdd(value ?? '');
                      }}
                      disabled={savingActivities || availableActivitySports.length === 0}
                    >
                      <div className="relative">
                        <Combobox.Button className="flex w-72 items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary/30 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                          <span
                            className={
                              activitySportToAdd ? '' : 'text-[var(--text-secondary)] dark:text-slate-400'
                            }
                          >
                            {activitySportToAdd
                              ? activitySportsLabelByValue.get(activitySportToAdd) ?? activitySportToAdd
                              : availableActivitySports.length === 0
                              ? t('profile.state.emptyOptions', { defaultValue: 'No options available.' })
                              : t('profile.actions.selectActivitySport', {
                                  defaultValue: 'Select sport activity',
                                })}
                          </span>
                          <ChevronUpDownIcon className="h-5 w-5 text-slate-500" aria-hidden="true" />
                        </Combobox.Button>
                        {availableActivitySports.length > 0 ? (
                          <Combobox.Options className="absolute z-10 mt-2 max-h-56 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-lg focus:outline-none dark:border-slate-700 dark:bg-slate-900">
                            {availableActivitySports.map((option) => (
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
                    onClick={handleAddActivitySport}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-secondary text-lg font-semibold text-brand-secondary transition hover:bg-brand-secondary hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!activitySportToAdd}
                    aria-label={t('profile.actions.addActivitySport', { defaultValue: 'Add sport activity' })}
                  >
                    +
                  </button>
                </div>
              </div>
            ) : originalActivitySports.length === 0 ? (
              <span className="text-xs text-[var(--text-secondary)]">{fallbackLabel}</span>
            ) : (
              <div className="flex flex-wrap gap-2">
                {originalActivitySports.map((sport, index) => (
                  <span
                    key={sport}
                    className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                  >
                    {originalActivitySportsDisplayLabels[index]}
                  </span>
                ))}
              </div>
            )}
          </dd>
        </div>
        <div className="flex flex-col gap-1 md:col-span-2">
          <dt className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
            {t('profile.fields.activitiesAdventure')}
          </dt>
          <dd className="text-sm font-medium text-[var(--text-primary)]">
            {isEditingActivities ? (
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                  {activityAdventure.length === 0 ? (
                    <span className="text-xs text-[var(--text-secondary)]">{fallbackLabel}</span>
                  ) : (
                    activityAdventure.map((adventure, index) => (
                      <span
                        key={adventure}
                        className="flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                      >
                        {activityAdventureDisplayLabels[index]}
                        <button
                          type="button"
                          onClick={() => handleRemoveActivityAdventure(adventure)}
                          className="text-slate-400 transition hover:text-red-500"
                          aria-label={t('profile.actions.removeActivityAdventure', {
                            defaultValue: 'Remove adventure activity',
                          })}
                          disabled={savingActivities}
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
                      value={activityAdventureToAdd || null}
                      onChange={(value: string | null) => {
                        setActivityAdventureToAdd(value ?? '');
                      }}
                      disabled={savingActivities || availableActivityAdventure.length === 0}
                    >
                      <div className="relative">
                        <Combobox.Button className="flex w-72 items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary/30 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                          <span
                            className={
                              activityAdventureToAdd ? '' : 'text-[var(--text-secondary)] dark:text-slate-400'
                            }
                          >
                            {activityAdventureToAdd
                              ? activityAdventureLabelByValue.get(activityAdventureToAdd) ??
                                activityAdventureToAdd
                              : availableActivityAdventure.length === 0
                              ? t('profile.state.emptyOptions', { defaultValue: 'No options available.' })
                              : t('profile.actions.selectActivityAdventure', {
                                  defaultValue: 'Select adventure activity',
                                })}
                          </span>
                          <ChevronUpDownIcon className="h-5 w-5 text-slate-500" aria-hidden="true" />
                        </Combobox.Button>
                        {availableActivityAdventure.length > 0 ? (
                          <Combobox.Options className="absolute z-10 mt-2 max-h-56 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-lg focus:outline-none dark:border-slate-700 dark:bg-slate-900">
                            {availableActivityAdventure.map((option) => (
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
                    onClick={handleAddActivityAdventure}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-secondary text-lg font-semibold text-brand-secondary transition hover:bg-brand-secondary hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!activityAdventureToAdd}
                    aria-label={t('profile.actions.addActivityAdventure', {
                      defaultValue: 'Add adventure activity',
                    })}
                  >
                    +
                  </button>
                </div>
              </div>
            ) : originalActivityAdventure.length === 0 ? (
              <span className="text-xs text-[var(--text-secondary)]">{fallbackLabel}</span>
            ) : (
              <div className="flex flex-wrap gap-2">
                {originalActivityAdventure.map((adventure, index) => (
                  <span
                    key={adventure}
                    className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                  >
                    {originalActivityAdventureDisplayLabels[index]}
                  </span>
                ))}
              </div>
            )}
          </dd>
        </div>
        <div className="flex flex-col gap-1 md:col-span-2">
          <dt className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
            {t('profile.fields.activitiesCultural')}
          </dt>
          <dd className="text-sm font-medium text-[var(--text-primary)]">
            {isEditingActivities ? (
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                  {activityCultural.length === 0 ? (
                    <span className="text-xs text-[var(--text-secondary)]">{fallbackLabel}</span>
                  ) : (
                    activityCultural.map((item, index) => (
                      <span
                        key={item}
                        className="flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                      >
                        {activityCulturalDisplayLabels[index]}
                        <button
                          type="button"
                          onClick={() => handleRemoveActivityCultural(item)}
                          className="text-slate-400 transition hover:text-red-500"
                          aria-label={t('profile.actions.removeActivityCultural', {
                            defaultValue: 'Remove cultural activity',
                          })}
                          disabled={savingActivities}
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
                      value={activityCulturalToAdd || null}
                      onChange={(value: string | null) => {
                        setActivityCulturalToAdd(value ?? '');
                      }}
                      disabled={savingActivities || availableActivityCultural.length === 0}
                    >
                      <div className="relative">
                        <Combobox.Button className="flex w-72 items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary/30 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                          <span
                            className={
                              activityCulturalToAdd ? '' : 'text-[var(--text-secondary)] dark:text-slate-400'
                            }
                          >
                            {activityCulturalToAdd
                              ? activityCulturalLabelByValue.get(activityCulturalToAdd) ?? activityCulturalToAdd
                              : availableActivityCultural.length === 0
                              ? t('profile.state.emptyOptions', { defaultValue: 'No options available.' })
                              : t('profile.actions.selectActivityCultural', {
                                  defaultValue: 'Select cultural activity',
                                })}
                          </span>
                          <ChevronUpDownIcon className="h-5 w-5 text-slate-500" aria-hidden="true" />
                        </Combobox.Button>
                        {availableActivityCultural.length > 0 ? (
                          <Combobox.Options className="absolute z-10 mt-2 max-h-56 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-lg focus:outline-none dark:border-slate-700 dark:bg-slate-900">
                            {availableActivityCultural.map((option) => (
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
                    onClick={handleAddActivityCultural}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-secondary text-lg font-semibold text-brand-secondary transition hover:bg-brand-secondary hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!activityCulturalToAdd}
                    aria-label={t('profile.actions.addActivityCultural', {
                      defaultValue: 'Add cultural activity',
                    })}
                  >
                    +
                  </button>
                </div>
              </div>
            ) : originalActivityCultural.length === 0 ? (
              <span className="text-xs text-[var(--text-secondary)]">{fallbackLabel}</span>
            ) : (
              <div className="flex flex-wrap gap-2">
                {originalActivityCultural.map((item, index) => (
                  <span
                    key={item}
                    className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                  >
                    {originalActivityCulturalDisplayLabels[index]}
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

export default ProfileActivitiesSection;
