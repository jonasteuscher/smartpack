import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const HEADER_OFFSET_MOBILE = 102;
    const HEADER_OFFSET_DESKTOP = 100;
    const HEADER_OFFSET = window.innerWidth < 768 ? HEADER_OFFSET_MOBILE : HEADER_OFFSET_DESKTOP;

    if (hash) {
      const target = document.querySelector(hash);
      if (target) {
        const element = target as HTMLElement;
        const rect = element.getBoundingClientRect();
        const scrollTop = window.pageYOffset + rect.top - HEADER_OFFSET;
        window.scrollTo({ top: scrollTop, behavior: 'smooth' });
      }
      return;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
