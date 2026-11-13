import { useState, type FormEvent } from "react";
import { AUTH_PANEL } from "@/components/auth-card";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/fields";
import { signOut, verifyMfaCode } from "@/lib/session";

export function MfaChallenge({ embedded }: { embedded?: boolean }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const value = code.replace(/\s/g, "");
    if (!/^\d{6}$/.test(value)) {
      setError("Enter the 6-digit code from your authenticator app.");
      return;
    }
    setPending(true);
    setError("");
    try {
      await verifyMfaCode(value);
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "That code didn't work. Try again.");
    } finally {
      setPending(false);
    }
  };

  const form = (
    <form onSubmit={(event) => void submit(event)} className={embedded ? "flex flex-col gap-4" : AUTH_PANEL} noValidate>
      <h1 className={embedded ? "text-2xl font-semibold tracking-tight" : "text-2xl font-semibold tracking-tight text-white"}>
        Enter your code
      </h1>
      <p className={embedded ? "mt-1 text-sm text-muted" : "mt-1 text-sm text-[#c5d0de]"}>
        Open your authenticator app and type the 6-digit code for LeadKeep.
      </p>
      <div className="mt-5 flex flex-col gap-4">
        <Field id="mfa-code" label="Authenticator code" error={error} tone={embedded ? undefined : "onDark"}>
          <TextInput
            id="mfa-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            tone={embedded ? undefined : "onDark"}
          />
        </Field>
        <Button type="submit" variant="accent" className="w-full" disabled={pending}>
          {pending ? "Checking…" : "Continue"}
        </Button>
        <button
          type="button"
          className={embedded ? "text-sm font-medium text-muted" : "text-sm font-medium text-white/70"}
          onClick={() => void signOut()}
        >
          Use a different account
        </button>
      </div>
    </form>
  );

  if (embedded) return form;
  return <AuthShell>{form}</AuthShell>;
}
