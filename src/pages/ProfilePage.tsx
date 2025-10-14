import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../hooks/useProfile';

const ProfilePage = () => {
  const { t } = useTranslation('dashboard');
  const { user } = useAuth();
  const { profile, loading, error, refresh } = useProfile();

  const formatValue = useCallback(
    (value: unknown) => {
      if (value === null || value === undefined) {
        return t('profile.fallback.notSet');
      }

      if (Array.isArray(value)) {
        return value.length ? value.join(', ') : t('profile.fallback.notSet');
      }

      if (typeof value === 'string') {
        return value.trim().length > 0 ? value : t('profile.fallback.notSet');
      }

      return String(value);
    },
    [t]
  );

  const sections = useMemo(
    () => [
      {
        title: t('profile.sections.details'),
        fields: [
          { label: t('profile.fields.firstname'), value: profile?.user_firstname ?? null },
          { label: t('profile.fields.lastname'), value: profile?.user_lastname ?? null },
          { label: t('profile.fields.email'), value: user?.email ?? null },
        ],
      },
      {
        title: t('profile.sections.core'),
        fields: [
          { label: t('profile.fields.country'), value: profile?.core_country_of_residence },
          { label: t('profile.fields.homeAirport'), value: profile?.core_home_airport_or_hub },
          { label: t('profile.fields.languages'), value: profile?.core_languages },
        ],
      },
      {
        title: t('profile.sections.travel'),
        fields: [
          { label: t('profile.fields.travelFrequency'), value: profile?.travel_frequency_per_year },
          { label: t('profile.fields.tripDuration'), value: profile?.travel_avg_trip_duration_days },
          { label: t('profile.fields.countriesVisited'), value: profile?.travel_countries_visited_count },
          { label: t('profile.fields.regionsVisited'), value: profile?.travel_regions_often_visited },
          { label: t('profile.fields.travelStyles'), value: profile?.travel_usual_travel_styles },
          { label: t('profile.fields.travelSeasonality'), value: profile?.travel_seasonality_preference },
        ],
      },
      {
        title: t('profile.sections.transport'),
        fields: [
          { label: t('profile.fields.transportModes'), value: profile?.transport_usual_transport_modes },
          { label: t('profile.fields.luggageTypes'), value: profile?.transport_preferred_luggage_types },
        ],
      },
      {
        title: t('profile.sections.accommodation'),
        fields: [
          { label: t('profile.fields.accommodationTypes'), value: profile?.accommodation_common_types },
          { label: t('profile.fields.laundryAccess'), value: profile?.accommodation_laundry_access_expectation },
          { label: t('profile.fields.workspaceNeeded'), value: profile?.accommodation_workspace_needed },
        ],
      },
      {
        title: t('profile.sections.activities'),
        fields: [
          { label: t('profile.fields.activitiesSports'), value: profile?.activity_sports_outdoor },
          { label: t('profile.fields.activitiesAdventure'), value: profile?.activity_adventure_activities },
          { label: t('profile.fields.activitiesCultural'), value: profile?.activity_cultural_activities },
        ],
      },
      {
        title: t('profile.sections.sustainability'),
        fields: [
          { label: t('profile.fields.sustainabilityFocus'), value: profile?.sustainability_focus },
          { label: t('profile.fields.sustainabilityWeight'), value: profile?.sustainability_weight_priority },
        ],
      },
      {
        title: t('profile.sections.budget'),
        fields: [
          { label: t('profile.fields.budgetLevel'), value: profile?.budget_level },
          { label: t('profile.fields.buyAtDestination'), value: profile?.budget_buy_at_destination_preference },
          { label: t('profile.fields.souvenirSpace'), value: profile?.budget_souvenir_space_preference },
        ],
      },
    ],
    [profile, t, user?.email]
  );

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold">{t('profile.heading')}</h1>
          <p className="text-sm text-[var(--text-secondary)]">{t('profile.subheading')}</p>
        </div>

        <button
          type="button"
          onClick={refresh}
          className="self-start rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-brand-secondary hover:text-brand-secondary dark:border-slate-600 dark:text-slate-200 dark:hover:border-brand-primary dark:hover:text-brand-primary"
        >
          {t('profile.actions.refresh')}
        </button>
      </header>

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
          {sections.map((section) => (
            <article
              key={section.title}
              className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/60 p-6 shadow dark:border-slate-800/60 dark:bg-slate-900/60"
            >
              <h2 className="text-lg font-semibold">{section.title}</h2>
              <dl className="grid gap-4 sm:grid-cols-2">
                {section.fields.map(({ label, value }) => (
                  <div key={label} className="flex flex-col gap-1">
                    <dt className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                      {label}
                    </dt>
                    <dd className="text-sm font-medium text-[var(--text-primary)]">
                      {formatValue(value)}
                    </dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
          <article className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/40 p-6 shadow dark:border-slate-800/60 dark:bg-slate-900/60">
            <h2 className="text-lg font-semibold">{t('profile.sections.meta')}</h2>
            <dl className="grid gap-4">
              <div className="flex flex-col gap-1">
                <dt className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                  {t('profile.fields.createdAt')}
                </dt>
                <dd className="text-sm font-medium text-[var(--text-primary)]">
                  {profile.created_at
                    ? new Date(profile.created_at).toLocaleString()
                    : t('profile.fallback.notAvailable')}
                </dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                  {t('profile.fields.updatedAt')}
                </dt>
                <dd className="text-sm font-medium text-[var(--text-primary)]">
                  {profile.updated_at
                    ? new Date(profile.updated_at).toLocaleString()
                    : t('profile.fallback.notAvailable')}
                </dd>
              </div>
            </dl>
          </article>
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
