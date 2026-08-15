import { useEffect, useRef } from 'react';

/**
 * Attaches an IntersectionObserver to reveal elements with the `.reveal`
 * class as they scroll into the viewport. Call once per page/container.
 */
export function useScrollReveal(deps = []) {
  const containerRef = useRef(null);

  useEffect(() => {
    const root = containerRef.current;
    const targets = root
      ? root.querySelectorAll('.reveal')
      : document.querySelectorAll('.reveal');

    if (!targets.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return containerRef;
}
