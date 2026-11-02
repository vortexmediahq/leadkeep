import { supabase } from "@/lib/supabase";
import type { Business, Lead, LeadInput, LeadLink, LeadStatus, QuoteTemplate, Service } from "@/lib/types";

type ServiceRow = { id: string; name: string; description: string; price: string; notes: string };

type TemplateRow = {
  id: string;
  tone: string;
  structure: string;
  payment_terms: string;
  warranty: string;
  extra: string;
};

type LeadAnswers = Pick<
  Lead,
  "jobType" | "description" | "urgency" | "preferredTime" | "propertyType" | "budget" | "accessNotes"
>;

type LeadRow = {
  id: string;
  link_id: string;
  source: string;
  customer_name: string;
  phone: string;
  email: string;
  address: string;
  answers: Partial<LeadAnswers> | null;
  status: LeadStatus;
  quote: string | null;
  quote_updated_at: string | null;
  created_at: string;
};

const LEAD_COLUMNS =
  "id, link_id, source, customer_name, phone, email, address, answers, status, quote, quote_updated_at, created_at";

export type StoredTemplate = QuoteTemplate & { id: string | null };

function fail(action: string, error: { message: string } | null): never {
  throw new Error(`Couldn't ${action}. ${error?.message ?? ""}`.trim());
}

function toLead(row: LeadRow): Lead {
  const answers = row.answers ?? {};
  return {
    id: row.id,
    linkId: row.link_id,
    source: row.source,
    name: row.customer_name,
    phone: row.phone,
    email: row.email,
    address: row.address,
    jobType: answers.jobType ?? "",
    description: answers.description ?? "",
    urgency: answers.urgency ?? "",
    preferredTime: answers.preferredTime ?? "",
    propertyType: answers.propertyType ?? "",
    budget: answers.budget ?? "",
    accessNotes: answers.accessNotes ?? "",
    status: row.status,
    createdAt: row.created_at,
    quote: row.quote,
    quoteUpdatedAt: row.quote_updated_at,
  };
}

function toTemplate(row: TemplateRow): StoredTemplate {
  return {
    id: row.id,
    tone: row.tone,
    structure: row.structure,
    paymentTerms: row.payment_terms,
    warranty: row.warranty,
    extra: row.extra,
  };
}

function templateColumns(template: QuoteTemplate) {
  return {
    tone: template.tone,
    structure: template.structure,
    payment_terms: template.paymentTerms,
    warranty: template.warranty,
    extra: template.extra,
  };
}

export async function fetchServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from("services")
    .select("id, name, description, price, notes")
    .order("created_at", { ascending: false });
  if (error || !data) fail("load services", error);
  return data as ServiceRow[];
}

export async function insertServices(items: Service[]) {
  const { error } = await supabase.from("services").insert(items);
  if (error) fail("save the service", error);
}

export async function updateServiceRow(id: string, patch: Partial<Omit<Service, "id">>) {
  const { error } = await supabase
    .from("services")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) fail("save the service", error);
}

export async function deleteServiceRow(id: string) {
  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) fail("remove the service", error);
}

export async function fetchTemplate(): Promise<StoredTemplate | null> {
  const { data, error } = await supabase
    .from("quote_templates")
    .select("id, tone, structure, payment_terms, warranty, extra")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) fail("load your quote style", error);
  return data ? toTemplate(data as TemplateRow) : null;
}

export async function saveTemplate(template: StoredTemplate): Promise<string> {
  const columns = { ...templateColumns(template), updated_at: new Date().toISOString() };
  if (template.id) {
    const { error } = await supabase.from("quote_templates").update(columns).eq("id", template.id);
    if (error) fail("save your quote style", error);
    return template.id;
  }
  const { data, error } = await supabase.from("quote_templates").insert(columns).select("id").maybeSingle();
  if (error || !data) fail("save your quote style", error);
  return (data as { id: string }).id;
}

export async function fetchLeads(): Promise<Lead[]> {
  const { data, error } = await supabase
    .from("leads")
    .select(LEAD_COLUMNS)
    .order("created_at", { ascending: false });
  if (error || !data) fail("load leads", error);
  return (data as LeadRow[]).map(toLead);
}

export type PublicForm = {
  source: string;
  business: { name: string; trade: string; city: string };
  services: string[];
};

const text = (value: unknown) => (typeof value === "string" ? value : "");

