import { Routes, Route } from 'react-router-dom';
import LandingPage from './components/landing/LandingPage.tsx';
import TeamPage from './pages/TeamPage.tsx';
import JobsPage from './pages/JobsPage.tsx';
import ContactPage from './pages/ContactPage.tsx';

const App = () => {
  return (
    <main className="min-h-screen bg-[var(--surface-primary)] text-[var(--text-primary)]">
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
