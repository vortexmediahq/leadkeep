import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Mark } from "@/components/mark";
import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/fields";
import { signIn, signUp, startSessionListener, useSession } from "@/lib/session";

const COPY = {
  login: {
    title: "Log in",
    lead: "Open your lead desk.",
    submit: "Log in",
    pending: "Logging in…",
    switchText: "New to LeakKeep?",
    switchLabel: "Create an account",
    switchTo: "/signup",
  },
  signup: {
    title: "Create your account",
    lead: "Your leads, services, and quote style stay private to you.",
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
    <main className="flex min-h-screen items-center justify-center bg-mist px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-3">
          <Mark />
          <div>
            <p className="text-base font-semibold tracking-tight">LeakKeep</p>
            <p className="text-sm text-muted">Lead desk</p>
          </div>
        </div>
        <form
          onSubmit={(event) => void submit(event)}
          className="rounded-3xl border border-line bg-paper p-4 shadow-panel sm:p-6"
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
              <TextInput
                id="auth-password"
                type="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </Field>
            {errors.form ? (
              <p className="text-sm text-lost" role="alert">
                {errors.form}
              </p>
            ) : null}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? copy.pending : copy.submit}
            </Button>
          </div>
        </form>
        <p className="mt-4 text-center text-sm text-muted">
          {copy.switchText}{" "}
          <Link to={copy.switchTo} className="font-medium text-primary">
            {copy.switchLabel}
          </Link>
        </p>
      </div>
    </main>
  );
}
