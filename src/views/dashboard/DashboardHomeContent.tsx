import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';

const DashboardHomeContent = () => {
  const { t } = useTranslation('dashboard');
  const { user, signOut } = useAuth();
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return null;
  }

  const displayName =
    (user.user_metadata?.display_name as string | undefined)?.trim() ||
    [user.user_metadata?.first_name, user.user_metadata?.last_name]
      .map((value) => (typeof value === 'string' ? value.trim() : ''))
      .filter(Boolean)
      .join(' ');

  const handleSignOut = async () => {
    setError(null);
    const signOutError = await signOut();
    if (signOutError) {
      setError(signOutError.message);
    }
  };

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold">{t('home.heading')}</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          {t('home.signedInAs', {
            name: displayName || (user.email ?? 'SmartPack traveller'),
          })}
        </p>
      </header>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/40 p-6 shadow dark:border-slate-800/60 dark:bg-slate-900/60">
        <p className="text-sm text-[var(--text-secondary)]">{t('home.placeholder')}</p>
      </div>
    </section>
  );
};

export default DashboardHomeContent;
