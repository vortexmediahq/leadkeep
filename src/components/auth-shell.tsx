import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { LogoOnDark } from "@/components/mark";
import { INTRO, IntroFilm, useIntroMotion, usePortraitFilm } from "@/components/startup-screen";

const SEEN_KEY = "leadkeep.startup.seen";

function useIntro() {
  const [ready, setReady] = useState(false);
  const [show, setShow] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    try {
      setShow(sessionStorage.getItem(SEEN_KEY) !== "1");
    } catch {
      setShow(true);
    }
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    setReady(true);
  }, []);

  const dismiss = useCallback(() => {
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* ignore */
    }
    setShow(false);
  }, []);

  return { ready, show, reduced, dismiss };
}

/** Shared navy frame for log in, sign up and password pages, with the plant intro once a session. */
export function AuthShell({ children }: { children: ReactNode }) {
  const intro = useIntro();
  const logoRef = useRef<HTMLDivElement>(null);
  const portrait = usePortraitFilm();
  const motion = useIntroMotion({
    active: intro.ready && intro.show,
    reduced: intro.reduced,
    logoRef,
    onDone: intro.dismiss,
  });

  if (!intro.ready) return <div className="min-h-screen bg-primary" />;

  const fadeMs = intro.reduced ? INTRO.reducedMs : INTRO.handoverMs;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-primary px-4 py-10">
      {intro.show && !intro.reduced ? (
        <IntroFilm portrait={portrait} scale={motion.filmScale} opacity={motion.filmOpacity} moving={motion.moving} />
      ) : null}

      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-accent"
        style={{ opacity: motion.stageStyle.opacity, transition: intro.show ? `opacity ${fadeMs}ms ease` : undefined }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-16 top-24 size-72 rounded-full bg-accent/25 blur-3xl"
        style={{ opacity: motion.stageStyle.opacity, transition: intro.show ? `opacity ${fadeMs}ms ease` : undefined }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-12 bottom-8 size-56 rounded-full bg-accent/15 blur-3xl"
        style={{ opacity: motion.stageStyle.opacity, transition: intro.show ? `opacity ${fadeMs}ms ease` : undefined }}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <div ref={logoRef} style={motion.logoStyle}>
            <LogoOnDark className="w-44" />
          </div>
        </div>
        <div style={motion.stageStyle} inert={intro.show ? true : undefined}>
          {children}
        </div>
      </div>

      {intro.show && motion.skipVisible ? (
        <button
          type="button"
          onClick={motion.skip}
          className="press absolute right-4 top-4 z-10 rounded-full border border-white/25 bg-primary/50 px-4 py-2 text-sm font-medium text-paper backdrop-blur-sm hover:border-accent hover:text-accent"
        >
          Skip
        </button>
      ) : null}
    </main>
  );
}
