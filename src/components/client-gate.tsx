import { useEffect, useState, type ReactNode } from "react";
import { useLeakKeep } from "@/lib/store";

let loaded = false;
let pending: Promise<void> | null = null;

function ensureStore() {
  if (pending) return pending;
  const next = Promise.resolve(useLeakKeep.persist.rehydrate())
    .catch(() => undefined)
    .then(() => useLeakKeep.getState().load())
    .then(() => {
      loaded = !useLeakKeep.getState().loadError;
      if (!loaded) pending = null;
    });
  pending = next;
  return next;
}

export function ClientGate({ children, fallback }: { children: ReactNode; fallback: ReactNode }) {
  const [ready, setReady] = useState(loaded);
  const [attempt, setAttempt] = useState(0);
  const loadError = useLeakKeep((state) => state.loadError);

  useEffect(() => {
    let live = true;
    void ensureStore().finally(() => {
      if (live) setReady(true);
    });
    return () => {
      live = false;
    };
  }, [attempt]);

  if (!ready) return fallback;
  if (loadError) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-4 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">We couldn't load your data</h1>
        <p className="mt-2 text-sm text-muted">{loadError}</p>
        <button
          type="button"
          onClick={() => {
            setReady(false);
            setAttempt((value) => value + 1);
          }}
          className="press mt-6 inline-flex h-11 items-center justify-center self-start rounded-lg bg-primary px-4 text-sm font-medium text-paper"
        >
          Try again
        </button>
      </main>
    );
  }
  return children;
}
