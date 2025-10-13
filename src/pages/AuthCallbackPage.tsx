import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../utils/supabaseClient';

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation('auth');

  useEffect(() => {
    let isMounted = true;

    const handleRedirect = async () => {
      try {
        if (typeof window === 'undefined') {
          return;
        }

        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
        const queryParams = new URLSearchParams(window.location.search);

        let handled = false;

        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken || refreshToken) {
          handled = true;

          if (!accessToken || !refreshToken) {
            if (isMounted) {
              setError(t('callback.errors.missingTokenInfo'));
            }
          } else {
            const { error: setSessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (setSessionError) {
              if (isMounted) {
                setError(setSessionError.message);
              }
            } else if (isMounted) {
              window.history.replaceState(window.history.state, '', `${location.pathname}`);
              window.location.replace('/dashboard');
              return;
            }
          }
        }

        const code = queryParams.get('code');

        if (code) {
          handled = true;

          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            if (isMounted) {
              setError(exchangeError.message);
            }
          } else if (isMounted) {
            window.history.replaceState(window.history.state, '', `${location.pathname}`);
            window.location.replace('/dashboard');
            return;
          }
        }

        if (!handled && isMounted) {
          setError(t('callback.errors.missingCredentials'));
          navigate('/auth', { replace: true });
          return;
        }
      } catch (callbackError) {
        if (isMounted) {
          setError(
            callbackError instanceof Error ? callbackError.message : t('callback.body.error')
          );
        }
      } finally {
        if (isMounted) {
          setProcessing(false);
        }
      }
    };

    void handleRedirect();

    return () => {
      isMounted = false;
    };
  }, [location.pathname, navigate, t]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--surface-primary)] p-4">
      <div className="flex flex-col items-center gap-4 rounded-lg bg-white p-6 text-center shadow dark:bg-slate-900">
        <p className="text-lg font-semibold text-slate-900 dark:text-white">
          {error ? t('callback.heading.error') : t('callback.heading.loading')}
        </p>
        {error ? (
          <>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {error}
            </p>
            <button
              type="button"
              onClick={() => navigate('/auth', { replace: true })}
              className="rounded-md bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600"
            >
              {t('callback.actions.back')}
            </button>
          </>
        ) : (
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {processing ? t('callback.body.redirecting') : t('callback.body.waiting')}
          </p>
        )}
      </div>
    </main>
  );
};

export default AuthCallbackPage;
