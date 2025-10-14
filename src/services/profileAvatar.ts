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
    if (uploadError.status === 403) {
      throw new Error('avatar_upload_forbidden');
    }
    throw uploadError;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);

  const { error: updateError } = await supabase.auth.updateUser({
    data: { avatar_url: publicUrl, updated_at: new Date().toISOString() },
  });

  if (updateError) {
    throw updateError;
  }

  return publicUrl;
};
