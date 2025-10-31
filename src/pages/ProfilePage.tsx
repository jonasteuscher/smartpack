import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../hooks/useProfile';
import ProfileHeaderSection from '@/components/profile/ProfileHeaderSection';
import ProfileCoreSection from '@/components/profile/ProfileCoreSection';
import ProfileTravelSection from '@/components/profile/ProfileTravelSection';
import ProfileTransportSection from '@/components/profile/ProfileTransportSection';
import ProfileAccommodationSection from '@/components/profile/ProfileAccommodationSection';
import ProfileActivitiesSection from '@/components/profile/ProfileActivitiesSection';
import ProfileSustainabilitySection from '@/components/profile/ProfileSustainabilitySection';
import ProfileBudgetSection from '@/components/profile/ProfileBudgetSection';

type ProfileSectionKey =
  | 'core'
  | 'travel'
  | 'transport'
  | 'accommodation'
  | 'activities'
  | 'sustainability'
  | 'budget';

const ProfilePage = () => {
  const { t } = useTranslation('dashboard');
  const { user } = useAuth();
  const {
    profile,
    loading,
    error,
    refresh,
    avatarUrl,
    avatarInitials,
    displayName,
    authMethod,
  } = useProfile();

  const [refreshing, setRefreshing] = useState(false);
  const [refreshSignal, setRefreshSignal] = useState(0);
  const [editingState, setEditingState] = useState<Record<ProfileSectionKey, boolean>>({
    core: false,
    travel: false,
    transport: false,
    accommodation: false,
    activities: false,
    sustainability: false,
    budget: false,
  });

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setRefreshSignal((prev) => prev + 1);
      await refresh();
    } finally {
      setRefreshing(false);
    }
  };

  const handleEditingChange = (section: ProfileSectionKey) => (isEditing: boolean) => {
    setEditingState((prev) => {
      if (prev[section] === isEditing) {
        return prev;
      }
      return { ...prev, [section]: isEditing };
    });
  };

  const isAnySectionEditing = Object.values(editingState).some(Boolean);

  return (
    <section className="flex flex-col gap-6">
      <ProfileHeaderSection
        profile={profile ?? null}
        user={user ?? null}
        avatarUrl={avatarUrl ?? null}
        avatarInitials={avatarInitials ?? ''}
        displayName={displayName ?? null}
        authMethod={authMethod ?? null}
        loading={loading}
        refreshing={refreshing}
        disableRefresh={isAnySectionEditing}
        onRefresh={handleRefresh}
        refreshProfile={refresh}
      />

      {loading ? (
        <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/60 p-6 shadow dark:border-slate-800/60 dark:bg-slate-900/60">
          <p className="text-sm font-medium text-[var(--text-secondary)]">
            {t('profile.state.loading')}
          </p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
          {t('profile.state.error')}
        </div>
      ) : profile ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <ProfileCoreSection
            profile={profile}
            user={user ?? null}
            authMethod={authMethod ?? null}
            refreshProfile={refresh}
            refreshSignal={refreshSignal}
            onEditingChange={handleEditingChange('core')}
          />
          <ProfileTravelSection
            profile={profile}
            user={user ?? null}
            refreshProfile={refresh}
            refreshSignal={refreshSignal}
            onEditingChange={handleEditingChange('travel')}
          />
          <ProfileTransportSection
            profile={profile}
            user={user ?? null}
            refreshProfile={refresh}
            refreshSignal={refreshSignal}
            onEditingChange={handleEditingChange('transport')}
          />
          <ProfileAccommodationSection
            profile={profile}
            user={user ?? null}
            refreshProfile={refresh}
            refreshSignal={refreshSignal}
            onEditingChange={handleEditingChange('accommodation')}
          />
          <ProfileActivitiesSection
            profile={profile}
            user={user ?? null}
            refreshProfile={refresh}
            refreshSignal={refreshSignal}
            onEditingChange={handleEditingChange('activities')}
          />
          <ProfileSustainabilitySection
            profile={profile}
            user={user ?? null}
            refreshProfile={refresh}
            refreshSignal={refreshSignal}
            onEditingChange={handleEditingChange('sustainability')}
          />
          <ProfileBudgetSection
            profile={profile}
            user={user ?? null}
            refreshProfile={refresh}
            refreshSignal={refreshSignal}
            onEditingChange={handleEditingChange('budget')}
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/60 p-6 text-sm text-[var(--text-secondary)] shadow dark:border-slate-800/60 dark:bg-slate-900/60">
          {t('profile.state.empty')}
        </div>
      )}
    </section>
  );
};

export default ProfilePage;
