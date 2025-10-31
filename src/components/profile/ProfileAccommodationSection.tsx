import { useEffect, useMemo, useState } from 'react';
import { Combobox } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/20/solid';
import type { User } from '@supabase/supabase-js';
import { useTranslation } from 'react-i18next';
import { updateRecord } from '@/services/supabaseCrud';
import type { Profile } from '@/types/profile';

interface AccommodationTypeOption {
  value: string;
  translationKey: string;
  defaultLabel: string;
  emoji: string;
}

const ACCOMMODATION_TYPE_OPTIONS: readonly AccommodationTypeOption[] = [
  {
    value: 'hotel',
    translationKey: 'profile.accommodation.types.hotel',
    defaultLabel: 'Hotel',
    emoji: '🏨',
  },
  {
    value: 'hostel',
    translationKey: 'profile.accommodation.types.hostel',
    defaultLabel: 'Hostel',
    emoji: '🛏️',
  },
  {
    value: 'apartment',
    translationKey: 'profile.accommodation.types.apartment',
    defaultLabel: 'Apartment / Vacation rental',
    emoji: '🏠',
  },
  {
    value: 'camping',
    translationKey: 'profile.accommodation.types.camping',
    defaultLabel: 'Camping / Campsite',
    emoji: '⛺️',
  },
  {
    value: 'van',
    translationKey: 'profile.accommodation.types.van',
    defaultLabel: 'Van / Campervan',
    emoji: '🚐',
  },
  {
    value: 'guesthouse',
    translationKey: 'profile.accommodation.types.guesthouse',
    defaultLabel: 'Guesthouse / Bed & Breakfast',
    emoji: '🏡',
  },
  {
    value: 'mountain_lodge',
    translationKey: 'profile.accommodation.types.mountain_lodge',
    defaultLabel: 'Mountain lodge / Cabin',
    emoji: '🏔️',
  },
  {
    value: 'private_stay',
    translationKey: 'profile.accommodation.types.private_stay',
    defaultLabel: 'Friends & family stay',
    emoji: '👥',
  },
  {
    value: 'resort',
    translationKey: 'profile.accommodation.types.resort',
    defaultLabel: 'Luxury resort',
    emoji: '💎',
  },
];

const ACCOMMODATION_LAUNDRY_VALUES = ['none', 'sometimes', 'usually', 'always'] as const;

type AccommodationLaundryAccessExpectationValue = (typeof ACCOMMODATION_LAUNDRY_VALUES)[number];

interface AccommodationLaundryOption {
  value: AccommodationLaundryAccessExpectationValue;
  translationKey: string;
  defaultLabel: string;
  emoji: string;
}

const ACCOMMODATION_LAUNDRY_OPTIONS: readonly AccommodationLaundryOption[] = [
  {
    value: 'none',
    translationKey: 'profile.accommodation.laundry.none',
    defaultLabel: 'Not needed',
    emoji: '🚫',
  },
  {
    value: 'sometimes',
    translationKey: 'profile.accommodation.laundry.sometimes',
    defaultLabel: 'Occasionally available',
    emoji: '🔄',
  },
  {
    value: 'usually',
    translationKey: 'profile.accommodation.laundry.usually',
    defaultLabel: 'Usually available',
    emoji: '🧺',
  },
  {
    value: 'always',
    translationKey: 'profile.accommodation.laundry.always',
    defaultLabel: 'Always available on site',
    emoji: '♻️',
  },
];

type AccommodationWorkspacePreferenceValue = 'yes' | 'no';

interface AccommodationWorkspaceOption {
  value: AccommodationWorkspacePreferenceValue;
  translationKey: string;
  defaultLabel: string;
  emoji: string;
}

const ACCOMMODATION_WORKSPACE_OPTIONS: readonly AccommodationWorkspaceOption[] = [
  {
    value: 'yes',
    translationKey: 'profile.accommodation.workspace.yes',
    defaultLabel: 'Work-friendly space needed',
    emoji: '💻',
  },
  {
    value: 'no',
    translationKey: 'profile.accommodation.workspace.no',
    defaultLabel: 'No workspace needed',
    emoji: '🛏️',
  },
];

