import { FormEvent, useState } from 'react';
import { ArrowRightIcon } from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';

const AuthForm = () => {
  const { t } = useTranslation('auth');
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, loading } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const translateErrorMessage = (message?: string | null) => {
    if (!message) {
      return t('form.errors.default');
    }

    const normalized = message.toLowerCase();
    const matches: Record<string, string> = {
      'invalid login credentials': t('form.errors.invalidCredentials'),
      'email not confirmed': t('form.errors.emailNotConfirmed'),
      'password should be at least 6 characters': t('form.errors.passwordTooShort'),
      'password should be at least 8 characters': t('form.errors.passwordTooShort'),
      'password should contain at least one uppercase letter, one lowercase letter, and one number':
        t('form.errors.passwordPolicy'),
    };

    const policyFragment =
      'password should be at least 8 characters. password should contain at least one character of each';

    if (matches[normalized]) {
      return matches[normalized];
    }

    if (normalized.includes('rate limit')) {
      return t('form.errors.rateLimited');
    }

    if (normalized.includes(policyFragment)) {
      return t('form.errors.passwordPolicy');
    }

    return message;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    setError(null);

    if (mode === 'signup' && password !== confirmPassword) {
      setError(t('form.errors.passwordsMismatch'));
      setSubmitting(false);
      return;
    }

    const authError =
      mode === 'signin'
        ? await signInWithEmail(email.trim(), password)
        : await signUpWithEmail({
            email: email.trim(),
            password,
            firstName: firstName.trim() || undefined,
            lastName: lastName.trim() || undefined,
          });

    if (authError) {
      setError(translateErrorMessage(authError.message));
    } else if (mode === 'signup') {
      setMode('signin');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setFirstName('');
      setLastName('');
      setFeedback(t('form.feedback.signUp'));
    } else {
      setConfirmPassword('');
      setFeedback(t('form.feedback.signIn'));
    }

    setSubmitting(false);
  };

  const handleOAuth = async () => {
    setError(null);
    setFeedback(null);

    const { error: oauthError } = await signInWithGoogle();

    if (oauthError) {
      setError(translateErrorMessage(oauthError.message));
    }
  };

  return (
    <section className="mx-auto flex w-full max-w-md flex-col gap-4 rounded-lg bg-[var(--surface-elevated)] p-6 shadow">
      <header>
        <h2 className="text-2xl font-semibold">
          {t(`form.titles.${mode === 'signin' ? 'signIn' : 'signUp'}`)}
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">{t('form.subtitle')}</p>
      </header>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-2 text-sm font-medium">
          {t('form.labels.email')}
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="rounded-md border border-gray-300 bg-[var(--surface-primary)] p-2 text-base"
            disabled={submitting || loading}
            placeholder={t('form.placeholders.email')}
          />
        </label>

        {mode === 'signup' && (
          <>
            <label className="flex flex-col gap-2 text-sm font-medium">
              {t('form.labels.firstName')}
              <input
                type="text"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                className="rounded-md border border-gray-300 bg-[var(--surface-primary)] p-2 text-base"
                disabled={submitting || loading}
                placeholder={t('form.placeholders.firstName')}
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium">
              {t('form.labels.lastName')}
              <input
                type="text"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                className="rounded-md border border-gray-300 bg-[var(--surface-primary)] p-2 text-base"
                disabled={submitting || loading}
                placeholder={t('form.placeholders.lastName')}
              />
            </label>
          </>
        )}

        <label className="flex flex-col gap-2 text-sm font-medium">
          {t('form.labels.password')}
          <input
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="rounded-md border border-gray-300 bg-[var(--surface-primary)] p-2 text-base"
            disabled={submitting || loading}
            placeholder={t('form.placeholders.password')}
          />
        </label>

        {mode === 'signup' && (
          <label className="flex flex-col gap-2 text-sm font-medium">
            {t('form.labels.confirmPassword')}
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="rounded-md border border-gray-300 bg-[var(--surface-primary)] p-2 text-base"
              disabled={submitting || loading}
              placeholder={t('form.placeholders.confirmPassword')}
            />
          </label>
        )}

        <button
          type="submit"
          className="rounded-md bg-blue-500 px-4 py-2 font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={submitting || loading}
        >
          {submitting
            ? t('form.submit.processing')
            : t(`form.submit.${mode === 'signin' ? 'signIn' : 'signUp'}`)}
        </button>
      </form>

      <div className="flex flex-col gap-2">
        <button
          onClick={handleOAuth}
          className="flex items-center justify-center gap-3 rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-primary hover:shadow disabled:cursor-not-allowed disabled:opacity-60"
          disabled={loading}
          type="button"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#4285F4]/40 bg-white">
            <svg aria-hidden viewBox="0 0 24 24" className="h-3.5 w-3.5">
              <path
                fill="#4285F4"
                d="M21.35 11.1H12v2.9h5.35c-.23 1.4-.95 2.6-2.03 3.4v2.8h3.28c1.92-1.77 3.03-4.38 3.03-7.5 0-.72-.07-1.42-.2-2.1z"
              />
              <path
                fill="#34A853"
                d="M12 22c2.7 0 4.96-.9 6.62-2.5l-3.28-2.8c-.91.6-2.08.95-3.34.95-2.56 0-4.72-1.73-5.49-4.05H3.12v2.86C4.77 19.87 8.09 22 12 22z"
              />
              <path
                fill="#FBBC05"
                d="M6.51 13.6c-.2-.6-.31-1.25-.31-1.9s.11-1.3.31-1.9V6.94H3.12A9.97 9.97 0 0 0 2 11.7c0 1.57.36 3.07 1.12 4.76l3.39-2.86z"
              />
              <path
                fill="#EA4335"
                d="M12 5.8c1.47 0 2.79.5 3.83 1.47l2.86-2.87C16.96 2.75 14.7 2 12 2 8.09 2 4.77 4.13 3.12 7.64l3.39 2.86C7.28 7.53 9.44 5.8 12 5.8z"
              />
            </svg>
          </span>
          <span className="flex items-center gap-1">
            {t('form.oauth.google')}
            <ArrowRightIcon className="h-4 w-4 text-slate-400" aria-hidden />
          </span>
        </button>

        <button
          onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin');
            setFeedback(null);
            setError(null);
            setFirstName('');
            setLastName('');
            setPassword('');
            setConfirmPassword('');
          }}
          className="text-sm font-medium text-blue-500 hover:underline"
          type="button"
        >
          {t(`form.toggle.${mode === 'signin' ? 'toSignUp' : 'toSignIn'}`)}
        </button>
      </div>

      {feedback && <p className="text-sm text-green-600">{feedback}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </section>
  );
};

export default AuthForm;
