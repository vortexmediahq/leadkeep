import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { startSessionListener, useSession } from "@/lib/session";
import { useLeakKeep } from "@/lib/store";

export function ClientGate({ children, fallback }: { children: ReactNode; fallback: ReactNode }) {
  const navigate = useNavigate();
  const status = useSession((state) => state.status);
  const userId = useSession((state) => state.user?.id ?? null);
  const loadedFor = useLeakKeep((state) => state.loadedFor);
  const loadError = useLeakKeep((state) => state.loadError);
  const [attempt, setAttempt] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    startSessionListener();
  }, []);

  useEffect(() => {
    if (status === "signed-out") {
      useLeakKeep.getState().reset();
      void navigate({ to: "/login" });
    }
  }, [status, navigate]);

  useEffect(() => {
    if (!userId || loadedFor === userId) return;
    let live = true;
    setLoading(true);
    useLeakKeep.getState().reset();
    void useLeakKeep
      .getState()
      .load(userId)
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [userId, loadedFor, attempt]);

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") void useLeakKeep.getState().refreshLeads();
    };
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  if (loadError && !loading) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-4 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">We couldn't load your data</h1>
        <p className="mt-2 text-sm text-muted">{loadError}</p>
        <button
          type="button"
          onClick={() => setAttempt((value) => value + 1)}
          className="press mt-6 inline-flex h-11 items-center justify-center self-start rounded-lg bg-primary px-4 text-sm font-medium text-paper"
        >
          Try again
        </button>
      </main>
    );
  }
  if (!userId || loadedFor !== userId) return fallback;
  return children;
}
