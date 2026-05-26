"use client";

import type { RefObject } from "react";
import { useEffect, useRef, useState } from "react";

export function useInView(
  threshold = 0.12,
): [RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return [ref, inView];
}

export function useScrollY(): number {
  const [y, setY] = useState(0);

  useEffect(() => {
    const onScroll = () => setY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return y;
}

export function useCounter(target: number, active: boolean): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) {
      return;
    }

    const duration = 1600;
    const fps = 60;
    const steps = (duration / 1000) * fps;
    let index = 0;

    const intervalId = setInterval(() => {
      index += 1;
      const ease = 1 - Math.pow(1 - index / steps, 3);
      setValue(Math.round(target * ease));

      if (index >= steps) {
        setValue(target);
        clearInterval(intervalId);
      }
    }, 1000 / fps);

    return () => clearInterval(intervalId);
  }, [active, target]);

  return value;
}
