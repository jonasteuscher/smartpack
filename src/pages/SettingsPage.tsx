import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useTheme, type ThemeSetting } from '@context/ThemeContext';
import { useUserSettings } from '@hooks/useUserSettings';
import { useAuth } from '@context/AuthContext';
import { formatDateTimeWithPreference } from '@/utils/formatDateTime';
import SettingsHeader, {
  type SettingsStatusMessage,
} from '@/components/settings/SettingsHeader';
import SettingsAppearanceSection from '@/components/settings/SettingsAppearanceSection';
import SettingsLanguageSection from '@/components/settings/SettingsLanguageSection';
import SettingsPreferencesSection from '@/components/settings/SettingsPreferencesSection';
import SettingsAccountInfoSection from '@/components/settings/SettingsAccountInfoSection';
import SettingsDeleteAccountSection from '@/components/settings/SettingsDeleteAccountSection';
import SettingsDeleteAccountDialog from '@/components/settings/SettingsDeleteAccountDialog';

const SettingsPage = () => {
  const { t, i18n } = useTranslation('dashboard');
  const { theme, setTheme } = useTheme();
  const { settings, loading, error, updateSettings, updateResult, isUpdating } = useUserSettings();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const resolvedTheme = (settings?.theme ?? theme ?? 'system') as ThemeSetting;

  const statusMessage = useMemo<SettingsStatusMessage | null>(() => {
    if (updateResult.error) {
      return {
        tone: 'error',
        text:
          updateResult.error.message ||
          t('settings.messages.saveFailed', {
            defaultValue: 'We could not save your preferences.',
          }),
      };
    }

    if (updateResult.success) {
      return {
        tone: 'success',
        text: t('settings.messages.saved', { defaultValue: 'Preferences saved.' }),
      };
    }

    return null;
  }, [t, updateResult.error, updateResult.success]);

  const locale = i18n.language;
  const resolvedTimeFormat = settings?.time_format ?? '24h';

  const formatDateTime = useCallback(
    (value: string | null | undefined) =>
      formatDateTimeWithPreference(value, {
        locale,
        timeFormat: resolvedTimeFormat,
      }),
    [locale, resolvedTimeFormat]
  );

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handleOpenDeleteDialog = useCallback(() => {
    setIsDeleteDialogOpen(true);
  }, []);

  const handleCloseDeleteDialog = useCallback(() => {
    setIsDeleteDialogOpen(false);
  }, []);

  const handleNavigateHome = useCallback(() => {
    navigate('/', { replace: true });
  }, [navigate]);

  return (
    <>
      <section className="flex flex-col gap-6">
        <SettingsHeader statusMessage={statusMessage} />

        <div className="grid gap-4 lg:grid-cols-2">
          <SettingsAppearanceSection
            resolvedTheme={resolvedTheme}
            loading={loading}
            isUpdating={isUpdating}
            applyTheme={setTheme}
            updateSettings={updateSettings}
          />
          <SettingsLanguageSection
            settingsLanguage={settings?.language ?? null}
            loading={loading}
            isUpdating={isUpdating}
            updateSettings={updateSettings}
          />
          <SettingsPreferencesSection
            settings={settings}
            loading={loading}
            error={error}
            isUpdating={isUpdating}
            updateSettings={updateSettings}
          />
          <SettingsAccountInfoSection
            settings={settings}
            loading={loading}
            error={error}
            formatDateTime={formatDateTime}
          />
          <SettingsDeleteAccountSection
            disabled={isDeletingAccount}
            onRequestDelete={handleOpenDeleteDialog}
          />
        </div>
      </section>

      <SettingsDeleteAccountDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        userId={user?.id ?? null}
        onSignOut={signOut}
        onNavigateHome={handleNavigateHome}
        onDeletingChange={setIsDeletingAccount}
      />
    </>
  );
};

export default SettingsPage;
