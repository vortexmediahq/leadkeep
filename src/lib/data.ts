import { supabase } from "@/lib/supabase";
import type { Lead, LeadInput, LeadStatus, QuoteTemplate, Service } from "@/lib/types";

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
    .select("id, link_id, source, customer_name, phone, email, address, answers, status, quote, quote_updated_at, created_at")
    .order("created_at", { ascending: false });
  if (error || !data) fail("load leads", error);
  return (data as LeadRow[]).map(toLead);
}

export async function insertLead(id: string, input: LeadInput) {
  const answers: LeadAnswers = {
    jobType: input.jobType,
    description: input.description,
    urgency: input.urgency,
    preferredTime: input.preferredTime,
    propertyType: input.propertyType,
    budget: input.budget,
    accessNotes: input.accessNotes,
  };
  const { error } = await supabase.from("leads").insert({
    id,
    link_id: input.linkId,
    source: input.source,
    customer_name: input.name,
    phone: input.phone,
    email: input.email,
    address: input.address,
    answers,
  });
  if (error) fail("send your request", error);
}

export async function updateLeadRow(id: string, patch: { status?: LeadStatus; quote?: string | null; quoteUpdatedAt?: string | null }) {
  const columns: Record<string, unknown> = {};
  if (patch.status !== undefined) columns.status = patch.status;
  if (patch.quote !== undefined) columns.quote = patch.quote;
  if (patch.quoteUpdatedAt !== undefined) columns.quote_updated_at = patch.quoteUpdatedAt;
  const { error } = await supabase.from("leads").update(columns).eq("id", id);
  if (error) fail("save the lead", error);
}