const normalizeAccommodationTypes = (types: string[]): string[] => {
  const allowedValues = new Map(
    ACCOMMODATION_TYPE_OPTIONS.map((option, index) => [option.value, index])
  );
  const chosen = new Set(
    types
      .map((type) => (typeof type === 'string' ? type.trim().toLowerCase() : ''))
      .filter((type) => type.length > 0 && allowedValues.has(type))
  );

  return ACCOMMODATION_TYPE_OPTIONS.map((option) => option.value).filter((value) => chosen.has(value));
};

const isAccommodationLaundryAccessExpectationValue = (
  value: unknown
): value is AccommodationLaundryAccessExpectationValue =>
  typeof value === 'string' && (ACCOMMODATION_LAUNDRY_VALUES as readonly string[]).includes(value);

const normalizeAccommodationWorkspacePreference = (
  value: unknown
): AccommodationWorkspacePreferenceValue | null => {
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['yes', 'true', '1'].includes(normalized)) {
      return 'yes';
    }
    if (['no', 'false', '0'].includes(normalized)) {
      return 'no';
    }
  }

  if (typeof value === 'boolean') {
    return value ? 'yes' : 'no';
  }

  if (typeof value === 'number') {
    if (value === 1) {
      return 'yes';
    }
    if (value === 0) {
      return 'no';
    }
  }

  return null;
};

interface ProfileAccommodationSectionProps {
  profile: Profile | null;
  user: User | null;
  refreshProfile: () => Promise<void>;
  refreshSignal: number;
  onEditingChange?: (isEditing: boolean) => void;
}

