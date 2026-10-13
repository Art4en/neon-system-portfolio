import { useEffect, useState, type RefObject } from 'react';

/** IntersectionObserver simple : true quand l'élément est visible. */
export function useInView(
  ref: RefObject<Element | null>,
  {
    once = false,
    rootMargin = '0px',
    threshold = 0,
  }: { once?: boolean; rootMargin?: string; threshold?: number } = {},
): boolean {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) setInView(false);
      },
      { rootMargin, threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, once, rootMargin, threshold]);
  return inView;
}
