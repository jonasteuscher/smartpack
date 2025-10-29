import { supabase } from '../utils/supabaseClient';

interface EnsureProfileResult {
  hasProfile: boolean;
  profile: Record<string, unknown> | null;
}

interface EnsureProfileOptions {
  select?: string[];
}

const PROFILE_TABLE = 'profiles';
const USER_SETTINGS_TABLE = 'user_settings';

const ensureUserSettingsForUser = async (userId: string) => {
  const { error } = await supabase
    .from(USER_SETTINGS_TABLE)
    .upsert(
      { user_id: userId },
      {
        onConflict: 'user_id',
        returning: 'minimal',
      }
    );

  if (error && error.code !== '23505') {
    throw error;
  }
};

/**
 * Guarantees that a profile row exists for the provided user.
 * If default fields are supplied and the row exists with null/undefined values, they get populated.
 */
export const ensureProfileForUser = async (
  userId: string | null | undefined,
  defaultFields: Record<string, unknown> = {},
  options: EnsureProfileOptions = {}
): Promise<EnsureProfileResult> => {
  if (!userId) {
    return { hasProfile: false, profile: null };
  }

  const defaultFieldKeys = Object.keys(defaultFields).filter((key) => defaultFields[key] !== undefined);
  const selectColumnsSet = new Set<string>(['user_id']);
  for (const key of defaultFieldKeys) {
    selectColumnsSet.add(key);
  }

  if (Array.isArray(options.select)) {
    for (const column of options.select) {
      if (typeof column === 'string' && column.trim().length > 0) {
        selectColumnsSet.add(column.trim());
      }
    }
  }

  const selectColumns = Array.from(selectColumnsSet);

  const { data, error } = await supabase
    .from(PROFILE_TABLE)
    .select(selectColumns.join(','))
    .eq('user_id', userId)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

  let profileRecord: Record<string, unknown> | null = null;
  let createdProfile = false;

  if (isRecord(data)) {
    if (defaultFieldKeys.length > 0) {
      const updatePayload: Record<string, unknown> = {};

      for (const key of defaultFieldKeys) {
        const defaultValue = defaultFields[key];
        if (
          defaultValue !== undefined &&
          defaultValue !== null &&
          (data[key] === null || typeof data[key] === 'undefined')
        ) {
          updatePayload[key] = defaultValue;
        }
      }

      if (Object.keys(updatePayload).length > 0) {
        const { error: updateError } = await supabase
          .from(PROFILE_TABLE)
          .update(updatePayload)
          .eq('user_id', userId);

        if (updateError) {
          throw updateError;
        }

        Object.assign(data, updatePayload);
      }
    }

    profileRecord = data;
  }
  if (!profileRecord) {
    const payload: Record<string, unknown> = { user_id: userId, ...defaultFields };

    const { error: insertError } = await supabase.from(PROFILE_TABLE).upsert(payload, {
      onConflict: 'user_id',
    });

    if (insertError && insertError.code !== '23505') {
      throw insertError;
    }

    const { data: fetchedProfile, error: fetchError } = await supabase
      .from(PROFILE_TABLE)
      .select(selectColumns.join(','))
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    profileRecord = isRecord(fetchedProfile)
      ? fetchedProfile
      : ({ user_id: userId, ...defaultFields } as Record<string, unknown>);

    createdProfile = true;
  }

  if (!profileRecord) {
    profileRecord = { user_id: userId, ...defaultFields };
  }

  if (createdProfile) {
    await ensureUserSettingsForUser(userId);
  }

  return { hasProfile: true, profile: profileRecord };
};
