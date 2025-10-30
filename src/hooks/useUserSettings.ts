import { useCallback, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSupabaseQuery } from './useSupabaseQuery';
import { updateRecord } from '../services/supabaseCrud';
import type { QueryOptions } from '../services/supabaseCrud';
import type { UserSettings } from '../types/userSettings';
import type { ThemeSetting } from '../context/ThemeContext';

interface UpdateResult {
  success: boolean;
  error: Error | null;
}

interface UpdatePayload {
  theme?: ThemeSetting;
  language?: string;
  units?: UserSettings['units'];
  time_format?: UserSettings['time_format'];
}

export const useUserSettings = () => {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [updateResult, setUpdateResult] = useState<UpdateResult>({ success: false, error: null });
  const [isUpdating, setIsUpdating] = useState(false);

  type UserSettingsFilter = NonNullable<QueryOptions<UserSettings>['filter']>;

  const filter = useCallback<UserSettingsFilter>(
    (query) => (userId ? query.eq('user_id', userId) : query),
    [userId]
  );

  const queryOptions = useMemo(
    () => ({
      enabled: Boolean(userId),
      filter,
      limit: 1,
      columns:
        'user_id,theme,language,units,time_format,date_format,preferences,created_at,updated_at',
      dependencies: [userId],
    }),
    [filter, userId]
  );

  const { data, error, loading, refresh } = useSupabaseQuery<UserSettings>(
    'user_settings',
    queryOptions
  );

  const settings = useMemo(() => data[0] ?? null, [data]);

  const updateSettings = useCallback(
    async (payload: UpdatePayload) => {
      if (!userId) {
        setUpdateResult({
          success: false,
          error: new Error('You must be signed in to update settings.'),
        });
        return false;
      }

      try {
        setIsUpdating(true);
        setUpdateResult({ success: false, error: null });
        const { error: mutationError } = await updateRecord<UserSettings>(
          'user_settings',
          payload,
          {
            match: { user_id: userId },
            returning: false,
          }
        );

        if (mutationError) {
          throw mutationError;
        }

        setUpdateResult({ success: true, error: null });
        await refresh();
        return true;
      } catch (mutationError) {
        const normalized =
          mutationError instanceof Error
            ? mutationError
            : new Error('Failed to update user settings.');
        setUpdateResult({ success: false, error: normalized });
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [refresh, userId]
  );

  return {
    settings,
    error,
    loading,
    refresh,
    updateSettings,
    updateResult,
    isUpdating,
  } as const;
};

export type UseUserSettingsReturn = ReturnType<typeof useUserSettings>;
