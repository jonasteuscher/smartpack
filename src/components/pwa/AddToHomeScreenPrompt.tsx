import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import usePwaInstallPrompt from '@/hooks/usePwaInstallPrompt';

const AddToHomeScreenPrompt = () => {
  const { t } = useTranslation('pwa');
  const { isVisible, promptType, promptInstall, dismiss } = usePwaInstallPrompt();
  const [isInstalling, setIsInstalling] = useState(false);

  if (!isVisible || !promptType) {
    return null;
  }

  const handleInstall = async () => {
    if (isInstalling) {
      return;
    }

    setIsInstalling(true);
    await promptInstall();
    setIsInstalling(false);
  };

  const showInstallButton = promptType === 'event';
  const descriptionKey = promptType === 'ios' ? 'install.instructionsIos' : 'install.description';

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 sm:bottom-6 sm:px-6">
      <div className="pointer-events-auto w-full max-w-sm rounded-3xl border border-white/30 bg-white/90 p-6 shadow-xl backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/90">
        <div className="flex items-start gap-3">
          <img
            src="/img/logo/Logo_500x350_Emblem.PNG"
            alt="SmartPack"
            className="h-12 w-12 flex-shrink-0 rounded-full border border-white/60 object-cover shadow-sm dark:border-slate-800"
          />
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-secondary">
              {t('install.title')}
            </p>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t('install.heading')}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">{t(descriptionKey)}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={dismiss}
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-brand-secondary hover:text-brand-secondary dark:border-slate-600 dark:text-slate-300"
          >
            {t('install.dismiss')}
          </button>
          {showInstallButton && (
            <button
              type="button"
              onClick={handleInstall}
              disabled={isInstalling}
              className="inline-flex items-center gap-2 rounded-full bg-brand-secondary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-brand-primary disabled:cursor-not-allowed disabled:opacity-70"
            >
              {t(isInstalling ? 'install.installing' : 'install.cta')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddToHomeScreenPrompt;
