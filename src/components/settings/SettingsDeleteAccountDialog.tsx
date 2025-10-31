import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useTranslation } from 'react-i18next';
import { deleteUserAccount } from '@/services/deleteUserAccount';

interface SettingsDeleteAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  onSignOut: () => Promise<unknown>;
  onNavigateHome: () => void;
  onDeletingChange?: (value: boolean) => void;
}

const SettingsDeleteAccountDialog = ({
  isOpen,
  onClose,
  userId,
  onSignOut,
  onNavigateHome,
  onDeletingChange,
}: SettingsDeleteAccountDialogProps) => {
  const { t } = useTranslation('dashboard');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleDismiss = useCallback(() => {
    if (isDeletingAccount) {
      return;
    }
    onClose();
  }, [isDeletingAccount, onClose]);

  const handleConfirmDelete = useCallback(async () => {
    if (!userId) {
      setDeleteAccountError(
        t('settings.deleteAccount.error', {
          defaultValue: 'We could not delete your account. Please try again.',
        })
      );
      return;
    }

    setIsDeletingAccount(true);
    onDeletingChange?.(true);
    setDeleteAccountError(null);

    try {
      const result = await deleteUserAccount(userId);
      if (!result.success) {
        const baseMessage = t('settings.deleteAccount.error', {
          defaultValue: 'We could not delete your account. Please try again.',
        });
        setDeleteAccountError(result.message ? `${baseMessage} (${result.message})` : baseMessage);
        return;
      }

      const signOutError = await onSignOut();
      if (signOutError) {
        console.error('Sign out after deleting account failed', signOutError);
      }

      onClose();
      onNavigateHome();
    } catch (deleteError) {
      console.error('Failed to delete account', deleteError);
      setDeleteAccountError(
        t('settings.deleteAccount.error', {
          defaultValue: 'We could not delete your account. Please try again.',
        })
      );
    } finally {
      if (isMountedRef.current) {
        setIsDeletingAccount(false);
        onDeletingChange?.(false);
      } else {
        onDeletingChange?.(false);
      }
    }
  }, [onNavigateHome, onSignOut, onClose, onDeletingChange, t, userId]);

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleDismiss}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center px-4 py-8 sm:items-center sm:px-6">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 translate-y-6 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-6 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 shadow-2xl dark:border-red-500/40 dark:bg-slate-900">
                <div className="space-y-3">
                  <Dialog.Title className="text-lg font-semibold text-slate-900 dark:text-white">
                    {t('settings.deleteAccount.modal.title', {
                      defaultValue: 'Permanently delete account?',
                    })}
                  </Dialog.Title>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {t('settings.deleteAccount.modal.description', {
                      defaultValue:
                        'This will remove your profile, preferences, and any associated data from SmartPack.',
                    })}
                  </p>
                  <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                    {t('settings.deleteAccount.modal.warning', {
                      defaultValue: 'This action cannot be undone.',
                    })}
                  </p>
                  {deleteAccountError ? (
                    <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
                      {deleteAccountError}
                    </p>
                  ) : null}
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleDismiss}
                    disabled={isDeletingAccount}
                    className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:text-slate-100"
                  >
                    {t('settings.deleteAccount.modal.cancel', { defaultValue: 'Cancel' })}
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    disabled={isDeletingAccount}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {t(
                      isDeletingAccount
                        ? 'settings.deleteAccount.modal.deleting'
                        : 'settings.deleteAccount.modal.confirm',
                      {
                        defaultValue: isDeletingAccount ? 'Deleting…' : 'Delete account',
                      }
                    )}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default SettingsDeleteAccountDialog;
