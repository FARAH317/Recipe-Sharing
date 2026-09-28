import { useEffect, useRef } from "react";
/**
 * Adds the "in" class to the element once it scrolls into view.
 * Pair with the .reveal / .reveal-stagger classes in styles.css.
 */
export default function useScrollReveal(options = {}) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("in");
          observer.disconnect();
        }
      },
      { threshold: 0.15, ...options }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}
