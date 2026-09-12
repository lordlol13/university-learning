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

const ProgressContext = createContext<ReturnType<
  typeof createProgressStore
> | null>(null);
const HydrationContext = createContext(false);
export function ProgressProvider({ children }: { children: ReactNode }) {
  const [store] = useState(createProgressStore);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    // Restore saved progress before route effects are allowed to write to storage.
    Promise.resolve(store.persist.rehydrate()).then(() => setHydrated(true));
  }, [store]);
  return (
    <ProgressContext.Provider value={store}>
      <HydrationContext.Provider value={hydrated}>
        {children}
      </HydrationContext.Provider>
    </ProgressContext.Provider>
  );
}
export const useProgressReady = () => useContext(HydrationContext);
export function useProgress<T>(selector: (state: ProgressStore) => T): T {
  const store = useContext(ProgressContext);
  if (!store)
    throw new Error("useProgress must be used inside ProgressProvider");
  return useStore(store, selector);
}