export async function fetchPublicForm(slug: string): Promise<PublicForm | null> {
  const { data, error } = await supabase.rpc("public_lead_form", { p_slug: slug });
  if (error) fail("load this form", error);
  if (!data || typeof data !== "object") return null;
  const form = data as { source?: unknown; business?: Record<string, unknown>; services?: unknown };
  const business = form.business ?? {};
  return {
    source: text(form.source),
    business: { name: text(business.name), trade: text(business.trade), city: text(business.city) },
    services: Array.isArray(form.services) ? form.services.filter((name): name is string => typeof name === "string") : [],
  };
}

export async function submitLeadViaLink(slug: string, input: Omit<LeadInput, "linkId" | "source">): Promise<string> {
  const answers: LeadAnswers = {
    jobType: input.jobType,
    description: input.description,
    urgency: input.urgency,
    preferredTime: input.preferredTime,
    propertyType: input.propertyType,
    budget: input.budget,
    accessNotes: input.accessNotes,
  };
  const { data, error } = await supabase.rpc("submit_lead_via_link", {
    p_slug: slug,
    p_name: input.name,
    p_phone: input.phone,
    p_email: input.email,
    p_address: input.address,
    p_answers: answers,
  });
  if (error || typeof data !== "string") fail("send your request", error);
  return data as string;
}

export async function fetchLeadById(id: string): Promise<Lead | null> {
  const { data, error } = await supabase.from("leads").select(LEAD_COLUMNS).eq("id", id).maybeSingle();
  if (error) fail("load the new lead", error);
  return data ? toLead(data as LeadRow) : null;
}

export function subscribeToNewLeads(userId: string, onLead: (id: string) => void): () => void {
  const channel = supabase
    .channel(`leads:${userId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "leads", filter: `user_id=eq.${userId}` },
      (payload) => {
        const id = (payload.new as { id?: unknown }).id;
        if (typeof id === "string") onLead(id);
      },
    )
    .subscribe();
  return () => {
    void supabase.removeChannel(channel);
  };
}

type ProfileRow = { name: string; trade: string; city: string; phone: string; email: string; currency: string };

export async function fetchProfile(): Promise<Business | null> {
  const { data, error } = await supabase
    .from("business_profiles")
    .select("name, trade, city, phone, email, currency")
    .maybeSingle();
  if (error) fail("load your business details", error);
  return data ? (data as ProfileRow) : null;
}

export async function saveProfile(business: Business) {
  const { error } = await supabase
    .from("business_profiles")
    .upsert({ ...business, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  if (error) fail("save your business details", error);
}

type LinkRow = { id: string; slug: string; source: string; created_at: string };

const toLink = (row: LinkRow): LeadLink => ({ id: row.id, slug: row.slug, source: row.source, createdAt: row.created_at });

export async function fetchLinks(): Promise<LeadLink[]> {
  const { data, error } = await supabase
    .from("lead_links")
    .select("id, slug, source, created_at")
    .order("created_at", { ascending: false });
  if (error || !data) fail("load your links", error);
  return (data as LinkRow[]).map(toLink);
}

export async function insertLinks(sources: string[]): Promise<LeadLink[]> {
  const { data, error } = await supabase
    .from("lead_links")
    .insert(sources.map((source) => ({ source })))
    .select("id, slug, source, created_at");
  if (error || !data) fail("create the link", error);
  return (data as LinkRow[]).map(toLink);
}

export async function updateLinkSource(id: string, source: string) {
  const { error } = await supabase.from("lead_links").update({ source }).eq("id", id);
  if (error) fail("rename the link", error);
}

export async function deleteLinkRow(id: string) {
  const { error } = await supabase.from("lead_links").delete().eq("id", id);
  if (error) fail("remove the link", error);
}

export async function updateLeadRow(id: string, patch: { status?: LeadStatus; quote?: string | null; quoteUpdatedAt?: string | null }) {
  const columns: Record<string, unknown> = {};
  if (patch.status !== undefined) columns.status = patch.status;
  if (patch.quote !== undefined) columns.quote = patch.quote;
  if (patch.quoteUpdatedAt !== undefined) columns.quote_updated_at = patch.quoteUpdatedAt;
  const { error } = await supabase.from("leads").update(columns).eq("id", id);
  if (error) fail("save the lead", error);
}
