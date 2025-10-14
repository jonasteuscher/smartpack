import type { User } from '@supabase/supabase-js';

const METADATA_KEYS = [
  'avatar_url',
  'picture',
  'profile_image_url',
  'profile_image',
  'image',
  'avatar',
  'photoURL',
];

const pickFromIdentity = (user: User | null | undefined): string | null => {
  const identityData = user?.identities?.find((identity) => identity.identity_data)?.identity_data;
  if (!identityData) {
    return null;
  }

  for (const key of METADATA_KEYS) {
    const value = identityData[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }

  return null;
};

export const getUserAvatarUrl = (user: User | null | undefined): string | null => {
  if (!user) {
    return null;
  }

  const metadata = user.user_metadata ?? {};

  for (const key of METADATA_KEYS) {
    const value = metadata[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }

  const providerAvatar = pickFromIdentity(user);
  if (providerAvatar) {
    return providerAvatar;
  }

  return null;
};

export const getAvatarInitials = (
  firstName?: string | null,
  lastName?: string | null,
  fallback?: string | null
): string => {
  const parts = [firstName, lastName]
    .map((value) => (typeof value === 'string' ? value.trim() : ''))
    .filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  if (parts.length === 1) {
    return parts[0][0]?.toUpperCase() ?? 'S';
  }

  const fallbackInitial = fallback?.trim()?.[0];
  if (fallbackInitial) {
    return fallbackInitial.toUpperCase();
  }

  return 'S';
};
