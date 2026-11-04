import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/auth-form";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Log in · LeadKeep" }] }),
  component: () => <AuthForm mode="login" />,
});
