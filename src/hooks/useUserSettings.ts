import { useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSupabaseQuery } from './useSupabaseQuery';
import type { QueryOptions } from '../services/supabaseCrud';
import type { UserSettings } from '../types/userSettings';

export const useUserSettings = () => {
  const { user } = useAuth();
  const userId = user?.id ?? null;

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

  return {
    settings,
    error,
    loading,
    refresh,
  } as const;
};

export type UseUserSettingsReturn = ReturnType<typeof useUserSettings>;
