"use client";

import { useEffect } from "react";

export function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".reveal:not(.in)");
    if (!els.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e, i) => {
          if (e.isIntersecting) {
            window.setTimeout(() => e.target.classList.add("in"), i * 60);
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -8% 0px" },
    );

    els.forEach((el) => obs.observe(el));

    // Catch elements already in viewport on mount (the observer fires async).
    // Force-check on the next animation frame.
    const raf = window.requestAnimationFrame(() => {
      els.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.classList.add("in");
        }
      });
    });

    return () => {
      window.cancelAnimationFrame(raf);
      obs.disconnect();
    };
  }, []);
}
