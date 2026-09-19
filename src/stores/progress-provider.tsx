"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useStore } from "zustand";
import { createProgressStore, type ProgressStore } from "./progress-store";
import {
  createLearningEvents,
  type LearningEvents,
} from "@/lib/learning-events";

const ProgressContext = createContext<ReturnType<
  typeof createProgressStore
> | null>(null);
const HydrationContext = createContext(false);
const EventsContext = createContext<LearningEvents | null>(null);
export function ProgressProvider({ children }: { children: ReactNode }) {
  const [{ store, events }] = useState(() => {
    const events = createLearningEvents();
    return { events, store: createProgressStore(events) };
  });
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    // Restore saved progress before route effects are allowed to write to storage.
    Promise.resolve(store.persist?.rehydrate()).then(
      () => setHydrated(true),
      () => setHydrated(true),
    );
  }, [store]);
  return (
    <ProgressContext.Provider value={store}>
      <EventsContext.Provider value={events}>
        <HydrationContext.Provider value={hydrated}>
          {children}
        </HydrationContext.Provider>
      </EventsContext.Provider>
    </ProgressContext.Provider>
  );
}
export const useProgressReady = () => useContext(HydrationContext);
export function useLearningEvents() {
  const events = useContext(EventsContext);
  if (!events) throw new Error("useLearningEvents requires ProgressProvider");
  return events;
}
export function useProgress<T>(selector: (state: ProgressStore) => T): T {
  const store = useContext(ProgressContext);
  if (!store)
    throw new Error("useProgress must be used inside ProgressProvider");
  return useStore(store, selector);
}
