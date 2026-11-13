import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { installMode, IOS_STEPS, MANUAL_STEPS, type InstallMode } from "@/lib/pwa";
import { cn } from "@/lib/utils";

type PromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

/** "Install app" button: the real prompt on Android, plain steps on iPhone. Hidden once installed or on a computer. */
export function InstallApp({ tone = "light", className }: { tone?: "light" | "dark"; className?: string }) {
  const [prompt, setPrompt] = useState<PromptEvent | null>(null);
  const [mode, setMode] = useState<InstallMode>("hidden");
  const [steps, setSteps] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    const compute = (event: PromptEvent | null) =>
      setMode(installMode({ userAgent: navigator.userAgent, maxTouchPoints: navigator.maxTouchPoints, standalone, hasPrompt: !!event }));
    compute(null);
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPrompt(event as PromptEvent);
      compute(event as PromptEvent);
    };
    const onInstalled = () => {
      setPrompt(null);
      setMode("hidden");
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (mode === "hidden") return null;
  const dark = tone === "dark";
  return (
    <div className={cn("text-center", className)}>
      <button
        type="button"
        onClick={() => {
          if (mode === "prompt" && prompt) {
            void prompt.prompt().then(() => setPrompt(null));
          } else {
            setSteps((value) => !value);
          }
        }}
        className={cn(
          "press inline-flex min-h-11 items-center gap-2 rounded-lg border px-4 text-sm font-medium",
          dark ? "border-white/30 text-white hover:border-accent hover:text-accent" : "border-line text-ink hover:bg-mist",
        )}
      >
        <Download className="size-4" aria-hidden="true" />
        Install app on your phone
      </button>
      {steps && mode !== "prompt" ? (
        <p role="status" className={cn("mx-auto mt-2 max-w-xs text-sm", dark ? "text-white/80" : "text-ink-soft")}>
          {mode === "ios" ? IOS_STEPS : MANUAL_STEPS}
        </p>
      ) : null}
    </div>
  );
}
