import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type BeforeInstallPromptEvent = Event & {
  readonly platforms?: string[];
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

const DISMISS_KEY = 'smartpack:pwaPromptDismissedAt';
const DISMISS_DURATION_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

const isStandaloneDisplayMode = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia('(display-mode: standalone)').matches || navigatorWithStandalone.standalone === true;
};

const isMobileDevice = () => {
  if (typeof navigator === 'undefined') {
    return false;
  }

  return /iphone|ipad|ipod|android/i.test(navigator.userAgent);
};

const isIos = () => {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') {
    return false;
  }

  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as typeof window & { MSStream?: unknown }).MSStream;
};

const wasRecentlyDismissed = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  const stored = window.localStorage.getItem(DISMISS_KEY);
  if (!stored) {
    return false;
  }

  const dismissedAt = Number.parseInt(stored, 10);
  if (Number.isNaN(dismissedAt)) {
    window.localStorage.removeItem(DISMISS_KEY);
    return false;
  }

  return Date.now() - dismissedAt < DISMISS_DURATION_MS;
};

const rememberDismiss = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(DISMISS_KEY, Date.now().toString());
};

type PromptType = 'event' | 'ios' | 'generic' | null;

const usePwaInstallPrompt = () => {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [promptType, setPromptType] = useState<PromptType>(null);
  const [hasBeforeInstallPromptFired, setHasBeforeInstallPromptFired] = useState(false);
  const [hasShownGenericPrompt, setHasShownGenericPrompt] = useState(false);
  const promptEventRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!isMobileDevice() || isStandaloneDisplayMode() || wasRecentlyDismissed()) {
      return;
    }

    let cancelled = false;

    const handleBeforeInstallPrompt = (event: Event) => {
      const beforeInstallEvent = event as BeforeInstallPromptEvent;
      beforeInstallEvent.preventDefault();
      promptEventRef.current = beforeInstallEvent;
      setPromptEvent(beforeInstallEvent);
      setPromptType('event');
      setIsVisible(true);
      setHasBeforeInstallPromptFired(true);
    };

    const handleAppInstalled = () => {
      setIsVisible(false);
      setPromptType(null);
      setPromptEvent(null);
      rememberDismiss();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (isIos()) {
      // iOS does not fire beforeinstallprompt; show instructions instead
      window.setTimeout(() => {
        if (!cancelled) {
          setPromptType('ios');
          setIsVisible(true);
        }
      }, 1500);
    }

    return () => {
      cancelled = true;
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!promptEvent) {
      return 'unavailable' as const;
    }

    try {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      return choice.outcome;
    } catch {
      return 'error' as const;
    } finally {
      promptEventRef.current = null;
      setPromptEvent(null);
      setIsVisible(false);
      setPromptType(null);
      rememberDismiss();
    }
  }, [promptEvent]);

  const dismiss = useCallback(() => {
    setIsVisible(false);
    setPromptType(null);
    setPromptEvent(null);
    promptEventRef.current = null;
    rememberDismiss();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handlePwaReady = () => {
      if (
        hasShownGenericPrompt ||
        hasBeforeInstallPromptFired ||
        promptEventRef.current ||
        isIos() ||
        !isMobileDevice() ||
        isStandaloneDisplayMode() ||
        wasRecentlyDismissed()
      ) {
        return;
      }

      window.setTimeout(() => {
        if (
          hasShownGenericPrompt ||
          hasBeforeInstallPromptFired ||
          promptEventRef.current ||
          isIos() ||
          !isMobileDevice() ||
          isStandaloneDisplayMode() ||
          wasRecentlyDismissed()
        ) {
          return;
        }

        setPromptType('generic');
        setIsVisible(true);
        setHasShownGenericPrompt(true);
      }, 1500);
    };

    window.addEventListener('pwa:ready', handlePwaReady);
    return () => {
      window.removeEventListener('pwa:ready', handlePwaReady);
    };
  }, [hasBeforeInstallPromptFired, hasShownGenericPrompt]);

  return useMemo(
    () => ({
      isVisible,
      promptType,
      promptInstall,
      dismiss
    }),
    [dismiss, isVisible, promptInstall, promptType]
  );
};

export default usePwaInstallPrompt;
