import { useEffect, useRef, useState } from "react";
import { LogoOnDark } from "@/components/mark";

type Props = { onDone: () => void };

/**
 * Plays the LeadKeep plant once per browser session, then hands off to log in.
 * Portrait phones get a cropped 406×720 version (crop only, never stretched).
 * Wider screens get the original 1280×720 film.
 */
export function StartupScreen({ onDone }: Props) {
  const video = useRef<HTMLVideoElement>(null);
  const [portrait, setPortrait] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(orientation: portrait) and (max-width: 767px)");
    const sync = () => setPortrait(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const node = video.current;
    if (!node) return;
    node.muted = true;
    const play = node.play();
    if (play) void play.catch(() => onDone());
  }, [portrait, onDone]);

  const src = portrait ? "/hero-plant-portrait.mp4" : "/hero-plant.mp4";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-primary">
      <video
        key={src}
        ref={video}
        className="absolute inset-0 h-full w-full object-contain"
        autoPlay
        muted
        playsInline
        preload="auto"
        poster="/hero-poster.jpg"
        onEnded={onDone}
        aria-hidden="true"
      >
        <source src={src} type="video/mp4" />
      </video>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-primary to-transparent" />
      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 py-4">
        <LogoOnDark className="w-28" />
        <button
          type="button"
          onClick={onDone}
          className="press rounded-full border border-white/25 bg-primary/50 px-4 py-2 text-sm font-medium text-paper backdrop-blur-sm hover:border-accent hover:text-accent"
        >
          Skip
        </button>
      </div>
    </main>
  );
}
