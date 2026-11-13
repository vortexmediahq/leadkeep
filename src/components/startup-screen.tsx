import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from "react";

/** Timing for the plant-to-login handoff. Video plays full screen first, then the logo, then login. */
export const INTRO = {
  logoDelayMs: 2500,
  logoFadeMs: 700,
  handoverAtMs: 3300,
  handoverMs: 1500,
  doneAtMs: 4900,
  reducedMs: 900,
  /** Logo begins a touch larger, centered over the plant. */
  logoStartScale: 1.28,
} as const;

type Fly = { x: number; y: number; scale: number };
type Phase = "idle" | "start" | "logo" | "arm" | "handover" | "done";

const REST: Fly = { x: 0, y: 0, scale: 1 };
const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

function measureCenteredFly(node: HTMLElement, scale: number): Fly {
  const rect = node.getBoundingClientRect();
  return {
    x: window.innerWidth / 2 - (rect.left + rect.width / 2),
    y: window.innerHeight / 2 - (rect.top + rect.height / 2),
    scale,
  };
}

function portraitFilmSrc(): string {
  const portrait = window.matchMedia("(orientation: portrait) and (max-width: 767px)").matches;
  return portrait ? "/hero-plant-portrait.mp4" : "/hero-plant.mp4";
}

/**
 * Drives the plant-to-login motion. The logo lives in its final DOM slot the
 * whole time; a transform only parks it over the plant until the handoff.
 *
 * Phases are derived so the first painted intro frame is already the start
 * pose (no reverse fade). Handoff is armed in one frame, then moved in the
 * next, so CSS actually animates transform and opacity.
 */
export function useIntroMotion({
  active,
  reduced,
  logoRef,
  onDone,
}: {
  active: boolean;
  reduced: boolean;
  logoRef: RefObject<HTMLElement | null>;
  onDone: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [fly, setFly] = useState<Fly>(REST);
  const phaseRef = useRef<Phase>("idle");

  const visual: Phase = active && phase === "idle" ? "start" : active ? phase : "idle";

  useLayoutEffect(() => {
    if (!active) {
      phaseRef.current = "idle";
      setPhase("idle");
      setFly(REST);
      return;
    }

    if (reduced) {
      setFly(REST);
      phaseRef.current = "start";
      setPhase("start");
      return;
    }

    const node = logoRef.current;
    if (node) setFly(measureCenteredFly(node, INTRO.logoStartScale));
    phaseRef.current = "start";
    setPhase("start");
  }, [active, reduced, logoRef]);

  useEffect(() => {
    if (!active || reduced) return;
    if (visual !== "start" && visual !== "logo") return;
    const sync = () => {
      const current = phaseRef.current;
      if (current !== "start" && current !== "logo") return;
      const node = logoRef.current;
      if (node) setFly(measureCenteredFly(node, INTRO.logoStartScale));
    };
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, [active, reduced, visual, logoRef]);

  useEffect(() => {
    if (!active) return;

    if (reduced) {
      const frame = window.requestAnimationFrame(() => {
        phaseRef.current = "done";
        setPhase("done");
      });
      const done = window.setTimeout(onDone, INTRO.reducedMs);
      return () => {
        window.cancelAnimationFrame(frame);
        window.clearTimeout(done);
      };
    }

    const fadeLogo = window.setTimeout(() => {
      phaseRef.current = "logo";
      setPhase("logo");
    }, INTRO.logoDelayMs);
    const arm = window.setTimeout(() => {
      phaseRef.current = "arm";
      setPhase("arm");
    }, INTRO.handoverAtMs);
    const done = window.setTimeout(onDone, INTRO.doneAtMs);
    return () => {
      window.clearTimeout(fadeLogo);
      window.clearTimeout(arm);
      window.clearTimeout(done);
    };
  }, [active, reduced, onDone]);

  useEffect(() => {
    if (phase !== "arm") return;
    const id = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        phaseRef.current = "handover";
        setPhase("handover");
        setFly(REST);
      });
    });
    return () => window.cancelAnimationFrame(id);
  }, [phase]);

  const skip = () => {
    phaseRef.current = "idle";
    setPhase("idle");
    setFly(REST);
    onDone();
  };

  const moving = visual === "arm" || visual === "handover";
  const fadingLogo = visual === "start" || visual === "logo";
  const reducedFade = reduced && (visual === "start" || visual === "done");
  const showFilm = visual === "start" || visual === "logo" || visual === "arm" || visual === "handover";
  const logoOn = visual === "logo" || visual === "arm" || visual === "handover" || visual === "done" || visual === "idle";
  const stageOn = visual === "handover" || visual === "done" || visual === "idle";
  const filmOn = visual === "start" || visual === "logo" || visual === "arm";
  const skipVisible = visual === "start" || visual === "logo" || visual === "arm";

  const logoStyle: CSSProperties = {
    opacity: logoOn ? 1 : 0,
    transform: `translate3d(${fly.x}px, ${fly.y}px, 0) scale(${fly.scale})`,
    transformOrigin: "center center",
    transition: moving
      ? `transform ${INTRO.handoverMs}ms ${EASE}, opacity ${INTRO.logoFadeMs}ms ease`
      : fadingLogo || reducedFade
        ? `opacity ${reduced ? INTRO.reducedMs : INTRO.logoFadeMs}ms ease`
        : undefined,
    willChange: active ? "transform, opacity" : undefined,
  };

  const stageStyle: CSSProperties = {
    opacity: stageOn ? 1 : 0,
    transition: moving || reducedFade ? `opacity ${reduced ? INTRO.reducedMs : INTRO.handoverMs}ms ease` : undefined,
  };

  return {
    logoStyle,
    stageStyle,
    filmOpacity: filmOn ? 1 : 0,
    moving,
    skip,
    skipVisible,
    showFilm,
  };
}

/**
 * Full-bleed plant film. The source is locked on mount so the clip plays once
 * from the start: no loop, no seek, no remount, no mid-play swap.
 * object-fit: cover only — uniform scale and crop, never stretched.
 */
export function IntroFilm({ opacity, moving }: { opacity: number; moving: boolean }) {
  const video = useRef<HTMLVideoElement>(null);
  const srcRef = useRef<string | null>(null);
  if (srcRef.current === null) srcRef.current = portraitFilmSrc();
  const src = srcRef.current;

  useEffect(() => {
    const node = video.current;
    if (!node) return;
    node.muted = true;
    node.loop = false;
    node.playsInline = true;
    const play = node.play();
    if (play) void play.catch(() => {});
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{
        width: "100vw",
        height: "100dvh",
        opacity,
        transition: moving ? `opacity ${INTRO.handoverMs}ms ease` : undefined,
        transform: "translateZ(0)",
        willChange: moving ? "opacity" : undefined,
      }}
      aria-hidden="true"
    >
      <video
        ref={video}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ transform: "translateZ(0)" }}
        autoPlay
        muted
        playsInline
        preload="auto"
        poster="/hero-poster.jpg"
      >
        <source src={src} type="video/mp4" />
      </video>
    </div>
  );
}
