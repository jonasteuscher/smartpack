import type { PostgrestError, PostgrestFilterBuilder } from '@supabase/postgrest-js';
import type {
  ClientServerOptions,
  GenericSchema,
} from '@supabase/postgrest-js/dist/cjs/types/common/common';
import { supabase } from '../utils/supabaseClient';

type BaseRow = Record<string, unknown>;

type ParserError<Message extends string> = { error: true } & Message;
type GenericStringError = ParserError<'Received a generic string'>;

type SupabaseFilterBuilder = PostgrestFilterBuilder<
  ClientServerOptions,
  GenericSchema,
  BaseRow,
  GenericStringError[],
  string,
  unknown,
  'GET'
>;

type FilterFn = <Builder extends SupabaseFilterBuilder>(builder: Builder) => Builder;

export interface QueryOptions<T> {
  columns?: string;
  filter?: FilterFn;
  order?: {
    column: keyof T | string;
    ascending?: boolean;
    nullsFirst?: boolean;
  };
  limit?: number;
}

export interface MutationOptions<T> {
  returning?: boolean;
  select?: string;
  match?: Partial<T>;
}

export interface CrudResult<T> {
  data: T | null;
  error: PostgrestError | null;
}

export const fetchCollection = async <T = Record<string, unknown>>(
  table: string,
  options: QueryOptions<T> = {}
): Promise<CrudResult<T[]>> => {
  let query = supabase
    .from(table)
    .select(options.columns ?? '*') as SupabaseFilterBuilder;

  if (options.filter) {
    query = options.filter(query);
  }

  if (options.order) {
    query = query.order(options.order.column as string, {
      ascending: options.order.ascending ?? true,
      nullsFirst: options.order.nullsFirst ?? false,
    });
  }

  if (typeof options.limit === 'number') {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  return { data: (data as T[] | null) ?? null, error };
};

export const fetchSingle = async <T = Record<string, unknown>>(
  table: string,
  filter: FilterFn,
  columns = '*'
): Promise<CrudResult<T>> => {
  let query = supabase.from(table).select(columns).limit(1) as SupabaseFilterBuilder;
  query = filter(query);

  const { data, error } = await query.maybeSingle();
  return { data: (data as T) ?? null, error };
};

export const createRecord = async <T = Record<string, unknown>>(
  table: string,
  payload: T,
  options: MutationOptions<T> = {}
): Promise<CrudResult<T>> => {
  const mutation = supabase.from(table).insert(payload);

  if (options.returning === false) {
    const { data, error } = await mutation;
    return { data: (data as T | null) ?? null, error };
  }

  const { data, error } = await mutation.select(options.select ?? '*').single();
  return { data: (data as T) ?? null, error };
};

export const updateRecord = async <T = Record<string, unknown>>(
  table: string,
  payload: Partial<T>,
  options: MutationOptions<T> = {}
): Promise<CrudResult<T>> => {
  const matchCriteria = options.match ?? { id: (payload as { id?: string | number }).id };

  if (!matchCriteria || Object.values(matchCriteria).every((value) => value === undefined)) {
    throw new Error('updateRecord requires a match criteria (e.g., { id: value }).');
  }

  const mutation = supabase
    .from(table)
    .update(payload)
    .match(matchCriteria);

  if (options.returning === false) {
    const { data, error } = await mutation;
    return { data: (data as T | null) ?? null, error };
  }

  const { data, error } = await mutation.select(options.select ?? '*').single();
  return { data: (data as T) ?? null, error };
};

export const deleteRecord = async <T = Record<string, unknown>>(
  table: string,
  match: Partial<T>
): Promise<CrudResult<null>> => {
  const { error } = await supabase.from(table).delete().match(match);
  return { data: null, error };
};
