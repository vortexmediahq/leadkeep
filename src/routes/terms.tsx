import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms · LeadKeep" }] }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalPage title="Terms of use">
      <p>Last updated: 12 November 2026. This draft is written for use in South Africa. It is not legal advice and needs to be reviewed before you rely on it.</p>
      <p>
        These terms are between [Your legal name], trading as LeadKeep, and the person or business who creates a LeadKeep account ("you").
        By creating an account or using LeadKeep, you agree to these terms.
      </p>
      <h2 className="text-base font-semibold text-ink">The service</h2>
      <p>
        LeadKeep lets you build questionnaires, share a link, collect enquiries, and write quotes. We work hard to keep it available, but we do not
        promise it will always be error-free or uninterrupted. Features may change as we improve the product.
      </p>
      <h2 className="text-base font-semibold text-ink">Your account</h2>
      <p>
        You must be 18 or older and able to enter into a contract. Keep your login details private. You are responsible for activity on your account.
        Please tell us if you think someone else has used it. We may suspend or close an account that is misused or creates a security risk.
      </p>
      <h2 className="text-base font-semibold text-ink">Your content and your customers</h2>
      <p>
        You own the business details, questionnaires, logos and lead information you put into LeadKeep. You give us permission to host and display that
        information only so we can provide the service. You must have a lawful reason to collect and use information from people who fill in your forms,
        and you must not use LeadKeep to send spam or to collect information you should not have.
      </p>
      <h2 className="text-base font-semibold text-ink">Plans and payment</h2>
      <p>
        Some features need a paid plan. Prices and limits are shown on the pricing page and may change for future periods. If payment stops, we may
        move your account to the free plan or pause paid features. Fees already paid are not usually refunded, except where South African law requires it.
      </p>
      <h2 className="text-base font-semibold text-ink">Acceptable use</h2>
      <p>
        Do not try to break into the service, harm other users, copy the product, or use it for anything unlawful. We may remove content or close an
        account that breaks these rules.
      </p>
      <h2 className="text-base font-semibold text-ink">Our responsibility</h2>
      <p>
        LeadKeep is provided as a tool to help you follow up leads. We are not responsible for work you win or lose, or for quotes you send. To the
        extent the law allows, we are not liable for indirect loss (such as lost profits or lost work). Nothing in these terms limits rights you have
        that cannot be limited under South African law, including the Consumer Protection Act where it applies.
      </p>
      <h2 className="text-base font-semibold text-ink">Closing your account</h2>
      <p>
        You may download your data and delete your account in Settings at any time. We may close an account that has been unused for a long time,
        after trying to reach you where we can.
      </p>
      <h2 className="text-base font-semibold text-ink">Law</h2>
      <p>
        These terms are governed by the law of the Republic of South Africa. If a court says one part cannot be enforced, the rest still applies.
        We may update these terms and will change the date at the top when we do. If a change is material, we will try to let you know in the app or by email.
      </p>
    </LegalPage>
  );
}
