import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type ThemeSetting = 'light' | 'dark' | 'system';
export type EffectiveTheme = 'light' | 'dark';

interface ThemeContextValue {
  theme: ThemeSetting;
  effectiveTheme: EffectiveTheme;
  toggleTheme: () => void;
  setTheme: (theme: ThemeSetting) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const resolveSystemTheme = (): EffectiveTheme => {
  if (typeof window === 'undefined') {
    return 'light';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const getInitialState = () => {
  if (typeof window === 'undefined') {
    return { theme: 'system' as ThemeSetting, effectiveTheme: 'light' as EffectiveTheme };
  }

  const stored = window.localStorage.getItem('smartpack-theme') as ThemeSetting | null;
  const themeSetting: ThemeSetting =
    stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';

  const effectiveTheme: EffectiveTheme =
    themeSetting === 'system' ? resolveSystemTheme() : themeSetting;

  return { theme: themeSetting, effectiveTheme };
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const initialState = getInitialState();
  const [theme, setThemeState] = useState<ThemeSetting>(initialState.theme);
  const [effectiveTheme, setEffectiveTheme] = useState<EffectiveTheme>(initialState.effectiveTheme);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (theme === 'system') {
      setEffectiveTheme((current) => {
        const resolved = resolveSystemTheme();
        return current === resolved ? current : resolved;
      });
    } else {
      setEffectiveTheme((current) => (current === theme ? current : theme));
    }

    window.localStorage.setItem('smartpack-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const root = document.documentElement;
    root.setAttribute('data-theme', effectiveTheme);

    if (effectiveTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [effectiveTheme]);

  useEffect(() => {
    if (typeof window === 'undefined' || theme !== 'system') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (event: MediaQueryListEvent) => {
      setEffectiveTheme(event.matches ? 'dark' : 'light');
    };

    setEffectiveTheme(mediaQuery.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', handler);

    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const setTheme = useCallback((value: ThemeSetting) => {
    setThemeState(value);
  }, []);

  const value = useMemo(
    () => ({ theme, effectiveTheme, toggleTheme, setTheme }),
    [theme, effectiveTheme, toggleTheme, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
};
