"use client";

import { useEffect, useState, type RefObject } from "react";

export function useSceneActivity(ref: RefObject<HTMLElement | null>) {
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.01 },
    );
    observer.observe(element);
    const update = () => setPageVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", update);
    update();
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, [ref]);
  return visible && pageVisible;
}
