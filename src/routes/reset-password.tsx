import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { AuthCard } from "@/components/auth-card";
import { Button } from "@/components/ui/button";
import { Field, PasswordInput, TextInput } from "@/components/ui/fields";
import { updatePassword } from "@/lib/session";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Set a new password · LeadKeep" }] }),
  component: ResetPassword,
});

type Phase = "checking" | "ready" | "expired";

function ResetPassword() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirm?: string; form?: string }>({});
  const [pending, setPending] = useState(false);

  // The email link signs the person in for recovery; Supabase reads the token from the URL.
  useEffect(() => {
    let live = true;
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (!live) return;
      if (event === "PASSWORD_RECOVERY" || session) setPhase("ready");
    });
    const timer = window.setTimeout(() => {
      void supabase.auth.getSession().then(({ data: current }) => {
        if (live) setPhase(current.session ? "ready" : "expired");
      });
    }, 1200);
    return () => {
      live = false;
      window.clearTimeout(timer);
      data.subscription.unsubscribe();
    };
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const next: typeof errors = {};
    if (password.length < 6) next.password = "Use at least 6 characters.";
    if (confirm !== password) next.confirm = "The passwords don't match.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setPending(true);
    try {
      await updatePassword(password);
      await navigate({ to: "/" });
    } catch (problem) {
      setErrors({ form: problem instanceof Error ? problem.message : "Something went wrong. Try again." });
    } finally {
      setPending(false);
    }
  };

  if (phase === "checking") {
    return <AuthCard title="One moment…" lead="Checking your reset link." />;
  }
  if (phase === "expired") {
    return (
      <AuthCard
        title="This link has expired"
        lead="Reset links work once and only for a short time. Ask for a new one."
        footer={
          <Link to="/login" className="font-medium text-accent hover:underline">
            Back to log in
          </Link>
        }
      >
        <Button asChild className="w-full">
          <Link to="/forgot-password">Send a new link</Link>
        </Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Set a new password" lead="Choose a new password for your LeadKeep account.">
      <form onSubmit={(event) => void submit(event)} noValidate className="flex flex-col gap-4">
        <Field id="new-password" label="New password" error={errors.password} hint="At least 6 characters.">
          <PasswordInput
            id="new-password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </Field>
        <Field id="confirm-password" label="Type it again" error={errors.confirm}>
          <PasswordInput
            id="confirm-password"
            autoComplete="new-password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
          />
        </Field>
        {errors.form ? (
          <p className="text-sm text-lost" role="alert">
            {errors.form}
          </p>
        ) : null}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Saving…" : "Save new password"}
        </Button>
      </form>
    </AuthCard>
  );
}
