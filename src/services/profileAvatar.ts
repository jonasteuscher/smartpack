import type { User } from '@supabase/supabase-js';
import { supabase } from '../utils/supabaseClient';

const BUCKET_NAME = 'profile-avatars';

const createFilePath = (userId: string, file: File) => {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const safeExt = ext.replace(/[^a-z0-9]/gi, '') || 'jpg';
  const fileName = `${crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`}.${safeExt}`;
  return `${userId}/${fileName}`;
};

export const uploadProfileAvatar = async (user: User, file: File) => {
  const path = createFilePath(user.id, file);

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) {
    const status = 'status' in uploadError ? (uploadError as { status?: number }).status : undefined;

    if (status === 403) {
      throw new Error('avatar_upload_forbidden');
    }
    throw uploadError;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);

  const { error: updateError } = await supabase.auth.updateUser({
    data: {
      avatar_url: publicUrl,
      avatar_storage_path: path,
      updated_at: new Date().toISOString(),
    },
  });

  if (updateError) {
    throw updateError;
  }

  return publicUrl;
};

export const removeProfileAvatar = async (user: User) => {
  const avatarPath = (user.user_metadata?.avatar_storage_path as string | undefined) ?? null;

  if (avatarPath) {
    const { error: deleteError } = await supabase.storage.from(BUCKET_NAME).remove([avatarPath]);

    if (deleteError) {
      const status = (deleteError as { status?: number }).status;
      if (status !== 404) {
        throw deleteError;
      }
    }
  }

  const { error: updateError } = await supabase.auth.updateUser({
    data: {
      avatar_url: null,
      avatar_storage_path: null,
      updated_at: new Date().toISOString(),
    },
  });

  if (updateError) {
    throw updateError;
  }
};
