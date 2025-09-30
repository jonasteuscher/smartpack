import { Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/common/ScrollToTop';
import LandingPage from './components/landing/LandingPage';
import TeamPage from './pages/TeamPage';
import JobsPage from './pages/JobsPage';
import ContactPage from './pages/ContactPage';

const App = () => {
  return (
    <main className="min-h-screen bg-[var(--surface-primary)] text-[var(--text-primary)]">
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
    </main>
  );
};

export default App;
