import { useEffect, useMemo, useState } from 'react';
import { Combobox } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/20/solid';
import type { User } from '@supabase/supabase-js';
import { useTranslation } from 'react-i18next';
import { updateRecord } from '@/services/supabaseCrud';
import type { Profile } from '@/types/profile';

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

interface ProfileTransportSectionProps {
  profile: Profile | null;
  user: User | null;
  refreshProfile: () => Promise<void>;
  refreshSignal: number;
  onEditingChange?: (isEditing: boolean) => void;
}

const ProfileTransportSection = ({
  profile,
  user,
  refreshProfile,
  refreshSignal,
  onEditingChange,
}: ProfileTransportSectionProps) => {
  const { t } = useTranslation('dashboard');

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
    onEditingChange?.(isEditingTransport);
  }, [isEditingTransport, onEditingChange]);

  useEffect(() => {
    setTransportSaved(false);
    setTransportSaveError(null);
  }, [refreshSignal]);

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

  const transportModeLabelByValue = useMemo(() => {
    const map = new Map<string, string>();
    TRANSPORT_MODE_OPTIONS.forEach((option) => {
      map.set(option.value, t(option.translationKey, { defaultValue: option.defaultLabel }));
    });
    return map;
  }, [t]);

  const luggageTypeLabelByValue = useMemo(() => {
    const map = new Map<string, string>();
    LUGGAGE_OPTIONS.forEach((option) => {
      map.set(option.value, t(option.translationKey, { defaultValue: option.defaultLabel }));
    });
    return map;
  }, [t]);

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

  const availableTransportModes = useMemo(() => {
    const chosen = new Set(transportModes);
    return TRANSPORT_MODE_OPTIONS.filter((option) => !chosen.has(option.value)).map((option) => ({
      value: option.value,
      label: transportModeLabelByValue.get(option.value) ?? option.defaultLabel,
    }));
  }, [transportModes, transportModeLabelByValue]);

  const availableLuggageTypes = useMemo(() => {
    const chosen = new Set(luggageTypes);
    return LUGGAGE_OPTIONS.filter((option) => !chosen.has(option.value)).map((option) => ({
      value: option.value,
      label: luggageTypeLabelByValue.get(option.value) ?? option.defaultLabel,
    }));
  }, [luggageTypeLabelByValue, luggageTypes]);

  const isTransportModesDirty =
    transportModes.length !== originalTransportModes.length ||
    transportModes.some((item, index) => item !== originalTransportModes[index]);
  const isLuggageTypesDirty =
    luggageTypes.length !== originalLuggageTypes.length ||
    luggageTypes.some((item, index) => item !== originalLuggageTypes[index]);

  const isTransportDirty = isTransportModesDirty || isLuggageTypesDirty;

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

  const handleRemoveTransportMode = (value: string) => {
    setTransportModes((prev) => normalizeTransportModes(prev.filter((item) => item !== value)));
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

  const handleRemoveLuggageType = (value: string) => {
    setLuggageTypes((prev) => normalizeLuggageTypes(prev.filter((item) => item !== value)));
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
        payload.transport_usual_transport_modes =
          normalizedModes.length > 0 ? normalizedModes : null;
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

      await refreshProfile();
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

  const fallbackLabel = t('profile.fallback.notSet');

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/60 p-6 shadow dark:border-slate-800/60 dark:bg-slate-900/60">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-lg font-semibold">{t('profile.sections.transport')}</h2>
        {isEditingTransport ? (
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
        )}
      </div>
      {transportSaveError ? <p className="text-xs text-red-500">{transportSaveError}</p> : null}
      {!transportSaveError && transportSaved ? (
        <p className="text-xs text-emerald-600">
          {t('profile.state.settingsSaved', { defaultValue: 'Your settings have been saved.' })}
        </p>
      ) : null}
      <dl className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <dt className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
            {t('profile.fields.transportModes')}
          </dt>
          <dd className="text-sm font-medium text-[var(--text-primary)]">
            {isEditingTransport ? (
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                  {transportModes.length === 0 ? (
                    <span className="text-xs text-[var(--text-secondary)]">{fallbackLabel}</span>
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
                  <div className="relative">
                    <Combobox
                      value={transportModeToAdd || null}
                      onChange={(value: string | null) => {
                        setTransportModeToAdd(value ?? '');
                      }}
                      disabled={savingTransport || availableTransportModes.length === 0}
                    >
                      <div className="relative">
                        <Combobox.Button className="flex w-52 items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary/30 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                          <span
                            className={
                              transportModeToAdd ? '' : 'text-[var(--text-secondary)] dark:text-slate-400'
                            }
                          >
                            {transportModeToAdd
                              ? transportModeLabelByValue.get(transportModeToAdd) ?? transportModeToAdd
                              : availableTransportModes.length === 0
                              ? t('profile.state.emptyOptions', { defaultValue: 'No options available.' })
                              : t('profile.actions.selectTransportMode', {
                                  defaultValue: 'Select transport mode',
                                })}
                          </span>
                          <ChevronUpDownIcon className="h-5 w-5 text-slate-500" aria-hidden="true" />
                        </Combobox.Button>
                        {availableTransportModes.length > 0 ? (
                          <Combobox.Options className="absolute z-10 mt-2 max-h-56 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-lg focus:outline-none dark:border-slate-700 dark:bg-slate-900">
                            {availableTransportModes.map((option) => (
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
                    onClick={handleAddTransportMode}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-secondary text-lg font-semibold text-brand-secondary transition hover:bg-brand-secondary hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!transportModeToAdd}
                    aria-label={t('profile.actions.addTransportMode', { defaultValue: 'Add transport mode' })}
                  >
                    +
                  </button>
                </div>
              </div>
            ) : originalTransportModes.length === 0 ? (
              <span className="text-xs text-[var(--text-secondary)]">{fallbackLabel}</span>
            ) : (
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
            )}
          </dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
            {t('profile.fields.luggageTypes')}
          </dt>
          <dd className="text-sm font-medium text-[var(--text-primary)]">
            {isEditingTransport ? (
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                  {luggageTypes.length === 0 ? (
                    <span className="text-xs text-[var(--text-secondary)]">{fallbackLabel}</span>
                  ) : (
                    luggageTypes.map((luggage, index) => (
                      <span
                        key={luggage}
                        className="flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                      >
                        {luggageTypesDisplayLabels[index]}
                        <button
                          type="button"
                          onClick={() => handleRemoveLuggageType(luggage)}
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
                  <div className="relative">
                    <Combobox
                      value={luggageTypeToAdd || null}
                      onChange={(value: string | null) => {
                        setLuggageTypeToAdd(value ?? '');
                      }}
                      disabled={savingTransport || availableLuggageTypes.length === 0}
                    >
                      <div className="relative">
                        <Combobox.Button className="flex w-52 items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary/30 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                          <span
                            className={
                              luggageTypeToAdd ? '' : 'text-[var(--text-secondary)] dark:text-slate-400'
                            }
                          >
                            {luggageTypeToAdd
                              ? luggageTypeLabelByValue.get(luggageTypeToAdd) ?? luggageTypeToAdd
                              : availableLuggageTypes.length === 0
                              ? t('profile.state.emptyOptions', { defaultValue: 'No options available.' })
                              : t('profile.actions.selectLuggageType', {
                                  defaultValue: 'Select luggage type',
                                })}
                          </span>
                          <ChevronUpDownIcon className="h-5 w-5 text-slate-500" aria-hidden="true" />
                        </Combobox.Button>
                        {availableLuggageTypes.length > 0 ? (
                          <Combobox.Options className="absolute z-10 mt-2 max-h-56 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-lg focus:outline-none dark:border-slate-700 dark:bg-slate-900">
                            {availableLuggageTypes.map((option) => (
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
                    onClick={handleAddLuggageType}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-secondary text-lg font-semibold text-brand-secondary transition hover:bg-brand-secondary hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!luggageTypeToAdd}
                    aria-label={t('profile.actions.addLuggageType', { defaultValue: 'Add luggage type' })}
                  >
                    +
                  </button>
                </div>
              </div>
            ) : originalLuggageTypes.length === 0 ? (
              <span className="text-xs text-[var(--text-secondary)]">{fallbackLabel}</span>
            ) : (
              <div className="flex flex-wrap gap-2">
                {originalLuggageTypes.map((luggage, index) => (
                  <span
                    key={luggage}
                    className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                  >
                    {originalLuggageTypesDisplayLabels[index]}
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

export default ProfileTransportSection;
