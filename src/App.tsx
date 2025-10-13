import { Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/common/ScrollToTop';
import LandingPage from './components/landing/LandingPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import TeamPage from './pages/TeamPage';
import JobsPage from './pages/JobsPage';
import ContactPage from './pages/ContactPage';
import AuthPage from './pages/AuthPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import DashboardLayout from './components/dashboard/DashboardLayout';
import DashboardHomePage from './pages/DashboardHomePage';
import PacklistsPage from './pages/PacklistsPage';
import ProfilePage from './pages/ProfilePage';

const App = () => {
  return (
    <main className="min-h-screen bg-[var(--surface-primary)] text-[var(--text-primary)]">
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHomePage />} />
          <Route path="packlists" element={<PacklistsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </main>
  );
};

export default App;
