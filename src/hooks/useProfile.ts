import { useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSupabaseQuery } from './useSupabaseQuery';
import type { QueryOptions } from '../services/supabaseCrud';
import type { Profile } from '../types/profile';
import { getAvatarInitials, getUserAvatarUrl } from '../utils/getUserAvatarUrl';

export const useProfile = () => {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  type ProfileFilter = NonNullable<QueryOptions<Profile>['filter']>;

  const filter = useCallback<ProfileFilter>(
    (query) => (userId ? query.eq('user_id', userId) : query),
    [userId]
  );

  const queryOptions = useMemo(
    () => ({
      enabled: Boolean(userId),
      filter,
      limit: 1,
      columns:
        'user_id,user_firstname,user_lastname,core_country_of_residence,core_languages,travel_frequency_per_year,travel_avg_trip_duration_days,travel_countries_visited_count,travel_regions_often_visited,travel_usual_travel_styles,travel_seasonality_preference,transport_usual_transport_modes,transport_preferred_luggage_types,accommodation_common_types,accommodation_laundry_access_expectation,accommodation_workspace_needed,activity_sports_outdoor,activity_adventure_activities,activity_cultural_activities,sustainability_focus,sustainability_weight_priority,budget_level,budget_buy_at_destination_preference,budget_souvenir_space_preference,created_at,updated_at',
      dependencies: [userId],
    }),
    [filter, userId]
  );

  const { data, error, loading, refresh } = useSupabaseQuery<Profile>('profiles', queryOptions);

  const profile = useMemo(() => data[0] ?? null, [data]);
  const displayName = useMemo(() => {
    const name = user?.user_metadata?.display_name as string | undefined;
    return (name && name.trim().length > 0 ? name : undefined) ?? user?.email ?? null;
  }, [user]);
  const avatarUrl = useMemo(() => getUserAvatarUrl(user), [user]);
  const avatarInitials = useMemo(
    () =>
      getAvatarInitials(
        profile?.user_firstname ?? (user?.user_metadata?.first_name as string | null) ?? null,
        profile?.user_lastname ?? (user?.user_metadata?.last_name as string | null) ?? null,
        displayName
      ),
    [displayName, profile?.user_firstname, profile?.user_lastname, user?.user_metadata?.first_name, user?.user_metadata?.last_name]
  );

  const authMethod = useMemo(() => {
    if (!user) {
      return 'email';
    }

    const provider = user.app_metadata?.provider;

    if (typeof provider === 'string' && provider.trim().length > 0) {
      return provider;
    }

    if (Array.isArray(user.identities) && user.identities.length > 0) {
      const identityProvider = user.identities[0]?.provider;
      if (typeof identityProvider === 'string' && identityProvider.trim().length > 0) {
        return identityProvider;
      }
    }

    return 'email';
  }, [user]);

  return {
    profile,
    displayName,
    avatarUrl,
    avatarInitials,
    authMethod,
    error,
    loading,
    refresh,
  } as const;
};

export type UseProfileReturn = ReturnType<typeof useProfile>;
