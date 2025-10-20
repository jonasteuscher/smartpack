import { ReactNode, useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ensureProfileForUser } from '../../services/profile';

interface ProtectedRouteProps {
  children?: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [checkingProfile, setCheckingProfile] = useState(false);
  const [profileReady, setProfileReady] = useState<boolean | null>(null);
  const [profileData, setProfileData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    const userId = user?.id ?? null;

    if (!userId) {
      setCheckingProfile(false);
      setProfileReady(null);
      setProfileData(null);
      return;
    }

    let isMounted = true;
    setCheckingProfile(true);
    setProfileReady(null);
    setProfileData(null);

    const verifyProfile = async () => {
      try {
        const { hasProfile, profile } = await ensureProfileForUser(
          userId,
          {},
          { select: ['core_country_of_residence'] }
        );
        if (isMounted) {
          setProfileReady(hasProfile);
          setProfileData(profile);
        }
      } catch (profileError) {
        console.error('Failed to ensure profile for user', profileError);
        if (isMounted) {
          setProfileReady(false);
          setProfileData(null);
        }
      } finally {
        if (isMounted) {
          setCheckingProfile(false);
        }
      }
    };

    void verifyProfile();

    return () => {
      isMounted = false;
    };
  }, [user?.id, location.pathname]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-lg font-semibold">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  if (checkingProfile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-lg font-semibold">
        Loading profile...
      </div>
    );
  }

  const coreCountryRaw = profileData
    ? (profileData['core_country_of_residence'] as string | null | undefined)
    : null;
  const coreCountry = typeof coreCountryRaw === 'string' && coreCountryRaw.trim().length > 0 ? coreCountryRaw : null;
  const requiresOnboarding = profileReady === true && !coreCountry;

  if ((profileReady === false || requiresOnboarding) && location.pathname !== '/app/onboard') {
    return <Navigate to="/app/onboard" replace state={{ from: location }} />;
  }

  if (!requiresOnboarding && profileReady === true && location.pathname === '/app/onboard') {
    return <Navigate to="/app/dashboard" replace state={{ from: location }} />;
  }

  if (children) {
    return <>{children}</>;
  }

  return <Outlet />;
};

export default ProtectedRoute;
