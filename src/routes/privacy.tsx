import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy Policy · LeadKeep" }] }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <p>Last updated: 12 November 2026. This draft is written for use in South Africa and refers to the Protection of Personal Information Act, 4 of 2013 (POPIA).</p>
      <h2 className="text-base font-semibold text-ink">Who this is for</h2>
      <p>
        LeadKeep is a lead inbox for small businesses. This policy describes how we handle personal information when you create a LeadKeep account,
        and how information from people who fill in your enquiry form is treated. Please replace the placeholders below with your legal business name,
        physical address and information officer details before you publish this.
      </p>
      <p>
        <strong>Operator:</strong> [Your legal name], trading as LeadKeep, based in South Africa. Information officer: [Name and email].
      </p>
      <h2 className="text-base font-semibold text-ink">Who is responsible for what</h2>
      <p>
        If you have a LeadKeep account, you are the responsible party for the personal information of the people who enquire through your links
        (names, phone numbers, emails and answers). LeadKeep processes that information on your instructions so you can follow up. We do not use your
        customers' details to market to them.
      </p>
      <h2 className="text-base font-semibold text-ink">What we collect</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>Account details: your email, password (stored by our sign-in provider, not in readable form), and any authenticator or device unlock you turn on.</li>
        <li>Business details you choose to save: name, trade, city, phone, email, logo, colours, services, quote style and questionnaires.</li>
        <li>Lead information that people type into your enquiry form, including contact details and their answers.</li>
        <li>Sign-in activity, such as the kind of device, browser and time zone, so we can warn you about unusual sign-ins.</li>
        <li>Feedback you send us, and basic technical logs needed to keep the service running.</li>
        <li>Plan and payment status if you subscribe. Card payments are handled by the payment provider, not stored in full by LeadKeep.</li>
      </ul>
      <h2 className="text-base font-semibold text-ink">Why we use it</h2>
      <p>
        We use this information to run your account, show you your leads, keep the service secure, send you the alerts you have chosen
        (for example a new-lead email), improve LeadKeep, and meet our legal duties. We rely on the information being needed to provide the service
        you asked for, on your consent where you have a choice, and on legitimate interests such as security.
      </p>
      <h2 className="text-base font-semibold text-ink">Who we share it with</h2>
      <p>
        We do not sell personal information. We share it only with the service providers who help us run LeadKeep (for example hosting, sign-in, file storage
        and, if you turn on email alerts, email delivery). Some of those providers may store information outside South Africa. We only use providers we trust
        to keep information secure. We may also share information if the law requires it.
      </p>
      <h2 className="text-base font-semibold text-ink">How long we keep it</h2>
      <p>
        We keep your account and lead information while your account is open. If you delete your account, we remove your data from the live system.
        Backups may take a short time to catch up. We may keep limited records if we must, for example for a legal claim or tax rules.
      </p>
      <h2 className="text-base font-semibold text-ink">Your rights</h2>
      <p>
        Under POPIA you may ask us what information we have about you, ask for a copy, ask us to correct it, object to certain uses, or ask us to delete it
        where the law allows. You can download a copy of your LeadKeep data or delete your account in Settings. You may also lodge a complaint with the
        Information Regulator of South Africa at{" "}
        <a href="https://inforegulator.org.za" className="font-medium text-primary" target="_blank" rel="noreferrer">
          inforegulator.org.za
        </a>
        .
      </p>
      <h2 className="text-base font-semibold text-ink">Security</h2>
      <p>
        We use signed-in access, row-level security on the database, and optional authenticator codes and device unlock. No internet service is perfectly
        secure, so please use a strong password and turn on an authenticator if you can.
      </p>
      <h2 className="text-base font-semibold text-ink">Children</h2>
      <p>LeadKeep is aimed at businesses, not at children. Please do not create an account if you are under 18.</p>
      <h2 className="text-base font-semibold text-ink">Changes and contact</h2>
      <p>
        We may update this policy and will change the date at the top when we do. For privacy questions, use the contact details you add above, or the
        feedback form in the app.
      </p>
    </LegalPage>
  );
}
