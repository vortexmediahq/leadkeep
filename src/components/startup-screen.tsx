import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from "react";

/** Timing for the Vowly-style handoff: plant, logo, then a gentle move into log in. */
export const INTRO = {
  logoDelayMs: 350,
  logoFadeMs: 900,
  handoverAtMs: 2500,
  handoverMs: 2000,
  doneAtMs: 4600,
  reducedMs: 900,
  /** Start a little zoomed out so more of the navy shows around the plant. */
  filmStartScale: 0.9,
  /** Ease forward during the handoff. Uniform scale only. */
  filmEndScale: 1.08,
  /** Logo begins a touch larger, centered over the plant. */
  logoStartScale: 1.28,
} as const;

export function usePortraitFilm() {
  const [portrait, setPortrait] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(orientation: portrait) and (max-width: 767px)");
    const sync = () => setPortrait(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return portrait;
}

type Fly = { x: number; y: number; scale: number };

const REST: Fly = { x: 0, y: 0, scale: 1 };

function measureCenteredFly(node: HTMLElement, scale: number): Fly {
  const rect = node.getBoundingClientRect();
  return {
    x: window.innerWidth / 2 - (rect.left + rect.width / 2),
    y: window.innerHeight / 2 - (rect.top + rect.height / 2),
    scale,
  };
}

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

/**
 * Drives the plant-to-login motion. The logo lives in its final DOM slot the
 * whole time; a transform only parks it over the plant until the handoff.
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
  const [fly, setFly] = useState<Fly>(REST);
  const [moving, setMoving] = useState(false);
  const [logoOpacity, setLogoOpacity] = useState(1);
  const [stageOpacity, setStageOpacity] = useState(1);
  const [filmOpacity, setFilmOpacity] = useState(0);
  const [filmScale, setFilmScale] = useState<number>(INTRO.filmStartScale);
  const [skipVisible, setSkipVisible] = useState(false);
  const movingRef = useRef(false);

  useLayoutEffect(() => {
    if (!active) {
      setFly(REST);
      setMoving(false);
      movingRef.current = false;
      setLogoOpacity(1);
      setStageOpacity(1);
      setFilmOpacity(0);
      setSkipVisible(false);
      return;
    }

    setMoving(false);
    movingRef.current = false;
    setLogoOpacity(0);
    setStageOpacity(0);
    setSkipVisible(true);

    if (reduced) {
      setFly(REST);
      setFilmOpacity(0);
      setFilmScale(1);
      return;
    }

    const node = logoRef.current;
    if (node) setFly(measureCenteredFly(node, INTRO.logoStartScale));
    setFilmScale(INTRO.filmStartScale);
    setFilmOpacity(1);
  }, [active, reduced, logoRef]);

  useEffect(() => {
    if (!active || reduced || movingRef.current) return;
    const sync = () => {
      if (movingRef.current) return;
      const node = logoRef.current;
      if (node) setFly(measureCenteredFly(node, INTRO.logoStartScale));
    };
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, [active, reduced, logoRef]);

  useEffect(() => {
    if (!active) return;

    if (reduced) {
      const frame = window.requestAnimationFrame(() => {
        setLogoOpacity(1);
        setStageOpacity(1);
      });
      const done = window.setTimeout(onDone, INTRO.reducedMs);
      return () => {
        window.cancelAnimationFrame(frame);
        window.clearTimeout(done);
      };
    }

    const fadeLogo = window.setTimeout(() => setLogoOpacity(1), INTRO.logoDelayMs);
    const hand = window.setTimeout(() => {
      movingRef.current = true;
      setMoving(true);
      setFly(REST);
      setFilmScale(INTRO.filmEndScale);
      setFilmOpacity(0);
      setStageOpacity(1);
      setSkipVisible(false);
    }, INTRO.handoverAtMs);
    const done = window.setTimeout(onDone, INTRO.doneAtMs);
    return () => {
      window.clearTimeout(fadeLogo);
      window.clearTimeout(hand);
      window.clearTimeout(done);
    };
  }, [active, reduced, onDone]);

  const skip = () => {
    movingRef.current = true;
    setMoving(false);
    setFly(REST);
    setLogoOpacity(1);
    setStageOpacity(1);
    setFilmOpacity(0);
    setSkipVisible(false);
    onDone();
  };

  const fadeMs = reduced ? INTRO.reducedMs : moving ? INTRO.handoverMs : INTRO.logoFadeMs;

  const logoStyle: CSSProperties = {
    opacity: logoOpacity,
    transform: `translate(${fly.x}px, ${fly.y}px) scale(${fly.scale})`,
    transformOrigin: "center center",
    transition: moving ? `transform ${INTRO.handoverMs}ms ${EASE}` : `opacity ${fadeMs}ms ease`,
    willChange: active ? "transform, opacity" : undefined,
  };

  const stageStyle: CSSProperties = {
    opacity: stageOpacity,
    transition: active ? `opacity ${reduced ? INTRO.reducedMs : INTRO.handoverMs}ms ease` : undefined,
  };

  return { logoStyle, stageStyle, filmOpacity, filmScale, moving, skip, skipVisible };
}

/** The plant film. Uniform scale only; object-fit contain, never stretched. */
export function IntroFilm({
  portrait,
  scale,
  opacity,
  moving,
}: {
  portrait: boolean;
  scale: number;
  opacity: number;
  moving: boolean;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const src = portrait ? "/hero-plant-portrait.mp4" : "/hero-plant.mp4";

  useEffect(() => {
    const node = video.current;
    if (!node) return;
    node.muted = true;
    const play = node.play();
    if (play) void play.catch(() => {});
  }, [src]);

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{
        opacity,
        transition: moving ? `opacity ${INTRO.handoverMs}ms ease` : undefined,
      }}
      aria-hidden="true"
    >
      <video
        key={src}
        ref={video}
        className="absolute inset-0 h-full w-full origin-center object-contain"
        style={{
          transform: `scale(${scale})`,
          transition: moving ? `transform ${INTRO.handoverMs}ms ${EASE}` : undefined,
        }}
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
