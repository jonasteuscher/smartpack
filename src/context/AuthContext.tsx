import {
  AuthError,
  OAuthResponse,
  Session,
  User,
} from '@supabase/supabase-js';
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';
import { supabase } from '../utils/supabaseClient';

interface EmailSignUpParams {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUpWithEmail: (params: EmailSignUpParams) => Promise<AuthError | null>;
  signInWithEmail: (email: string, password: string) => Promise<AuthError | null>;
  signInWithGoogle: () => Promise<OAuthResponse>;
  signInWithFacebook: () => Promise<OAuthResponse>;
  signOut: () => Promise<AuthError | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const initializeSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (isMounted) {
          setSession(data.session ?? null);
        }
      } catch (authError) {
        console.error('Supabase auth initialization failed', authError);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void initializeSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (isMounted) {
        setSession(currentSession ?? null);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUpWithEmail = useCallback(
    async ({ email, password, firstName, lastName }: EmailSignUpParams) => {
      const data: Record<string, string> = {};

      const displayName = [firstName, lastName]
        .map((value) => value?.trim())
        .filter(Boolean)
        .join(' ');

      if (firstName) {
        data.first_name = firstName;
      }

      if (lastName) {
        data.last_name = lastName;
      }

      if (displayName) {
        data.display_name = displayName;
      }

      const emailRedirectTo =
        typeof window !== 'undefined'
          ? `${window.location.origin}/auth/callback`
          : undefined;

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo,
          data,
        },
      });
      return error ?? null;
    },
    []
  );

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error) {
      setSession(data.session ?? null);
      setLoading(false);
    }

    return error ?? null;
  }, []);

  const callbackURL =
    typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined;

  const signInWithGoogle = useCallback(() => {
    setLoading(true);
    return supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callbackURL,
      },
    });
  }, [callbackURL]);

  const signInWithFacebook = useCallback(() => {
    setLoading(true);
    return supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: callbackURL,
      },
    });
  }, [callbackURL]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    return error ?? null;
  }, []);

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      session,
      loading,
      signUpWithEmail,
      signInWithEmail,
      signInWithGoogle,
      signInWithFacebook,
      signOut,
    }),
    [
      loading,
      session,
      signUpWithEmail,
      signInWithEmail,
      signInWithGoogle,
      signInWithFacebook,
      signOut,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
