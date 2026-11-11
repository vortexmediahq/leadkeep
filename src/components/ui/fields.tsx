import { Eye, EyeOff } from "lucide-react";
import { useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const control =
  "w-full rounded-lg border border-line bg-paper px-3 text-base text-ink placeholder:text-faint";

const controlOnDark =
  "w-full rounded-lg border border-white/20 bg-primary/40 px-3 text-base text-white placeholder:text-white/40 caret-white";

type Tone = "default" | "onDark";

function controlClass(tone: Tone | undefined) {
  return tone === "onDark" ? controlOnDark : control;
}

export function Field({
  id,
  label,
  hint,
  error,
  tone = "default",
  children,
}: {
  id?: string;
  label: string;
  hint?: string;
  error?: string;
  tone?: Tone;
  children: ReactNode;
}) {
  const onDark = tone === "onDark";
  return (
    <div>
      <label htmlFor={id} className={cn("mb-2 block text-sm font-medium", onDark ? "text-[#c5d0de]" : "text-ink")}>
        {label}
      </label>
      {children}
      {error ? (
        <p className={cn("mt-2 text-sm", onDark ? "text-red-300" : "text-lost")}>{error}</p>
      ) : hint ? (
        <p className={cn("mt-2 text-sm", onDark ? "text-[#c5d0de]" : "text-muted")}>{hint}</p>
      ) : null}
    </div>
  );
}

export function TextInput({ className, tone, ...props }: InputHTMLAttributes<HTMLInputElement> & { tone?: Tone }) {
  return <input className={cn(controlClass(tone), "h-11", className)} {...props} />;
}

export function TextArea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(control, "min-h-28 py-3", className)} {...props} />;
}

export function SelectInput({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(control, "h-11", className)} {...props}>
      {children}
    </select>
  );
}

export function PasswordInput({ className, tone, ...props }: InputHTMLAttributes<HTMLInputElement> & { tone?: Tone }) {
  const [visible, setVisible] = useState(false);
  const onDark = tone === "onDark";
  return (
    <div className="password-input">
      <input
        {...props}
        type={visible ? "text" : "password"}
        className={cn(controlClass(tone), "h-11", className)}
      />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        className={cn("password-input__toggle", onDark ? "text-[#c5d0de] hover:text-white" : "text-muted hover:text-ink")}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
      >
        {visible ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
      </button>
    </div>
  );
}
