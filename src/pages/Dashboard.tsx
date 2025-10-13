import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [error, setError] = useState<string | null>(null);
  console.log(JSON.stringify(user, null, 2));
  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    setError(null);
    const signOutError = await signOut();

    if (signOutError) {
      setError(signOutError.message);
    }
  };

  const displayName =
    (user.user_metadata?.display_name as string | undefined)?.trim() ||
    [user.user_metadata?.first_name, user.user_metadata?.last_name]
      .map((value) => (typeof value === 'string' ? value.trim() : ''))
      .filter(Boolean)
      .join(' ');

  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col gap-6 p-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          You are logged in as{' '}
          <span className="font-medium">
            {displayName || user.user_metadata?.full_name || 'New user'}
          </span>
        </p>
      </header>

      <button
        onClick={handleSignOut}
        className="self-start rounded-md border border-red-500 px-4 py-2 font-semibold text-red-500 transition hover:bg-red-500 hover:text-white"
        type="button"
      >
        Sign out
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </section>
  );
};

export default Dashboard;
