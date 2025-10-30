import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8 px-4 text-center">
      <div className="space-y-4">
        <span className="inline-flex rounded-full bg-brand-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-brand-secondary">
          404
        </span>
        <h1 className="text-4xl font-semibold text-slate-900 dark:text-white md:text-5xl">
          Page not found
        </h1>
        <p className="max-w-xl text-sm text-slate-600 dark:text-slate-300 md:text-base">
          The page you are looking for might have been moved, renamed, or no longer exists. Check the URL or head to a
          different section.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-1 hover:bg-brand-secondary md:text-base"
        >
          Back to home
        </Link>
        <Link
          to="/app/dashboard"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-1 hover:border-brand-secondary hover:text-brand-secondary dark:border-slate-700 dark:text-slate-200 md:text-base"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
