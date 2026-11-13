import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Field, PasswordInput, TextInput } from "@/components/ui/fields";
import { signIn, signUp, startSessionListener, useSession } from "@/lib/session";

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

  return (
    <AuthShell>
      <form
        onSubmit={(event) => void submit(event)}
        className="rounded-3xl border border-white/10 bg-paper p-4 shadow-panel sm:p-6"
        noValidate
      >
        <h1 className="text-2xl font-semibold tracking-tight">{copy.title}</h1>
        <p className="mt-1 text-sm text-muted">{copy.lead}</p>
        <div className="mt-5 flex flex-col gap-4">
          <Field id="auth-email" label="Email" error={errors.email}>
            <TextInput
              id="auth-email"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </Field>
          <Field
            id="auth-password"
            label="Password"
            error={errors.password}
            hint={mode === "signup" ? "At least 6 characters." : undefined}
          >
            <PasswordInput
              id="auth-password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </Field>
          {mode === "login" ? (
            <Link to="/forgot-password" className="-mt-2 self-end text-sm font-medium text-primary hover:text-accent">
              Forgot password?
            </Link>
          ) : null}
          {errors.form ? (
            <p className="text-sm text-lost" role="alert">
              {errors.form}
            </p>
          ) : null}
          <Button type="submit" variant="accent" className="w-full" disabled={pending}>
            {pending ? copy.pending : copy.submit}
          </Button>
        </div>
      </form>
      <p className="mt-4 text-center text-sm text-white/70">
        {copy.switchText}{" "}
        <Link to={copy.switchTo} className="font-medium text-accent hover:underline">
          {copy.switchLabel}
        </Link>
      </p>
    </AuthShell>
  );
}
