import { useEffect, useMemo, useState } from 'react';
import { Combobox } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/20/solid';
import type { User } from '@supabase/supabase-js';
import { useTranslation } from 'react-i18next';
import { updateRecord } from '@/services/supabaseCrud';
import type {
  BudgetBuyPreference,
  BudgetLevel,
  BudgetSouvenirSpacePreference,
  Profile,
} from '@/types/profile';

interface BudgetLevelOption {
  value: BudgetLevel;
  translationKey: string;
  defaultLabel: string;
  emoji: string;
}

interface BudgetBuyPreferenceOption {
  value: BudgetBuyPreference;
  translationKey: string;
  defaultLabel: string;
  emoji: string;
}

interface BudgetSouvenirSpacePreferenceOption {
  value: BudgetSouvenirSpacePreference;
  translationKey: string;
  defaultLabel: string;
  emoji: string;
}

const BUDGET_LEVEL_OPTIONS: readonly BudgetLevelOption[] = [
  {
    value: 'low',
    translationKey: 'profile.budget.level.low',
    defaultLabel: '💸 Low-Budget / Sparsam',
    emoji: '💸',
  },
  {
    value: 'medium',
    translationKey: 'profile.budget.level.medium',
    defaultLabel: '⚖️ Mittelklasse / Ausgewogen',
    emoji: '⚖️',
  },
  {
    value: 'high',
    translationKey: 'profile.budget.level.high',
    defaultLabel: '✨ Komfortabel / Premium',
    emoji: '✨',
  },
  {
    value: 'luxury',
    translationKey: 'profile.budget.level.luxury',
    defaultLabel: '💎 Luxusreise',
    emoji: '💎',
  },
];

const BUDGET_BUY_PREFERENCE_OPTIONS: readonly BudgetBuyPreferenceOption[] = [
  {
    value: 'bring_all',
    translationKey: 'profile.budget.buyPreference.bring_all',
    defaultLabel: '🎒 Ich bringe alles von zu Hause mit',
    emoji: '🎒',
  },
  {
    value: 'buy_some',
    translationKey: 'profile.budget.buyPreference.buy_some',
    defaultLabel: '🧴 Nur Grundausstattung – Rest vor Ort',
    emoji: '🧴',
  },
  {
    value: 'buy_local',
    translationKey: 'profile.budget.buyPreference.buy_local',
    defaultLabel: '🛍️ Ich kaufe lieber lokal',
    emoji: '🛍️',
  },
  {
    value: 'decide_later',
    translationKey: 'profile.budget.buyPreference.decide_later',
    defaultLabel: '🧭 Ich entscheide spontan',
    emoji: '🧭',
  },
];

const BUDGET_SOUVENIR_SPACE_PREFERENCE_OPTIONS: readonly BudgetSouvenirSpacePreferenceOption[] = [
  {
    value: 'none',
    translationKey: 'profile.budget.souvenirSpace.none',
    defaultLabel: '🚫 Nein, kein Platz für Souvenirs',
    emoji: '🚫',
  },
  {
    value: 'some',
    translationKey: 'profile.budget.souvenirSpace.some',
    defaultLabel: '🎁 Etwas Platz einplanen',
    emoji: '🎁',
  },
  {
    value: 'extra',
    translationKey: 'profile.budget.souvenirSpace.extra',
    defaultLabel: '🧳 Ich plane bewusst mehr Platz ein',
    emoji: '🧳',
  },
  {
    value: 'expandable',
    translationKey: 'profile.budget.souvenirSpace.expandable',
    defaultLabel: '🛒 Ich kaufe vor Ort einen Zusatzkoffer',
    emoji: '🛒',
  },
];

const BUDGET_LEVEL_VALUES = BUDGET_LEVEL_OPTIONS.map((option) => option.value) as readonly BudgetLevel[];
const BUDGET_BUY_PREFERENCE_VALUES = BUDGET_BUY_PREFERENCE_OPTIONS.map(
  (option) => option.value
) as readonly BudgetBuyPreference[];
const BUDGET_SOUVENIR_SPACE_PREFERENCE_VALUES = BUDGET_SOUVENIR_SPACE_PREFERENCE_OPTIONS.map(
  (option) => option.value
) as readonly BudgetSouvenirSpacePreference[];

const isBudgetLevelValue = (value: unknown): value is BudgetLevel =>
  typeof value === 'string' && (BUDGET_LEVEL_VALUES as readonly string[]).includes(value);

const isBudgetBuyPreferenceValue = (value: unknown): value is BudgetBuyPreference =>
  typeof value === 'string' && (BUDGET_BUY_PREFERENCE_VALUES as readonly string[]).includes(value);