const ProfileAccommodationSection = ({
  profile,
  user,
  refreshProfile,
  refreshSignal,
  onEditingChange,
}: ProfileAccommodationSectionProps) => {
  const { t } = useTranslation('dashboard');

  const [accommodationTypes, setAccommodationTypes] = useState<string[]>([]);
  const [originalAccommodationTypes, setOriginalAccommodationTypes] = useState<string[]>([]);
  const [accommodationTypeToAdd, setAccommodationTypeToAdd] = useState('');
  const [accommodationLaundryExpectation, setAccommodationLaundryExpectation] =
    useState<AccommodationLaundryAccessExpectationValue | null>(null);
  const [
    originalAccommodationLaundryExpectation,
    setOriginalAccommodationLaundryExpectation,
  ] = useState<AccommodationLaundryAccessExpectationValue | null>(null);
  const [accommodationWorkspaceNeeded, setAccommodationWorkspaceNeeded] =
    useState<AccommodationWorkspacePreferenceValue | null>(null);
  const [
    originalAccommodationWorkspaceNeeded,
    setOriginalAccommodationWorkspaceNeeded,
  ] = useState<AccommodationWorkspacePreferenceValue | null>(null);
  const [isEditingAccommodation, setIsEditingAccommodation] = useState(false);
  const [savingAccommodation, setSavingAccommodation] = useState(false);
  const [accommodationSaveError, setAccommodationSaveError] = useState<string | null>(null);
  const [accommodationSaved, setAccommodationSaved] = useState(false);

  useEffect(() => {
    onEditingChange?.(isEditingAccommodation);
  }, [isEditingAccommodation, onEditingChange]);

  useEffect(() => {
    setAccommodationSaved(false);
    setAccommodationSaveError(null);
  }, [refreshSignal]);

  useEffect(() => {
    const typesArray = Array.isArray(profile?.accommodation_common_types)
      ? normalizeAccommodationTypes(profile.accommodation_common_types as string[])
      : [];

    setOriginalAccommodationTypes(typesArray);

    if (!isEditingAccommodation) {
      setAccommodationTypes(typesArray);
      setAccommodationTypeToAdd('');
    }
  }, [profile?.accommodation_common_types, isEditingAccommodation]);

  useEffect(() => {
    const rawLaundry = profile?.accommodation_laundry_access_expectation;
    const normalizedLaundry = isAccommodationLaundryAccessExpectationValue(rawLaundry)
      ? rawLaundry
      : null;

    setOriginalAccommodationLaundryExpectation(normalizedLaundry);

    if (!isEditingAccommodation) {
      setAccommodationLaundryExpectation(normalizedLaundry);
    }
  }, [profile?.accommodation_laundry_access_expectation, isEditingAccommodation]);

  useEffect(() => {
    const rawWorkspace = normalizeAccommodationWorkspacePreference(
      profile?.accommodation_workspace_needed
    );

    setOriginalAccommodationWorkspaceNeeded(rawWorkspace);

    if (!isEditingAccommodation) {
      setAccommodationWorkspaceNeeded(rawWorkspace);
    }
  }, [profile?.accommodation_workspace_needed, isEditingAccommodation]);

  const accommodationTypeLabelByValue = useMemo(() => {
    const map = new Map<string, string>();
    ACCOMMODATION_TYPE_OPTIONS.forEach((option) => {
      map.set(option.value, t(option.translationKey, { defaultValue: `${option.emoji} ${option.defaultLabel}` }));
    });
    return map;
  }, [t]);

  const accommodationLaundryLabelByValue = useMemo(() => {
    const map = new Map<AccommodationLaundryAccessExpectationValue, string>();
    ACCOMMODATION_LAUNDRY_OPTIONS.forEach((option) => {
      map.set(
        option.value,
        t(option.translationKey, { defaultValue: `${option.emoji} ${option.defaultLabel}` })
      );
    });
    return map;
  }, [t]);

  const accommodationWorkspaceLabelByValue = useMemo(() => {
    const map = new Map<AccommodationWorkspacePreferenceValue, string>();
    ACCOMMODATION_WORKSPACE_OPTIONS.forEach((option) => {
      map.set(
        option.value,
        t(option.translationKey, { defaultValue: `${option.emoji} ${option.defaultLabel}` })
      );
    });
    return map;
  }, [t]);

  const availableAccommodationTypes = useMemo(() => {
    const chosen = new Set(accommodationTypes);
    return ACCOMMODATION_TYPE_OPTIONS.filter((option) => !chosen.has(option.value)).map((option) => ({
      value: option.value,
      label: accommodationTypeLabelByValue.get(option.value) ?? option.defaultLabel,
    }));
  }, [accommodationTypeLabelByValue, accommodationTypes]);

  const accommodationTypesDisplayLabels = useMemo(
    () => accommodationTypes.map((value) => accommodationTypeLabelByValue.get(value) ?? value),
    [accommodationTypeLabelByValue, accommodationTypes]
  );
  const originalAccommodationTypesDisplayLabels = useMemo(
    () =>
      originalAccommodationTypes.map(
        (value) => accommodationTypeLabelByValue.get(value) ?? value
      ),
    [accommodationTypeLabelByValue, originalAccommodationTypes]
  );

  const originalAccommodationLaundryExpectationDisplayLabel = originalAccommodationLaundryExpectation
    ? accommodationLaundryLabelByValue.get(originalAccommodationLaundryExpectation) ??
      originalAccommodationLaundryExpectation
    : null;
  const originalAccommodationWorkspaceNeededDisplayLabel =
    originalAccommodationWorkspaceNeeded === null
      ? null
      : accommodationWorkspaceLabelByValue.get(originalAccommodationWorkspaceNeeded) ?? null;

  const isAccommodationTypesDirty =
    accommodationTypes.length !== originalAccommodationTypes.length ||
    accommodationTypes.some((item, index) => item !== originalAccommodationTypes[index]);
  const isAccommodationLaundryExpectationDirty =
    accommodationLaundryExpectation !== originalAccommodationLaundryExpectation;
  const isAccommodationWorkspaceDirty =
    accommodationWorkspaceNeeded !== originalAccommodationWorkspaceNeeded;

  const isAccommodationDirty =
    isAccommodationTypesDirty ||
    isAccommodationLaundryExpectationDirty ||
    isAccommodationWorkspaceDirty;

  const handleStartEditingAccommodation = () => {
    setIsEditingAccommodation(true);
    setAccommodationSaved(false);
    setAccommodationSaveError(null);
    setAccommodationTypes(originalAccommodationTypes);
    setAccommodationTypeToAdd('');
    setAccommodationLaundryExpectation(originalAccommodationLaundryExpectation);
    setAccommodationWorkspaceNeeded(originalAccommodationWorkspaceNeeded);
  };

  const handleCancelEditingAccommodation = () => {
    setIsEditingAccommodation(false);
    setAccommodationSaved(false);
    setAccommodationSaveError(null);
    setAccommodationTypes(originalAccommodationTypes);
    setAccommodationTypeToAdd('');
    setAccommodationLaundryExpectation(originalAccommodationLaundryExpectation);
    setAccommodationWorkspaceNeeded(originalAccommodationWorkspaceNeeded);
  };

  const handleAddAccommodationType = () => {
    if (!accommodationTypeToAdd) {
      return;
    }

    const normalized = accommodationTypeToAdd.toLowerCase();
    if (accommodationTypes.includes(normalized)) {
      setAccommodationTypeToAdd('');
      return;
    }

    setAccommodationTypes((prev) => normalizeAccommodationTypes([...prev, normalized]));
    setAccommodationTypeToAdd('');
    setAccommodationSaved(false);
    setAccommodationSaveError(null);
  };

  const handleRemoveAccommodationType = (value: string) => {
    const normalized = value.toLowerCase();
    setAccommodationTypes((prev) =>
      normalizeAccommodationTypes(prev.filter((item) => item !== normalized))
    );
    setAccommodationSaved(false);
    setAccommodationSaveError(null);
  };

  const handleSaveAccommodation = async () => {
    if (!user?.id) {
      setAccommodationSaveError(
        t('profile.errors.mustBeSignedIn', {
          defaultValue: 'Sign in to update your profile.',
        })
      );
      return;
    }

    if (!isAccommodationDirty) {
      setIsEditingAccommodation(false);
      return;
    }

    try {
      setSavingAccommodation(true);
      setAccommodationSaveError(null);

      const normalizedTypes = normalizeAccommodationTypes(accommodationTypes);
      const normalizedLaundryExpectation = accommodationLaundryExpectation ?? null;
      const normalizedWorkspaceNeeded = accommodationWorkspaceNeeded ?? null;
      const payload: Partial<Profile> = {};

      if (isAccommodationTypesDirty) {
        payload.accommodation_common_types = normalizedTypes.length > 0 ? normalizedTypes : null;
      }

      if (isAccommodationLaundryExpectationDirty) {
        payload.accommodation_laundry_access_expectation = normalizedLaundryExpectation;
      }

      if (isAccommodationWorkspaceDirty) {
        payload.accommodation_workspace_needed = normalizedWorkspaceNeeded;
      }

      if (Object.keys(payload).length === 0) {
        setIsEditingAccommodation(false);
        return;
      }

      const { error: updateError } = await updateRecord<Profile>('profiles', payload, {
        match: { user_id: user.id },
      });

      if (updateError) {
        throw updateError;
      }

      await refreshProfile();
      setIsEditingAccommodation(false);
      setAccommodationSaved(true);
      setOriginalAccommodationTypes(normalizedTypes);
      setAccommodationTypes(normalizedTypes);
      setAccommodationTypeToAdd('');
      setOriginalAccommodationLaundryExpectation(normalizedLaundryExpectation);
      setAccommodationLaundryExpectation(normalizedLaundryExpectation);
      setOriginalAccommodationWorkspaceNeeded(normalizedWorkspaceNeeded);
      setAccommodationWorkspaceNeeded(normalizedWorkspaceNeeded);
    } catch (saveError) {
      console.error('Failed to save accommodation preferences', saveError);
      setAccommodationSaveError(
        saveError instanceof Error
          ? saveError.message
          : t('profile.errors.accommodationSaveFailed', {
              defaultValue: 'We couldn’t save your accommodation preferences. Try again.',
            })
      );
    } finally {
      setSavingAccommodation(false);
    }
  };

  const fallbackLabel = t('profile.fallback.notSet');

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/60 p-6 shadow dark:border-slate-800/60 dark:bg-slate-900/60">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-lg font-semibold">{t('profile.sections.accommodation')}</h2>
        {isEditingAccommodation ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCancelEditingAccommodation}
              className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-brand-secondary hover:text-brand-secondary disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:text-slate-200 dark:hover:border-brand-primary dark:hover:text-brand-primary"
              disabled={savingAccommodation}
            >
              {t('profile.actions.cancel', { defaultValue: 'Cancel' })}
            </button>
            <button
              type="button"
              onClick={handleSaveAccommodation}
              className="rounded-full border border-brand-secondary bg-brand-secondary px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-secondary/90 disabled:cursor-not-allowed disabled:opacity-60 dark:border-brand-secondary"
              disabled={savingAccommodation}
            >
              {savingAccommodation
                ? t('profile.actions.saving', { defaultValue: 'Saving…' })
                : t('profile.actions.save', { defaultValue: 'Save' })}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleStartEditingAccommodation}
            className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-brand-secondary hover:text-brand-secondary disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:text-slate-200 dark:hover:border-brand-primary dark:hover:text-brand-primary"
            disabled={savingAccommodation}
          >
            {t('profile.actions.edit', { defaultValue: 'Edit' })}
          </button>
        )}
      </div>
      {accommodationSaveError ? <p className="text-xs text-red-500">{accommodationSaveError}</p> : null}
      {!accommodationSaveError && accommodationSaved ? (
        <p className="text-xs text-emerald-600">
          {t('profile.state.settingsSaved', { defaultValue: 'Your settings have been saved.' })}
        </p>
      ) : null}
      <dl className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1 md:col-span-2">
          <dt className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
            {t('profile.fields.accommodationTypes')}
          </dt>
          <dd className="text-sm font-medium text-[var(--text-primary)]">
            {isEditingAccommodation ? (
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                  {accommodationTypes.length === 0 ? (
                    <span className="text-xs text-[var(--text-secondary)]">{fallbackLabel}</span>
                  ) : (
                    accommodationTypes.map((type, index) => (
                      <span
                        key={type}
                        className="flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                      >
                        {accommodationTypesDisplayLabels[index]}
                        <button
                          type="button"
                          onClick={() => handleRemoveAccommodationType(type)}
                          className="text-slate-400 transition hover:text-red-500"
                          aria-label={t('profile.actions.removeAccommodationType', {
                            defaultValue: 'Remove accommodation type',
                          })}
                          disabled={savingAccommodation}
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
                      value={accommodationTypeToAdd || null}
                      onChange={(value: string | null) => {
                        setAccommodationTypeToAdd(value ?? '');
                      }}
                      disabled={savingAccommodation || availableAccommodationTypes.length === 0}
                    >
                      <div className="relative">
                        <Combobox.Button className="flex w-60 items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary/30 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                          <span
                            className={
                              accommodationTypeToAdd ? '' : 'text-[var(--text-secondary)] dark:text-slate-400'
                            }
                          >
                            {accommodationTypeToAdd
                              ? accommodationTypeLabelByValue.get(accommodationTypeToAdd) ?? accommodationTypeToAdd
                              : availableAccommodationTypes.length === 0
                              ? t('profile.state.emptyOptions', { defaultValue: 'No options available.' })
                              : t('profile.actions.selectAccommodationType', {
                                  defaultValue: 'Select accommodation type',
                                })}
                          </span>
                          <ChevronUpDownIcon className="h-5 w-5 text-slate-500" aria-hidden="true" />
                        </Combobox.Button>
                        {availableAccommodationTypes.length > 0 ? (
                          <Combobox.Options className="absolute z-10 mt-2 max-h-56 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-lg focus:outline-none dark:border-slate-700 dark:bg-slate-900">
                            {availableAccommodationTypes.map((option) => (
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
                    onClick={handleAddAccommodationType}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-secondary text-lg font-semibold text-brand-secondary transition hover:bg-brand-secondary hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!accommodationTypeToAdd}
                    aria-label={t('profile.actions.addAccommodationType', {
                      defaultValue: 'Add accommodation type',
                    })}
                  >
                    +
                  </button>
                </div>
              </div>
            ) : originalAccommodationTypes.length === 0 ? (
              <span className="text-xs text-[var(--text-secondary)]">{fallbackLabel}</span>
            ) : (
              <div className="flex flex-wrap gap-2">
                {originalAccommodationTypes.map((type, index) => (
                  <span
                    key={type}
                    className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                  >
                    {originalAccommodationTypesDisplayLabels[index]}
                  </span>
                ))}
              </div>
            )}
          </dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
            {t('profile.fields.laundryAccess')}
          </dt>
          <dd className="text-sm font-medium text-[var(--text-primary)]">
            {isEditingAccommodation ? (
              <Combobox
                value={accommodationLaundryExpectation}
                onChange={(value: AccommodationLaundryAccessExpectationValue | null) => {
                  setAccommodationLaundryExpectation(value);
                  setAccommodationSaved(false);
                  setAccommodationSaveError(null);
                }}
              >
                <div className="relative">
                  <Combobox.Button className="flex w-72 max-w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary/30 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                    <span
                      className={
                        accommodationLaundryExpectation ? '' : 'text-[var(--text-secondary)] dark:text-slate-400'
                      }
                    >
                      {accommodationLaundryExpectation
                        ? accommodationLaundryLabelByValue.get(accommodationLaundryExpectation) ??
                          accommodationLaundryExpectation
                        : t('profile.actions.selectLaundryAccess', {
                            defaultValue: 'Select laundry access',
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
                      {t('profile.actions.selectLaundryAccess', {
                        defaultValue: 'Select laundry access',
                      })}
                    </Combobox.Option>
                    {ACCOMMODATION_LAUNDRY_OPTIONS.map((option) => (
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
              originalAccommodationLaundryExpectationDisplayLabel ?? fallbackLabel
            )}
          </dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
            {t('profile.fields.workspaceNeeded')}
          </dt>
          <dd className="text-sm font-medium text-[var(--text-primary)]">
            {isEditingAccommodation ? (
              <Combobox
                value={accommodationWorkspaceNeeded}
                onChange={(value: AccommodationWorkspacePreferenceValue | null) => {
                  setAccommodationWorkspaceNeeded(value);
                  setAccommodationSaved(false);
                  setAccommodationSaveError(null);
                }}
              >
                <div className="relative">
                  <Combobox.Button className="flex w-72 max-w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary/30 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                    <span
                      className={
                        accommodationWorkspaceNeeded ? '' : 'text-[var(--text-secondary)] dark:text-slate-400'
                      }
                    >
                      {accommodationWorkspaceNeeded
                        ? accommodationWorkspaceLabelByValue.get(accommodationWorkspaceNeeded) ??
                          accommodationWorkspaceNeeded
                        : t('profile.actions.selectWorkspacePreference', {
                            defaultValue: 'Select workspace preference',
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
                      {t('profile.actions.selectWorkspacePreference', {
                        defaultValue: 'Select workspace preference',
                      })}
                    </Combobox.Option>
                    {ACCOMMODATION_WORKSPACE_OPTIONS.map((option) => (
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
              originalAccommodationWorkspaceNeededDisplayLabel ?? fallbackLabel
            )}
          </dd>
        </div>
      </dl>
    </article>
  );
};

export default ProfileAccommodationSection;
