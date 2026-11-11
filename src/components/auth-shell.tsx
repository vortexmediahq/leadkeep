import { useEffect, useState, type ReactNode } from "react";
import { LogoOnDark } from "@/components/mark";
import { StartupScreen } from "@/components/startup-screen";

const SEEN_KEY = "leadkeep.startup.seen";

function useIntro() {
  const [ready, setReady] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      setShow(sessionStorage.getItem(SEEN_KEY) !== "1");
    } catch {
      setShow(true);
    }
    setReady(true);
  }, []);

  const dismiss = () => {
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* ignore */
    }
    setShow(false);
  };

  return { ready, show, dismiss };
}

/** Shared navy frame for log in, sign up and password pages, with the plant intro once a session. */
export function AuthShell({ children }: { children: ReactNode }) {
  const intro = useIntro();

  if (!intro.ready) return <div className="min-h-screen bg-primary" />;
  if (intro.show) return <StartupScreen onDone={intro.dismiss} />;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-primary px-4 py-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-accent" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-16 top-24 size-72 rounded-full bg-accent/25 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-12 bottom-8 size-56 rounded-full bg-accent/15 blur-3xl" aria-hidden="true" />
      <div className="relative w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <LogoOnDark className="w-44" />
        </div>
        {children}
      </div>
    </main>
  );
}
