import { useEffect, useMemo, useState } from 'react';
import { Combobox } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/20/solid';
import type { User } from '@supabase/supabase-js';
import { useTranslation } from 'react-i18next';
import { updateRecord } from '@/services/supabaseCrud';
import type { Profile, SustainabilityWeightPriority } from '@/types/profile';

interface ActivityOption {
  value: string;
  translationKey: string;
  defaultLabel: string;
  emoji: string;
}

interface SustainabilityWeightPriorityOption {
  value: SustainabilityWeightPriority;
  translationKey: string;
  defaultLabel: string;
  emoji: string;
}

const SUSTAINABILITY_FOCUS_OPTIONS: readonly ActivityOption[] = [
  {
    value: 'eco_transport',
    translationKey: 'profile.sustainability.focus.eco_transport',
    defaultLabel: '🚆 Eco-friendly transport',
    emoji: '🚆',
  },
  {
    value: 'local_food',
    translationKey: 'profile.sustainability.focus.local_food',
    defaultLabel: '🍲 Local food & gastronomy',
    emoji: '🍲',
  },
  {
    value: 'fair_tourism',
    translationKey: 'profile.sustainability.focus.fair_tourism',
    defaultLabel: '🤝 Fair & responsible tourism',
    emoji: '🤝',
  },
  {
    value: 'waste_reduction',
    translationKey: 'profile.sustainability.focus.waste_reduction',
    defaultLabel: '♻️ Waste & plastic reduction',
    emoji: '♻️',
  },
  {
    value: 'eco_accommodation',
    translationKey: 'profile.sustainability.focus.eco_accommodation',
    defaultLabel: '🏡 Eco-conscious stays',
    emoji: '🏡',
  },
  {
    value: 'carbon_offset',
    translationKey: 'profile.sustainability.focus.carbon_offset',
    defaultLabel: '🌍 CO₂ offsetting',
    emoji: '🌍',
  },
  {
    value: 'sustainable_gear',
    translationKey: 'profile.sustainability.focus.sustainable_gear',
    defaultLabel: '🧭 Sustainable gear',
    emoji: '🧭',
  },
  {
    value: 'nature_protection',
    translationKey: 'profile.sustainability.focus.nature_protection',
    defaultLabel: '🌿 Nature & biodiversity',
    emoji: '🌿',
  },
  {
    value: 'community_projects',
    translationKey: 'profile.sustainability.focus.community_projects',
    defaultLabel: '🏘️ Community projects',
    emoji: '🏘️',
  },
  {
    value: 'slow_travel',
    translationKey: 'profile.sustainability.focus.slow_travel',
    defaultLabel: '🐢 Slow travel',
    emoji: '🐢',
  },
];

const SUSTAINABILITY_WEIGHT_PRIORITY_OPTIONS: readonly SustainabilityWeightPriorityOption[] = [
  {
    value: 'comfort_first',
    translationKey: 'profile.sustainability.weightPriority.comfort_first',
    defaultLabel: '🛋️ Comfort-first (no weight limits)',
    emoji: '🛋️',
  },
  {
    value: 'balanced',
    translationKey: 'profile.sustainability.weightPriority.balanced',
    defaultLabel: '⚖️ Balanced: mindful weight & comfort',
    emoji: '⚖️',
  },
  {
    value: 'lightweight',
    translationKey: 'profile.sustainability.weightPriority.lightweight',
    defaultLabel: '🎒 Lightweight: as light as possible',
    emoji: '🎒',
  },
  {
    value: 'ultralight',
    translationKey: 'profile.sustainability.weightPriority.ultralight',
    defaultLabel: '🪶 Ultralight mission: every gram counts',
    emoji: '🪶',
  },
];

const SUSTAINABILITY_WEIGHT_PRIORITY_VALUES = SUSTAINABILITY_WEIGHT_PRIORITY_OPTIONS.map(
  (option) => option.value
) as readonly SustainabilityWeightPriority[];

