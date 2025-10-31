import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowPathIcon, InformationCircleIcon } from '@heroicons/react/20/solid';
import { useTranslation } from 'react-i18next';
import { useUserSettings } from '@hooks/useUserSettings';
import type { User } from '@supabase/supabase-js';
import { uploadProfileAvatar, removeProfileAvatar } from '@/services/profileAvatar';
import { formatDateTimeWithPreference } from '@/utils/formatDateTime';
import type { Profile } from '@/types/profile';

interface ProfileHeaderSectionProps {
  profile: Profile | null;
  user: User | null;
  avatarUrl: string | null;
  avatarInitials: string;
  displayName: string | null;
  authMethod: string | null;
  loading: boolean;
  refreshing: boolean;
  disableRefresh?: boolean;
  onRefresh: () => Promise<void> | void;
  refreshProfile: () => Promise<void>;
}

const ProfileHeaderSection = ({
  profile,
  user,
  avatarUrl,
  avatarInitials,
  displayName,
  authMethod,
  loading,
  refreshing,
  disableRefresh,
  onRefresh,
  refreshProfile,
}: ProfileHeaderSectionProps) => {
  const { t, i18n } = useTranslation('dashboard');
  const { settings } = useUserSettings();

  const [localAvatarUrl, setLocalAvatarUrl] = useState<string | null>(avatarUrl);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [removingAvatar, setRemovingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setLocalAvatarUrl(avatarUrl);
  }, [avatarUrl]);

  const resolvedName = useMemo(() => {
    const firstName =
      profile?.user_firstname ?? (user?.user_metadata?.first_name as string | undefined);
    const lastName =
      profile?.user_lastname ?? (user?.user_metadata?.last_name as string | undefined);

    const combinedName = [firstName, lastName]
      .map((value) => (typeof value === 'string' ? value.trim() : ''))
      .filter(Boolean)
      .join(' ');

    if (combinedName.length > 0) {
      return combinedName;
    }

    const metadataDisplayName = (user?.user_metadata?.display_name as string | undefined)?.trim();
    if (metadataDisplayName) {
      return metadataDisplayName;
    }

    if (displayName && displayName.trim().length > 0) {
      return displayName;
    }

    return user?.email ?? t('profile.fallback.notSet');
  }, [displayName, profile?.user_firstname, profile?.user_lastname, t, user]);

  const locale = i18n.language;
  const resolvedTimeFormat = settings?.time_format ?? '24h';

  const formatDateTime = useCallback(
    (value: string | Date | null | undefined) =>
      formatDateTimeWithPreference(value, {
        locale,
        timeFormat: resolvedTimeFormat,
      }),
    [locale, resolvedTimeFormat]
  );

  const memberSince = useMemo(() => {
    if (!profile?.created_at) {
      return null;
    }
    const date = new Date(profile.created_at);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    try {
      return new Intl.DateTimeFormat(locale || undefined, {
        month: 'long',
        year: 'numeric',
      }).format(date);
    } catch {
      return date.toLocaleDateString(locale || undefined, {
        month: 'long',
        year: 'numeric',
      });
    }
  }, [locale, profile?.created_at]);

  const lastUpdated = useMemo(
    () => formatDateTime(profile?.updated_at),
    [formatDateTime, profile?.updated_at]
  );

  const isGoogleSignIn = authMethod === 'google';
  const canManageAvatar = !isGoogleSignIn;

  const handleTriggerUpload = () => {
    setAvatarError(null);
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setAvatarError(
        t('profile.errors.avatarInvalidType', {
          defaultValue: 'Please choose an image file.',
        })
      );
      return;
    }

    if (!user) {
      setAvatarError(
        t('profile.errors.mustBeSignedIn', {
          defaultValue: 'Sign in to update your profile.',
        })
      );
      return;
    }

    try {
      setUploadingAvatar(true);
      setAvatarError(null);
      const publicUrl = await uploadProfileAvatar(user, file);
      setLocalAvatarUrl(publicUrl);
      await refreshProfile();
    } catch (uploadError) {
      const message =
        uploadError instanceof Error
          ? uploadError.message === 'avatar_upload_forbidden'
            ? t('profile.errors.avatarUploadForbidden', {
                defaultValue:
                  'Uploading is blocked by storage policies. Please contact support to enable profile photo uploads.',
              })
            : uploadError.message
          : t('profile.errors.avatarUploadFailed', {
              defaultValue: 'We couldn’t upload your profile picture. Try again.',
            });
      setAvatarError(message);
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = async () => {
    if (removingAvatar) {
      return;
    }

    if (!user) {
      setAvatarError(
        t('profile.errors.mustBeSignedIn', {
          defaultValue: 'Sign in to update your profile.',
        })
      );
      return;
    }

    try {
      setRemovingAvatar(true);
      setAvatarError(null);
      await removeProfileAvatar(user);
      setLocalAvatarUrl(null);
      await refreshProfile();
    } catch (removeError) {
      const message =
        removeError instanceof Error
          ? removeError.message
          : t('profile.errors.avatarRemoveFailed', {
              defaultValue: 'We couldn’t remove your profile picture. Try again.',
            });
      setAvatarError(message);
    } finally {
      setRemovingAvatar(false);
    }
  };

  return (
    <header className="rounded-2xl border border-white/10 bg-white/70 p-6 shadow dark:border-slate-800/70 dark:bg-slate-900/70">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col items-center gap-4 lg:w-72">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white shadow dark:border-slate-700 dark:bg-slate-800">
            {localAvatarUrl ? (
              <img
                src={localAvatarUrl}
                alt={resolvedName}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="text-2xl font-semibold text-slate-600 dark:text-slate-200">
                {avatarInitials}
              </span>
            )}
          </div>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-3xl font-semibold">{resolvedName}</h1>
            {memberSince ? (
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {t('profile.memberSince', {
                  defaultValue: 'Member since {{date}}',
                  date: memberSince,
                })}
              </p>
            ) : null}
          </div>
          {canManageAvatar ? (
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={handleTriggerUpload}
                className="flex-1 rounded-full border border-dashed border-slate-300 px-4 py-2 text-xs font-semibold text-slate-500 transition hover:border-brand-secondary hover:text-brand-secondary disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:text-slate-300 dark:hover:border-brand-primary dark:hover:text-brand-primary"
                disabled={uploadingAvatar || removingAvatar}
              >
                {uploadingAvatar
                  ? t('profile.actions.updateAvatarUploading', { defaultValue: 'Uploading…' })
                  : t('profile.actions.updateAvatar', { defaultValue: 'Change photo' })}
              </button>
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="flex-1 rounded-full border border-red-300 px-4 py-2 text-xs font-semibold text-red-500 transition hover:border-red-400 hover:bg-red-500/10 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-500/80 dark:text-red-300 dark:hover:border-red-400"
                disabled={removingAvatar || uploadingAvatar || !localAvatarUrl}
              >
                {removingAvatar
                  ? t('profile.actions.removeAvatarRemoving', { defaultValue: 'Removing…' })
                  : t('profile.actions.removeAvatar', { defaultValue: 'Remove photo' })}
              </button>
            </div>
          ) : null}
          {avatarError ? <p className="text-xs text-red-500">{avatarError}</p> : null}
        </div>

        <div className="flex flex-1 flex-col gap-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
              <h2 className="text-3xl font-semibold">
                {t('profile.sections.details', { defaultValue: 'Profile' })}
              </h2>
              <div className="flex flex-col items-start gap-1 text-left sm:flex-row sm:items-center sm:gap-3">
                <button
                  type="button"
                  onClick={onRefresh}
                  className="flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-brand-secondary hover:text-brand-secondary disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:text-slate-200 dark:hover:border-brand-primary dark:hover:text-brand-primary"
                  disabled={refreshing || loading || disableRefresh}
                >
                  <ArrowPathIcon
                    className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
                    aria-hidden="true"
                  />
                  {refreshing
                    ? t('profile.actions.refreshing', { defaultValue: 'Refreshing…' })
                    : t('profile.actions.refresh', { defaultValue: 'Refresh' })}
                </button>
                {lastUpdated ? (
                  <span className="text-xs text-[var(--text-secondary)] dark:text-slate-300">
                    {t('profile.lastUpdated', {
                      defaultValue: 'Last updated {{date}}',
                      date: lastUpdated,
                    })}
                  </span>
                ) : null}
              </div>
            </div>
            <p className="text-s text-[var(--text-secondary)]">
              {t('profile.subheading', {
                defaultValue: 'View and update your personal information.',
              })}
            </p>
            <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-slate-700/70 dark:bg-slate-800/70">
              <InformationCircleIcon
                className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-secondary dark:text-brand-primary"
                aria-hidden="true"
              />
              <p className="text-xs leading-relaxed text-[var(--text-secondary)] dark:text-slate-200">
                {t('profile.description', {
                  defaultValue:
                    'The more you tell us about yourself, the better we can tailor your packing lists to you and your trips. That way you get suggestions that truly match your style, your activities, and your destination.',
                })}
              </p>
            </div>
          </div>

        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarChange}
      />
    </header>
  );
};

export default ProfileHeaderSection;
