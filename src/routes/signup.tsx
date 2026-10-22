import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/auth-form";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create account · LeakKeep" }] }),
  component: () => <AuthForm mode="signup" />,
});
