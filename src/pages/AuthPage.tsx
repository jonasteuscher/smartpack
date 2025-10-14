import { useLocation, Navigate } from 'react-router-dom';
import AuthNavbar from '../components/auth/AuthNavbar';
import AuthForm from '../components/auth/AuthForm';
import { useAuth } from '../context/AuthContext';

const AuthPage = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-lg font-semibold">
        Loading...
      </div>
    );
  }

  if (user) {
    const target =
      ((location.state as { from?: { pathname?: string } } | null)?.from?.pathname) ??
      '/app/dashboard';
    return <Navigate to={target} replace />;
  }

  return (
    <>
      <AuthNavbar />
      <main className="flex min-h-[calc(100vh-120px)] items-center justify-center bg-[var(--surface-primary)] p-4">
        <AuthForm />
      </main>
    </>
  );
};

export default AuthPage;