const isSustainabilityWeightPriorityValue = (
  value: unknown
): value is SustainabilityWeightPriority =>
  typeof value === 'string' &&
  (SUSTAINABILITY_WEIGHT_PRIORITY_VALUES as readonly string[]).includes(value);

const normalizeSustainabilityFocus = (focus: string[]): string[] => {
  const allowedValues = new Map(
    SUSTAINABILITY_FOCUS_OPTIONS.map((option, index) => [option.value, index])
  );
  const chosen = new Set(
    focus
      .map((item) => (typeof item === 'string' ? item.trim().toLowerCase() : ''))
      .filter((item) => item.length > 0 && allowedValues.has(item))
  );

  return SUSTAINABILITY_FOCUS_OPTIONS.map((option) => option.value).filter((value) => chosen.has(value));
};

interface ProfileSustainabilitySectionProps {
  profile: Profile | null;
  user: User | null;
  refreshProfile: () => Promise<void>;
  refreshSignal: number;
  onEditingChange?: (isEditing: boolean) => void;
}

const ProfileSustainabilitySection = ({
  profile,
  user,
  refreshProfile,
  refreshSignal,
  onEditingChange,
}: ProfileSustainabilitySectionProps) => {
  const { t } = useTranslation('dashboard');

  const [sustainabilityFocus, setSustainabilityFocus] = useState<string[]>([]);
  const [originalSustainabilityFocus, setOriginalSustainabilityFocus] = useState<string[]>([]);
  const [sustainabilityFocusToAdd, setSustainabilityFocusToAdd] = useState('');
  const [sustainabilityWeightPriority, setSustainabilityWeightPriority] =
    useState<SustainabilityWeightPriority | null>(null);
  const [
    originalSustainabilityWeightPriority,
    setOriginalSustainabilityWeightPriority,
  ] = useState<SustainabilityWeightPriority | null>(null);
  const [isEditingSustainability, setIsEditingSustainability] = useState(false);
  const [savingSustainability, setSavingSustainability] = useState(false);
  const [sustainabilitySaveError, setSustainabilitySaveError] = useState<string | null>(null);
  const [sustainabilitySaved, setSustainabilitySaved] = useState(false);

  useEffect(() => {
    onEditingChange?.(isEditingSustainability);
  }, [isEditingSustainability, onEditingChange]);

  useEffect(() => {
    setSustainabilitySaved(false);
    setSustainabilitySaveError(null);
  }, [refreshSignal]);

  useEffect(() => {
    const focusArray = Array.isArray(profile?.sustainability_focus)
      ? normalizeSustainabilityFocus(profile.sustainability_focus as string[])
      : [];

    setOriginalSustainabilityFocus(focusArray);

    if (!isEditingSustainability) {
      setSustainabilityFocus(focusArray);
      setSustainabilityFocusToAdd('');
    }
  }, [profile?.sustainability_focus, isEditingSustainability]);

  useEffect(() => {
    const weightValue = isSustainabilityWeightPriorityValue(profile?.sustainability_weight_priority)
      ? profile?.sustainability_weight_priority
      : null;

    setOriginalSustainabilityWeightPriority(weightValue ?? null);

    if (!isEditingSustainability) {
      setSustainabilityWeightPriority(weightValue ?? null);
    }
  }, [profile?.sustainability_weight_priority, isEditingSustainability]);

  const sustainabilityFocusLabelByValue = useMemo(() => {
    const map = new Map<string, string>();
    SUSTAINABILITY_FOCUS_OPTIONS.forEach((option) => {
      map.set(option.value, t(option.translationKey, { defaultValue: `${option.emoji} ${option.defaultLabel}` }));
    });
    return map;
  }, [t]);

  const sustainabilityWeightPriorityLabelByValue = useMemo(() => {
    const map = new Map<SustainabilityWeightPriority, string>();
    SUSTAINABILITY_WEIGHT_PRIORITY_OPTIONS.forEach((option) => {
      map.set(
        option.value,
        t(option.translationKey, { defaultValue: `${option.emoji} ${option.defaultLabel}` })
      );
    });
    return map;
  }, [t]);

  const availableSustainabilityFocus = useMemo(() => {
    const chosen = new Set(sustainabilityFocus);
    return SUSTAINABILITY_FOCUS_OPTIONS.filter((option) => !chosen.has(option.value)).map((option) => ({
      value: option.value,
      label: sustainabilityFocusLabelByValue.get(option.value) ?? option.defaultLabel,
    }));
  }, [sustainabilityFocus, sustainabilityFocusLabelByValue]);

  const sustainabilityFocusDisplayLabels = useMemo(
    () => sustainabilityFocus.map((value) => sustainabilityFocusLabelByValue.get(value) ?? value),
    [sustainabilityFocus, sustainabilityFocusLabelByValue]
  );

  const originalSustainabilityFocusDisplayLabels = useMemo(
    () =>
      originalSustainabilityFocus.map(
        (value) => sustainabilityFocusLabelByValue.get(value) ?? value
      ),
    [originalSustainabilityFocus, sustainabilityFocusLabelByValue]
  );

  const originalSustainabilityWeightPriorityDisplayLabel =
    originalSustainabilityWeightPriority === null
      ? null
      : sustainabilityWeightPriorityLabelByValue.get(originalSustainabilityWeightPriority) ??
        originalSustainabilityWeightPriority;

  const isSustainabilityFocusDirty =
    sustainabilityFocus.length !== originalSustainabilityFocus.length ||
    sustainabilityFocus.some((item, index) => item !== originalSustainabilityFocus[index]);
  const isSustainabilityWeightPriorityDirty =
    sustainabilityWeightPriority !== originalSustainabilityWeightPriority;

  const isSustainabilityDirty =
    isSustainabilityFocusDirty || isSustainabilityWeightPriorityDirty;

  const handleStartEditingSustainability = () => {
    setIsEditingSustainability(true);
    setSustainabilitySaved(false);
    setSustainabilitySaveError(null);
    setSustainabilityFocus(originalSustainabilityFocus);
    setSustainabilityFocusToAdd('');
    setSustainabilityWeightPriority(originalSustainabilityWeightPriority);
  };

  const handleCancelEditingSustainability = () => {
    setIsEditingSustainability(false);
    setSustainabilitySaved(false);
    setSustainabilitySaveError(null);
    setSustainabilityFocus(originalSustainabilityFocus);
    setSustainabilityFocusToAdd('');
    setSustainabilityWeightPriority(originalSustainabilityWeightPriority);
  };

  const handleAddSustainabilityFocus = () => {
    if (!sustainabilityFocusToAdd) {
      return;
    }

    const normalized = sustainabilityFocusToAdd.toLowerCase();
    if (sustainabilityFocus.includes(normalized)) {
      setSustainabilityFocusToAdd('');
      return;
    }

    setSustainabilityFocus((prev) => normalizeSustainabilityFocus([...prev, normalized]));
    setSustainabilityFocusToAdd('');
    setSustainabilitySaved(false);
    setSustainabilitySaveError(null);
  };

  const handleRemoveSustainabilityFocus = (value: string) => {
    const normalized = value.toLowerCase();
    setSustainabilityFocus((prev) =>
      normalizeSustainabilityFocus(prev.filter((item) => item !== normalized))
    );
    setSustainabilitySaved(false);
    setSustainabilitySaveError(null);
  };

  const handleSaveSustainability = async () => {
    if (!user?.id) {
      setSustainabilitySaveError(
        t('profile.errors.mustBeSignedIn', {
          defaultValue: 'Sign in to update your profile.',
        })
      );
      return;
    }

    if (!isSustainabilityDirty) {
      setIsEditingSustainability(false);
      return;
    }

    try {
      setSavingSustainability(true);
      setSustainabilitySaveError(null);

      const normalizedFocus = normalizeSustainabilityFocus(sustainabilityFocus);
      const normalizedWeightPriority = sustainabilityWeightPriority;
      const payload: Partial<Profile> = {};

      if (isSustainabilityFocusDirty) {
        payload.sustainability_focus = normalizedFocus.length > 0 ? normalizedFocus : null;
      }

      if (isSustainabilityWeightPriorityDirty) {
        payload.sustainability_weight_priority = normalizedWeightPriority ?? null;
      }

      if (Object.keys(payload).length === 0) {
        setIsEditingSustainability(false);
        return;
      }

      const { error: updateError } = await updateRecord<Profile>('profiles', payload, {
        match: { user_id: user.id },
      });

      if (updateError) {
        throw updateError;
      }

      await refreshProfile();
      setIsEditingSustainability(false);
      setSustainabilitySaved(true);
      setOriginalSustainabilityFocus(normalizedFocus);
      setSustainabilityFocus(normalizedFocus);
      setSustainabilityFocusToAdd('');
      setOriginalSustainabilityWeightPriority(normalizedWeightPriority ?? null);
      setSustainabilityWeightPriority(normalizedWeightPriority ?? null);
    } catch (saveError) {
      console.error('Failed to save sustainability preferences', saveError);
      setSustainabilitySaveError(
        saveError instanceof Error
          ? saveError.message
          : t('profile.errors.sustainabilitySaveFailed', {
              defaultValue: 'We couldn’t save your sustainability preferences. Try again.',
            })
      );
    } finally {
      setSavingSustainability(false);
    }
  };

  const fallbackLabel = t('profile.fallback.notSet');

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/60 p-6 shadow dark:border-slate-800/60 dark:bg-slate-900/60">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-lg font-semibold">{t('profile.sections.sustainability')}</h2>
        {isEditingSustainability ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCancelEditingSustainability}
              className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-brand-secondary hover:text-brand-secondary disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:text-slate-200 dark:hover:border-brand-primary dark:hover:text-brand-primary"
              disabled={savingSustainability}
            >
              {t('profile.actions.cancel', { defaultValue: 'Cancel' })}
            </button>
            <button
              type="button"
              onClick={handleSaveSustainability}
              className="rounded-full border border-brand-secondary bg-brand-secondary px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-secondary/90 disabled:cursor-not-allowed disabled:opacity-60 dark:border-brand-secondary"
              disabled={savingSustainability}
            >
              {savingSustainability
                ? t('profile.actions.saving', { defaultValue: 'Saving…' })
                : t('profile.actions.save', { defaultValue: 'Save' })}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleStartEditingSustainability}
            className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-brand-secondary hover:text-brand-secondary disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:text-slate-200 dark:hover:border-brand-primary dark:hover:text-brand-primary"
            disabled={savingSustainability}
          >
            {t('profile.actions.edit', { defaultValue: 'Edit' })}
          </button>
        )}
      </div>
      {sustainabilitySaveError ? <p className="text-xs text-red-500">{sustainabilitySaveError}</p> : null}
      {!sustainabilitySaveError && sustainabilitySaved ? (
        <p className="text-xs text-emerald-600">
          {t('profile.state.settingsSaved', { defaultValue: 'Your settings have been saved.' })}
        </p>
      ) : null}
      <dl className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1 md:col-span-2">
          <dt className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
            {t('profile.fields.sustainabilityFocus')}
          </dt>
          <dd className="text-sm font-medium text-[var(--text-primary)]">
            {isEditingSustainability ? (
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                  {sustainabilityFocus.length === 0 ? (
                    <span className="text-xs text-[var(--text-secondary)]">{fallbackLabel}</span>
                  ) : (
                    sustainabilityFocus.map((item, index) => (
                      <span
                        key={item}
                        className="flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                      >
                        {sustainabilityFocusDisplayLabels[index]}
                        <button
                          type="button"
                          onClick={() => handleRemoveSustainabilityFocus(item)}
                          className="text-slate-400 transition hover:text-red-500"
                          aria-label={t('profile.actions.removeSustainabilityFocus', {
                            defaultValue: 'Remove sustainability focus',
                          })}
                          disabled={savingSustainability}
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
                      value={sustainabilityFocusToAdd || null}
                      onChange={(value: string | null) => {
                        setSustainabilityFocusToAdd(value ?? '');
                      }}
                      disabled={savingSustainability || availableSustainabilityFocus.length === 0}
                    >
                      <div className="relative">
                        <Combobox.Button className="flex w-72 items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary/30 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                          <span
                            className={
                              sustainabilityFocusToAdd ? '' : 'text-[var(--text-secondary)] dark:text-slate-400'
                            }
                          >
                            {sustainabilityFocusToAdd
                              ? sustainabilityFocusLabelByValue.get(sustainabilityFocusToAdd) ??
                                sustainabilityFocusToAdd
                              : availableSustainabilityFocus.length === 0
                              ? t('profile.state.emptyOptions', { defaultValue: 'No options available.' })
                              : t('profile.actions.selectSustainabilityFocus', {
                                  defaultValue: 'Select sustainability focus',
                                })}
                          </span>
                          <ChevronUpDownIcon className="h-5 w-5 text-slate-500" aria-hidden="true" />
                        </Combobox.Button>
                        {availableSustainabilityFocus.length > 0 ? (
                          <Combobox.Options className="absolute z-10 mt-2 max-h-56 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-lg focus:outline-none dark:border-slate-700 dark:bg-slate-900">
                            {availableSustainabilityFocus.map((option) => (
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
                    onClick={handleAddSustainabilityFocus}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-secondary text-lg font-semibold text-brand-secondary transition hover:bg-brand-secondary hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!sustainabilityFocusToAdd}
                    aria-label={t('profile.actions.addSustainabilityFocus', {
                      defaultValue: 'Add sustainability focus',
                    })}
                  >
                    +
                  </button>
                </div>
              </div>
            ) : originalSustainabilityFocus.length === 0 ? (
              <span className="text-xs text-[var(--text-secondary)]">{fallbackLabel}</span>
            ) : (
              <div className="flex flex-wrap gap-2">
                {originalSustainabilityFocus.map((item, index) => (
                  <span
                    key={item}
                    className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                  >
                    {originalSustainabilityFocusDisplayLabels[index]}
                  </span>
                ))}
              </div>
            )}
          </dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
            {t('profile.fields.sustainabilityWeight')}
          </dt>
          <dd className="text-sm font-medium text-[var(--text-primary)]">
            {isEditingSustainability ? (
              <Combobox
                value={sustainabilityWeightPriority}
                onChange={(value: SustainabilityWeightPriority | null) => {
                  setSustainabilityWeightPriority(value);
                  setSustainabilitySaved(false);
                  setSustainabilitySaveError(null);
                }}
              >
                <div className="relative">
                  <Combobox.Button className="flex w-72 max-w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary/30 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                    <span
                      className={
                        sustainabilityWeightPriority ? '' : 'text-[var(--text-secondary)] dark:text-slate-400'
                      }
                    >
                      {sustainabilityWeightPriority
                        ? sustainabilityWeightPriorityLabelByValue.get(sustainabilityWeightPriority) ??
                          sustainabilityWeightPriority
                        : t('profile.actions.selectSustainabilityWeightPriority', {
                            defaultValue: 'Choose your pack weight priority',
                          })}
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
                      {t('profile.actions.selectSustainabilityWeightPriority', {
                        defaultValue: 'Choose your pack weight priority',
                      })}
                    </Combobox.Option>
                    {SUSTAINABILITY_WEIGHT_PRIORITY_OPTIONS.map((option) => (
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
                        {t(option.translationKey, { defaultValue: `${option.emoji} ${option.defaultLabel}` })}
                      </Combobox.Option>
                    ))}
                  </Combobox.Options>
                </div>
              </Combobox>
            ) : (
              originalSustainabilityWeightPriorityDisplayLabel ?? fallbackLabel
            )}
          </dd>
        </div>
      </dl>
    </article>
  );
};

export default ProfileSustainabilitySection;
