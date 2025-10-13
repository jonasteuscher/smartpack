import { Outlet } from 'react-router-dom';
import DashboardNavbar from './DashboardNavbar';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-[var(--surface-primary)] text-[var(--text-primary)]">
      <DashboardNavbar />
      <main className="container-responsive flex flex-col gap-6 pb-10 pt-8">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
