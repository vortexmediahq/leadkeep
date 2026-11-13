import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { AUTH_PANEL } from "@/components/auth-card";
import { AuthShell } from "@/components/auth-shell";
import { MfaChallenge } from "@/components/mfa-challenge";
import { Button } from "@/components/ui/button";
import { Field, PasswordInput, TextInput } from "@/components/ui/fields";
import { passkeysSupported, signIn, signInWithPasskey, signUp, startSessionListener, useSession } from "@/lib/session";

const COPY = {
  login: {
    title: "Log in",
    lead: "Open your lead inbox.",
    submit: "Log in",
    pending: "Logging in…",
    switchText: "New to LeadKeep?",
    switchLabel: "Create an account",
    switchTo: "/signup",
  },
  signup: {
    title: "Create your account",
    lead: "Build your questionnaire, share the link, and every answer lands here. Private to you.",
    submit: "Create account",
    pending: "Creating account…",
    switchText: "Already have an account?",
    switchLabel: "Log in",
    switchTo: "/login",
  },
} as const;

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const copy = COPY[mode];
  const navigate = useNavigate();
  const status = useSession((state) => state.status);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [pending, setPending] = useState(false);
  const [passkeyPending, setPasskeyPending] = useState(false);

  useEffect(() => {
    startSessionListener();
  }, []);

  useEffect(() => {
    if (status === "signed-in") void navigate({ to: "/" });
  }, [status, navigate]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const next: typeof errors = {};
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = "Enter a valid email address.";
    if (password.length < 6) next.password = "Use at least 6 characters.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setPending(true);
    try {
      if (mode === "login") await signIn(email.trim(), password);
      else await signUp(email.trim(), password);
      await navigate({ to: "/" });
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : "Something went wrong. Try again." });
    } finally {
      setPending(false);
    }
  };

  const onPasskey = async () => {
    setPasskeyPending(true);
    setErrors({});
    try {
      await signInWithPasskey();
      await navigate({ to: "/" });
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : "Something went wrong. Try again." });
    } finally {
      setPasskeyPending(false);
    }
  };

  if (status === "needs-mfa") return <MfaChallenge />;

  return (
    <AuthShell>
      <form
        onSubmit={(event) => void submit(event)}
        className={AUTH_PANEL}
        noValidate
      >
        <h1 className="text-2xl font-semibold tracking-tight text-white">{copy.title}</h1>
        <p className="mt-1 text-sm text-[#c5d0de]">{copy.lead}</p>
        <div className="mt-5 flex flex-col gap-4">
          <Field id="auth-email" label="Email" error={errors.email} tone="onDark">
            <TextInput
              id="auth-email"
              type="email"
              autoComplete={mode === "login" ? "username webauthn" : "email"}
              inputMode="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              tone="onDark"
            />
          </Field>
          <Field
            id="auth-password"
            label="Password"
            error={errors.password}
            hint={mode === "signup" ? "At least 6 characters." : undefined}
            tone="onDark"
          >
            <PasswordInput
              id="auth-password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              tone="onDark"
            />
          </Field>
          {mode === "login" ? (
            <Link to="/forgot-password" className="-mt-2 block w-full text-center text-sm font-medium text-[#c5d0de] hover:text-accent">
              Forgot password?
            </Link>
          ) : null}
          {errors.form ? (
            <p className="text-sm text-red-300" role="alert">
              {errors.form}
            </p>
          ) : null}
          <Button type="submit" variant="accent" className="w-full" disabled={pending}>
            {pending ? copy.pending : copy.submit}
          </Button>
          {mode === "login" && passkeysSupported() ? (
            <Button type="button" variant="secondary" className="w-full border-white/20 bg-transparent text-white hover:bg-white/10" disabled={passkeyPending} onClick={() => void onPasskey()}>
              {passkeyPending ? "Waiting for your device…" : "Log in with fingerprint or face"}
            </Button>
          ) : null}
        </div>
      </form>
      <p className="mt-4 w-full text-center text-sm text-white/70">
        {copy.switchText}{" "}
        <Link to={copy.switchTo} className="font-medium text-accent hover:underline">
          {copy.switchLabel}
        </Link>
      </p>
      <p className="mt-3 w-full text-center text-xs text-white/50">
        <Link to="/privacy" className="hover:text-white/80">
          Privacy Policy
        </Link>
        {" · "}
        <Link to="/terms" className="hover:text-white/80">
          Terms
        </Link>
      </p>
    </AuthShell>
  );
}
