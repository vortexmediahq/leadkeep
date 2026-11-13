import { Mail, MessageCircle, Phone } from "lucide-react";
import { callHref, emailHref, greeting, whatsappHref } from "@/lib/alerts";
import { buttonClass } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  name: string;
  phone: string;
  email: string;
  business: string;
  onContact?: () => void;
};

/** One-tap buttons to reach a lead. Tapping one offers to mark the lead as contacted. */
export function ContactButtons({ name, phone, email, business, onContact }: Props) {
  const hello = greeting(name, business);
  const links = [
    { label: "Call", icon: Phone, href: callHref(phone) },
    { label: "WhatsApp", icon: MessageCircle, href: whatsappHref(phone, hello) },
    { label: "Email", icon: Mail, href: emailHref(email, business ? `Your enquiry with ${business}` : "Your enquiry", hello) },
  ].filter((item): item is typeof item & { href: string } => Boolean(item.href));

  if (!links.length) return <p className="text-sm text-muted">No phone number or email was left for this lead.</p>;

  return (
    <div className="grid grid-cols-3 gap-2">
      {links.map(({ label, icon: Icon, href }) => (
        <a
          key={label}
          href={href}
          target={href.startsWith("https:") ? "_blank" : undefined}
          rel="noreferrer"
          onClick={onContact}
          className={cn(buttonClass({ variant: label === "Call" ? "accent" : "secondary" }), "h-14 flex-col gap-1 text-xs")}
        >
          <Icon className="size-5" aria-hidden="true" />
          {label}
        </a>
      ))}
    </div>
  );
}
