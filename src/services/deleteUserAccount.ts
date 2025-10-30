import { supabase } from '@/utils/supabaseClient';

interface DeleteTableConfig {
  name: string;
  column: string;
}

export interface DeleteUserAccountResult {
  success: boolean;
  message?: string;
}

const TABLES_TO_CLEANUP: readonly DeleteTableConfig[] = [
  { name: 'user_settings', column: 'user_id' },
  { name: 'profiles', column: 'user_id' }
];

const AUTH_DELETE_RPC = 'delete_user_account';

export const deleteUserAccount = async (userId: string): Promise<DeleteUserAccountResult> => {
  const errors: string[] = [];

  for (const { name, column } of TABLES_TO_CLEANUP) {
    const { error } = await supabase.from(name).delete().eq(column, userId);

    if (error) {
      errors.push(`${name}: ${error.message ?? 'unknown error'}`);
    }
  }

  const { error: rpcError } = await supabase.rpc(AUTH_DELETE_RPC);
  if (rpcError) {
    errors.push(`${AUTH_DELETE_RPC}: ${rpcError.message ?? 'unknown error'}`);
  }

  if (errors.length > 0) {
    return {
      success: false,
      message: errors.join(' | ')
    };
  }

  return { success: true };
};
