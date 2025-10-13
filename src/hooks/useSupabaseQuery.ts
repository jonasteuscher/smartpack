import { useCallback, useEffect, useMemo, useState } from 'react';
import type { PostgrestError } from '@supabase/supabase-js';
import type { QueryOptions } from '../services/supabaseCrud';
import { fetchCollection } from '../services/supabaseCrud';

interface SupabaseQueryState<T> {
  data: T[];
  loading: boolean;
  error: PostgrestError | null;
}

interface UseSupabaseQueryOptions<T> extends QueryOptions<T> {
  enabled?: boolean;
  dependencies?: unknown[];
}

export const useSupabaseQuery = <T = Record<string, unknown>>(
  table: string,
  options: UseSupabaseQueryOptions<T> = {}
) => {
  const {
    enabled = true,
    dependencies = [],
    columns,
    filter,
    order,
    limit,
  } = options;

  const [state, setState] = useState<SupabaseQueryState<T>>({
    data: [],
    error: null,
    loading: Boolean(enabled),
  });

  const load = useCallback(async () => {
    if (!enabled) {
      return;
    }

    setState((current) => ({ ...current, loading: true }));

    const { data, error } = await fetchCollection<T>(table, {
      columns,
      filter,
      order,
      limit,
    });

    setState({
      data: data ?? [],
      error,
      loading: false,
    });
  }, [columns, enabled, filter, limit, order, table]);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load, ...dependencies]);

  return useMemo(
    () => ({
      ...state,
      refresh: load,
    }),
    [state, load]
  );
};

export type UseSupabaseQueryReturn<T> = ReturnType<typeof useSupabaseQuery<T>>;
