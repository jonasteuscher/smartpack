import { Outlet } from 'react-router-dom';
import DashboardNavbar from './DashboardNavbar';
import FooterSection from '@/components/landing/sections/FooterSection';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-[var(--surface-primary)] text-[var(--text-primary)]">
      <DashboardNavbar />
      <main className="container-responsive flex flex-col gap-6 pb-10 pt-8">
        <Outlet />
      </main>
      <FooterSection />
    </div>
  );
};

export default DashboardLayout;
