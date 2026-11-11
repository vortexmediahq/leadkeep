import type { Business } from "@/lib/types";

/** Set when the owner opens Settings, so the setup chart can tick off notifications. */
export const NOTIFY_SETUP_KEY = "leadkeep.setup.notifications";

export type SetupStep = {
  id: string;
  label: string;
  done: boolean;
  /** Route the step should open. */
  to: "/links" | "/questions" | "/settings" | "/services";
  hash?: string;
  note?: string;
  /** When false, the step is listed but does not count toward the percentage. */
  counted: boolean;
};

export function isBusinessReady(business: Business): boolean {
  return business.name.trim().length > 0 && (business.phone.trim().length > 0 || business.email.trim().length > 0);
}

export function setupProgress(input: {
  business: Business;
  linksCount: number;
  questionnairesReady: boolean;
  questionnairesCount: number;
  namedServices: number;
  notificationsChosen: boolean;
}): { steps: SetupStep[]; done: number; total: number; percent: number } {
  const steps: SetupStep[] = [
    {
      id: "business",
      label: "Add your business details",
      done: isBusinessReady(input.business),
      to: "/links",
      hash: "business",
      counted: true,
    },
    {
      id: "link",
      label: "Create your first lead link",
      done: input.linksCount > 0,
      to: "/links",
      hash: "new-link",
      counted: true,
    },
    {
      id: "questions",
      label: "Create a questionnaire",
      done: input.questionnairesCount > 0,
      to: "/questions",
      hash: "templates",
      counted: true,
      note:
        !input.questionnairesReady && input.questionnairesCount === 0
          ? "A database update is needed before you can save your own."
          : undefined,
    },
    {
      id: "services",
      label: "Add a service you sell",
      done: input.namedServices > 0,
      to: "/services",
      counted: true,
    },
    {
      id: "notifications",
      label: "Choose how you're notified",
      done: input.notificationsChosen,
      to: "/settings",
      hash: "alerts",
      counted: true,
    },
    {
      id: "branding",
      label: "Add your logo and colours",
      done: false,
      to: "/settings",
      counted: false,
      note: "Coming in the next update.",
    },
  ];
  const countable = steps.filter((step) => step.counted);
  const done = countable.filter((step) => step.done).length;
  const total = countable.length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return { steps, done, total, percent };
}
