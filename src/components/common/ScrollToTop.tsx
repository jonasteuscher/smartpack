import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const HEADER_OFFSET_MOBILE = 50;
    const HEADER_OFFSET_DESKTOP = 70;
    const HEADER_OFFSET = window.innerWidth < 768 ? HEADER_OFFSET_MOBILE : HEADER_OFFSET_DESKTOP;

    const isAnchorHash =
      typeof hash === 'string' &&
      hash.startsWith('#') &&
      /^[A-Za-z_][A-Za-z0-9_\-:.]*$/.test(hash.slice(1));

    if (typeof document !== 'undefined' && hash && isAnchorHash) {
      try {
        const target = document.querySelector<HTMLElement>(hash);
        if (target) {
          const rect = target.getBoundingClientRect();
          const scrollTop = window.pageYOffset + rect.top - HEADER_OFFSET;
          window.scrollTo({ top: scrollTop, behavior: 'smooth' });
          return;
        }
      } catch (queryError) {
        // ignore invalid selector errors and fall back to default scroll
      }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