const isBudgetSouvenirSpacePreferenceValue = (
  value: unknown
): value is BudgetSouvenirSpacePreference =>
  typeof value === 'string' &&
  (BUDGET_SOUVENIR_SPACE_PREFERENCE_VALUES as readonly string[]).includes(value);

interface ProfileBudgetSectionProps {
  profile: Profile | null;
  user: User | null;
  refreshProfile: () => Promise<void>;
  refreshSignal: number;
  onEditingChange?: (isEditing: boolean) => void;
}

const ProfileBudgetSection = ({
  profile,
  user,
  refreshProfile,
  refreshSignal,
  onEditingChange,
}: ProfileBudgetSectionProps) => {
  const { t } = useTranslation('dashboard');

  const [budgetLevel, setBudgetLevel] = useState<BudgetLevel | null>(null);
  const [originalBudgetLevel, setOriginalBudgetLevel] = useState<BudgetLevel | null>(null);
  const [budgetBuyPreference, setBudgetBuyPreference] = useState<BudgetBuyPreference | null>(null);
  const [originalBudgetBuyPreference, setOriginalBudgetBuyPreference] =
    useState<BudgetBuyPreference | null>(null);
  const [budgetSouvenirSpace, setBudgetSouvenirSpace] =
    useState<BudgetSouvenirSpacePreference | null>(null);
  const [originalBudgetSouvenirSpace, setOriginalBudgetSouvenirSpace] =
    useState<BudgetSouvenirSpacePreference | null>(null);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [savingBudget, setSavingBudget] = useState(false);
  const [budgetSaveError, setBudgetSaveError] = useState<string | null>(null);
  const [budgetSaved, setBudgetSaved] = useState(false);

  useEffect(() => {
    onEditingChange?.(isEditingBudget);
  }, [isEditingBudget, onEditingChange]);

  useEffect(() => {
    setBudgetSaved(false);
    setBudgetSaveError(null);
  }, [refreshSignal]);

  useEffect(() => {
    const levelValue = isBudgetLevelValue(profile?.budget_level) ? profile?.budget_level : null;
    setOriginalBudgetLevel(levelValue);
    if (!isEditingBudget) {
      setBudgetLevel(levelValue);
    }
  }, [profile?.budget_level, isEditingBudget]);

  useEffect(() => {
    const buyValue = isBudgetBuyPreferenceValue(profile?.budget_buy_at_destination_preference)
      ? profile?.budget_buy_at_destination_preference
      : null;
    setOriginalBudgetBuyPreference(buyValue);
    if (!isEditingBudget) {
      setBudgetBuyPreference(buyValue);
    }
  }, [profile?.budget_buy_at_destination_preference, isEditingBudget]);

  useEffect(() => {
    const souvenirValue = isBudgetSouvenirSpacePreferenceValue(
      profile?.budget_souvenir_space_preference
    )
      ? profile?.budget_souvenir_space_preference
      : null;
    setOriginalBudgetSouvenirSpace(souvenirValue);
    if (!isEditingBudget) {
      setBudgetSouvenirSpace(souvenirValue);
    }
  }, [profile?.budget_souvenir_space_preference, isEditingBudget]);

  const budgetLevelLabelByValue = useMemo(() => {
    const map = new Map<BudgetLevel, string>();
    BUDGET_LEVEL_OPTIONS.forEach((option) => {
      map.set(option.value, t(option.translationKey, { defaultValue: `${option.emoji} ${option.defaultLabel}` }));
    });
    return map;
  }, [t]);

  const budgetBuyPreferenceLabelByValue = useMemo(() => {
    const map = new Map<BudgetBuyPreference, string>();
    BUDGET_BUY_PREFERENCE_OPTIONS.forEach((option) => {
      map.set(
        option.value,
        t(option.translationKey, { defaultValue: `${option.emoji} ${option.defaultLabel}` })
      );
    });
    return map;
  }, [t]);

  const budgetSouvenirSpaceLabelByValue = useMemo(() => {
    const map = new Map<BudgetSouvenirSpacePreference, string>();
    BUDGET_SOUVENIR_SPACE_PREFERENCE_OPTIONS.forEach((option) => {
      map.set(
        option.value,
        t(option.translationKey, { defaultValue: `${option.emoji} ${option.defaultLabel}` })
      );
    });
    return map;
  }, [t]);

  const budgetLevelDisplayLabel = budgetLevel
    ? budgetLevelLabelByValue.get(budgetLevel) ?? null
    : null;
  const budgetLevelProfileLabel = isBudgetLevelValue(profile?.budget_level)
    ? budgetLevelLabelByValue.get(profile?.budget_level as BudgetLevel) ?? null
    : null;

  const budgetBuyPreferenceDisplayLabel = budgetBuyPreference
    ? budgetBuyPreferenceLabelByValue.get(budgetBuyPreference) ?? null
    : null;
  const budgetBuyPreferenceProfileLabel = isBudgetBuyPreferenceValue(
    profile?.budget_buy_at_destination_preference
  )
    ? budgetBuyPreferenceLabelByValue.get(
        profile?.budget_buy_at_destination_preference as BudgetBuyPreference
      ) ?? null
    : null;

  const budgetSouvenirSpaceDisplayLabel = budgetSouvenirSpace
    ? budgetSouvenirSpaceLabelByValue.get(budgetSouvenirSpace) ?? null
    : null;
  const budgetSouvenirSpaceProfileLabel = isBudgetSouvenirSpacePreferenceValue(
    profile?.budget_souvenir_space_preference
  )
    ? budgetSouvenirSpaceLabelByValue.get(
        profile?.budget_souvenir_space_preference as BudgetSouvenirSpacePreference
      ) ?? null
    : null;

  const isBudgetLevelDirty = budgetLevel !== originalBudgetLevel;
  const isBudgetBuyPreferenceDirty = budgetBuyPreference !== originalBudgetBuyPreference;
  const isBudgetSouvenirSpaceDirty = budgetSouvenirSpace !== originalBudgetSouvenirSpace;

  const isBudgetDirty =
    isBudgetLevelDirty || isBudgetBuyPreferenceDirty || isBudgetSouvenirSpaceDirty;

  const handleStartEditingBudget = () => {
    setIsEditingBudget(true);
    setBudgetSaved(false);
    setBudgetSaveError(null);
    setBudgetLevel(originalBudgetLevel);
    setBudgetBuyPreference(originalBudgetBuyPreference);
    setBudgetSouvenirSpace(originalBudgetSouvenirSpace);
  };

  const handleCancelEditingBudget = () => {
    setIsEditingBudget(false);
    setBudgetSaved(false);
    setBudgetSaveError(null);
    setBudgetLevel(originalBudgetLevel);
    setBudgetBuyPreference(originalBudgetBuyPreference);
    setBudgetSouvenirSpace(originalBudgetSouvenirSpace);
  };

  const handleSaveBudget = async () => {
    if (!user?.id) {
      setBudgetSaveError(
        t('profile.errors.mustBeSignedIn', {
          defaultValue: 'Sign in to update your profile.',
        })
      );
      return;
    }

    if (!isBudgetDirty) {
      setIsEditingBudget(false);
      return;
    }

    try {
      setSavingBudget(true);
      setBudgetSaveError(null);

      const payload: Partial<Profile> = {};

      if (isBudgetLevelDirty) {
        payload.budget_level = budgetLevel;
      }

      if (isBudgetBuyPreferenceDirty) {
        payload.budget_buy_at_destination_preference = budgetBuyPreference;
      }

      if (isBudgetSouvenirSpaceDirty) {
        payload.budget_souvenir_space_preference = budgetSouvenirSpace;
      }

      if (Object.keys(payload).length === 0) {
        setIsEditingBudget(false);
        return;
      }

      const { error: updateError } = await updateRecord<Profile>('profiles', payload, {
        match: { user_id: user.id },
      });

      if (updateError) {
        throw updateError;
      }

      await refreshProfile();
      setIsEditingBudget(false);
      setBudgetSaved(true);
      setOriginalBudgetLevel(budgetLevel);
      setOriginalBudgetBuyPreference(budgetBuyPreference);
      setOriginalBudgetSouvenirSpace(budgetSouvenirSpace);
    } catch (saveError) {
      console.error('Failed to save budget preferences', saveError);
      setBudgetSaveError(
        saveError instanceof Error
          ? saveError.message
          : t('profile.errors.budgetSaveFailed', {
              defaultValue: 'We couldn’t save your budget preferences. Try again.',
            })
      );
    } finally {
      setSavingBudget(false);
    }
  };

  const fallbackLabel = t('profile.fallback.notSet');

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/60 p-6 shadow dark:border-slate-800/60 dark:bg-slate-900/60">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-lg font-semibold">{t('profile.sections.budget')}</h2>
        {isEditingBudget ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCancelEditingBudget}
              className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-brand-secondary hover:text-brand-secondary disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:text-slate-200 dark:hover:border-brand-primary dark:hover:text-brand-primary"
              disabled={savingBudget}
            >
              {t('profile.actions.cancel', { defaultValue: 'Cancel' })}
            </button>
            <button
              type="button"
              onClick={handleSaveBudget}
              className="rounded-full border border-brand-secondary bg-brand-secondary px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-secondary/90 disabled:cursor-not-allowed disabled:opacity-60 dark:border-brand-secondary"
              disabled={savingBudget}
            >
              {savingBudget
                ? t('profile.actions.saving', { defaultValue: 'Saving…' })
                : t('profile.actions.save', { defaultValue: 'Save' })}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleStartEditingBudget}
            className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-brand-secondary hover:text-brand-secondary disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:text-slate-200 dark:hover:border-brand-primary dark:hover:text-brand-primary"
            disabled={savingBudget}
          >
            {t('profile.actions.edit', { defaultValue: 'Edit' })}
          </button>
        )}
      </div>
      {budgetSaveError ? <p className="text-xs text-red-500">{budgetSaveError}</p> : null}
      {!budgetSaveError && budgetSaved ? (
        <p className="text-xs text-emerald-600">
          {t('profile.state.settingsSaved', { defaultValue: 'Your settings have been saved.' })}
        </p>
      ) : null}
      <dl className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <dt className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
            {t('profile.fields.budgetLevel')}
          </dt>
          <dd className="text-sm font-medium text-[var(--text-primary)]">
            {isEditingBudget ? (
              <Combobox
                value={budgetLevel}
                onChange={(value: BudgetLevel | null) => {
                  setBudgetLevel(value);
                  setBudgetSaved(false);
                  setBudgetSaveError(null);
                }}
              >
                <div className="relative">
                  <Combobox.Button className="flex w-64 max-w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary/30 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                    <span
                      className={budgetLevel ? '' : 'text-[var(--text-secondary)] dark:text-slate-400'}
                    >
                      {budgetLevelDisplayLabel ??
                        budgetLevelProfileLabel ??
                        t('profile.actions.selectBudgetLevel', {
                          defaultValue: 'Select your budget level',
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
                      {t('profile.actions.selectBudgetLevel', {
                        defaultValue: 'Select your budget level',
                      })}
                    </Combobox.Option>
                    {BUDGET_LEVEL_OPTIONS.map((option) => (
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
              budgetLevelProfileLabel ?? fallbackLabel
            )}
          </dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
            {t('profile.fields.buyAtDestination')}
          </dt>
          <dd className="text-sm font-medium text-[var(--text-primary)]">
            {isEditingBudget ? (
              <Combobox
                value={budgetBuyPreference}
                onChange={(value: BudgetBuyPreference | null) => {
                  setBudgetBuyPreference(value);
                  setBudgetSaved(false);
                  setBudgetSaveError(null);
                }}
              >
                <div className="relative">
                  <Combobox.Button className="flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary/30 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                    <span
                      className={
                        budgetBuyPreference ? '' : 'text-[var(--text-secondary)] dark:text-slate-400'
                      }
                    >
                      {budgetBuyPreferenceDisplayLabel ??
                        budgetBuyPreferenceProfileLabel ??
                        t('profile.actions.selectBudgetBuyPreference', {
                          defaultValue: 'Select your shopping preference',
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
                      {t('profile.actions.selectBudgetBuyPreference', {
                        defaultValue: 'Select your shopping preference',
                      })}
                    </Combobox.Option>
                    {BUDGET_BUY_PREFERENCE_OPTIONS.map((option) => (
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
              budgetBuyPreferenceProfileLabel ?? fallbackLabel
            )}
          </dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
            {t('profile.fields.souvenirSpace')}
          </dt>
          <dd className="text-sm font-medium text-[var(--text-primary)]">
            {isEditingBudget ? (
              <Combobox
                value={budgetSouvenirSpace}
                onChange={(value: BudgetSouvenirSpacePreference | null) => {
                  setBudgetSouvenirSpace(value);
                  setBudgetSaved(false);
                  setBudgetSaveError(null);
                }}
              >
                <div className="relative">
                  <Combobox.Button className="flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary/30 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                    <span
                      className={
                        budgetSouvenirSpace ? '' : 'text-[var(--text-secondary)] dark:text-slate-400'
                      }
                    >
                      {budgetSouvenirSpaceDisplayLabel ??
                        budgetSouvenirSpaceProfileLabel ??
                        t('profile.actions.selectBudgetSouvenirSpace', {
                          defaultValue: 'Select your souvenir space preference',
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
                      {t('profile.actions.selectBudgetSouvenirSpace', {
                        defaultValue: 'Select your souvenir space preference',
                      })}
                    </Combobox.Option>
                    {BUDGET_SOUVENIR_SPACE_PREFERENCE_OPTIONS.map((option) => (
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
              budgetSouvenirSpaceProfileLabel ?? fallbackLabel
            )}
          </dd>
        </div>
      </dl>
    </article>
  );
};

export default ProfileBudgetSection;
