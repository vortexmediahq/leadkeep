import { useEffect, useState, type ReactNode } from "react";
import { useLeakKeep } from "@/lib/store";

let rehydrated = false;
let pending: Promise<void> | null = null;

function ensureStore() {
  if (pending) return pending;
  const next = Promise.resolve(useLeakKeep.persist.rehydrate()).then(
    () => {
      rehydrated = true;
    },
    () => {
      rehydrated = true;
    },
  );
  pending = next;
  return next;
}

export function ClientGate({ children, fallback }: { children: ReactNode; fallback: ReactNode }) {
  const [ready, setReady] = useState(rehydrated);

  useEffect(() => {
    let live = true;
    void ensureStore().finally(() => {
      if (live) setReady(true);
    });
    return () => {
      live = false;
    };
  }, []);

  if (!ready) return fallback;
  return children;
}
