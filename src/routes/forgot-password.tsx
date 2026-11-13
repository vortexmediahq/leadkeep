import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { AuthCard } from "@/components/auth-card";
import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/fields";
import { requestPasswordReset } from "@/lib/session";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset your password · LeadKeep" }] }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    setPending(true);
    setError("");
    try {
      await requestPasswordReset(email.trim());
      setSent(true);
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "Something went wrong. Try again.");
    } finally {
      setPending(false);
    }
  };

  const back = (
    <Link to="/login" className="font-medium text-accent hover:underline">
      Back to log in
    </Link>
  );

  if (sent) {
    return (
      <AuthCard title="Check your email" lead={`If ${email.trim()} has a LeadKeep account, a reset link is on its way. It can take a minute; check spam too.`} footer={back}>
        <Button variant="secondary" className="w-full" onClick={() => setSent(false)}>
          Use a different email
        </Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Forgot your password?" lead="Enter your account email and we'll send you a link to set a new one." footer={back}>
      <form onSubmit={(event) => void submit(event)} noValidate className="flex flex-col gap-4">
        <Field id="reset-email" label="Email" error={error}>
          <TextInput
            id="reset-email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </Field>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Sending…" : "Send reset link"}
        </Button>
      </form>
    </AuthCard>
  );
}
