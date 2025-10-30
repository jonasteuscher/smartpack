import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import ScrollToTop from './components/common/ScrollToTop';
import LandingPage from './components/landing/LandingPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import TeamPage from './pages/TeamPage';
import JobsPage from './pages/JobsPage';
import ContactPage from './pages/ContactPage';
import AuthPage from './pages/AuthPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import PrivacyPage from './pages/PrivacyPage';
import GtcPage from './pages/GtcPage';
import ImpressumPage from './pages/ImpressumPage';
import DashboardLayout from './components/dashboard/DashboardLayout';
import DashboardHomePage from './pages/DashboardHomePage';
import TripsPage from './pages/TripsPage';
import OnboardPage from './pages/OnboardPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';

const StandaloneRedirect = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const navigatorWithStandalone = navigator as Navigator & {
      standalone?: boolean;
    };

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches || navigatorWithStandalone.standalone === true;

    if (isStandalone && location.pathname === '/') {
      navigate('/app/dashboard', { replace: true });
    }
  }, [location.pathname, navigate]);

  return null;
};

const App = () => {
  return (
    <main className="min-h-screen bg-[var(--surface-primary)] text-[var(--text-primary)]">
      <StandaloneRedirect />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/gtc" element={<GtcPage />} />
        <Route path="/impressum" element={<ImpressumPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route
          path="/app/onboard"
          element={
            <ProtectedRoute>
              <OnboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardHomePage />} />
          <Route path="trips" element={<TripsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </main>
  );
};

export default App;
