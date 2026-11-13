import { toEntitlements, type Entitlements } from "@/lib/entitlements";
import { toAllowance, type Allowance } from "@/lib/plan";
import { supabase } from "@/lib/supabase";
import { parseQuestions } from "@/lib/question-templates";
import type { LinkKind } from "@/lib/quote-flow";
import { parseLinkKind, parseQuoteState, parseQuoteStyle, type QuoteState, type QuoteStyle } from "@/lib/quote-flow";
import {
  BRANDING_SETUP_MESSAGE,
  blankBranding,
  hasBranding,
  isMissingBrandingColumns,
  logoMimeType,
  logoUploadMessage,
  logoUrl,
  parseFont,
  parseHexColor,
  type Branding,
} from "@/lib/branding";
import type { Business, Lead, LeadInput, LeadLink, LeadResponse, LeadStatus, Question, Questionnaire, QuoteTemplate, Service } from "@/lib/types";

type ServiceRow = { id: string; name: string; description: string; price: string; notes: string };

export type TemplateRow = {
  id: string;
  tone: string;
  structure: string;
  payment_terms: string;
  warranty: string;
  extra: string;
};

type LeadAnswers = Pick<
  Lead,
  "jobType" | "description" | "urgency" | "preferredTime" | "propertyType" | "budget" | "accessNotes" | "responses"
>;

function toResponses(value: unknown): LeadResponse[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    .map((item) => ({ question: text(item.question), answer: text(item.answer) }))
    .filter((item) => item.question || item.answer);
}

export type LeadRow = {
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
  service_name?: string | null;
  quote_token?: string | null;
  quote_state?: string | null;
  quote_sent_at?: string | null;
  quote_viewed_at?: string | null;
  quote_accepted_at?: string | null;
  quote_expires_at?: string | null;
};

export const LEAD_COLUMNS =
  "id, link_id, source, customer_name, phone, email, address, answers, status, quote, quote_updated_at, created_at";
/** Added by the quote-flow database update. Until it is applied the app reads the base columns only. */
const LEAD_QUOTE_COLUMNS =
  "service_name, quote_token, quote_state, quote_sent_at, quote_viewed_at, quote_accepted_at, quote_expires_at";
let quoteFlowLeads: boolean | null = null;

export type StoredTemplate = QuoteTemplate & { id: string | null };

const text = (value: unknown) => (typeof value === "string" ? value : "");

function fail(action: string, error: { message: string } | null): never {
  throw new Error(`Couldn't ${action}. ${error?.message ?? ""}`.trim());
}

export function toLead(row: LeadRow): Lead {
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
    responses: toResponses(answers.responses),
    status: row.status,
    createdAt: row.created_at,
    quote: row.quote,
    quoteUpdatedAt: row.quote_updated_at,
    serviceName: row.service_name ?? "",
    quoteToken: row.quote_token ?? null,
    quoteState: parseQuoteState(row.quote_state),
    quoteSentAt: row.quote_sent_at ?? null,
    quoteViewedAt: row.quote_viewed_at ?? null,
    quoteAcceptedAt: row.quote_accepted_at ?? null,
    quoteExpiresAt: row.quote_expires_at ?? null,
  };
}

export function toTemplate(row: TemplateRow): StoredTemplate {
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
  if (quoteFlowLeads !== false) {
    const full = await supabase
      .from("leads")
      .select(`${LEAD_COLUMNS}, ${LEAD_QUOTE_COLUMNS}`)
      .order("created_at", { ascending: false });
    if (!full.error && full.data) {
      quoteFlowLeads = true;
      return (full.data as unknown as LeadRow[]).map(toLead);
    }
    quoteFlowLeads = false;
  }
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
  questionnaire: { name: string; intro: string; questions: Question[] } | null;
  branding: Branding | null;
  kind: LinkKind;
  landing: Landing;
};

export type Landing = {
  headline: string;
  intro: string;
  mediaPath: string;
  mediaUrl: string;
  ctaText: string;
  serviceName: string;
};

function toPublicBranding(value: unknown): Branding | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  return {
    logoPath: text(row.logo_path),
    primaryColor: parseHexColor(row.primary_color),
    accentColor: parseHexColor(row.accent_color),
    font: parseFont(row.font),
    showOnQuote: true,
    showOnForm: true,
    logoOnQuote: true,
    logoOnForm: true,
    quoteStyle: "clean",
    quoteBgPath: "",
    quoteValidDays: 14,
  };
}

export async function fetchPublicForm(slug: string): Promise<PublicForm | null> {
  const { data, error } = await supabase.rpc("public_lead_form", { p_slug: slug });
  if (error) fail("load this form", error);
  if (!data || typeof data !== "object") return null;
  const form = data as { source?: unknown; business?: Record<string, unknown>; services?: unknown; questionnaire?: unknown; branding?: unknown; kind?: unknown; landing?: Record<string, unknown> };
  const business = form.business ?? {};
  const raw = form.questionnaire && typeof form.questionnaire === "object" ? (form.questionnaire as Record<string, unknown>) : null;
  const questions = raw ? parseQuestions(raw.questions) : [];
  return {
    questionnaire: raw && questions.length ? { name: text(raw.name), intro: text(raw.intro), questions } : null,
    source: text(form.source),
    business: { name: text(business.name), trade: text(business.trade), city: text(business.city) },
    services: Array.isArray(form.services) ? form.services.filter((name): name is string => typeof name === "string") : [],
    branding: toPublicBranding(form.branding),
    kind: parseLinkKind(form.kind),
    landing: {
      headline: text(form.landing?.headline),
      intro: text(form.landing?.intro),
      mediaPath: text(form.landing?.media_path),
      mediaUrl: text(form.landing?.media_url),
      ctaText: text(form.landing?.cta_text),
      serviceName: text(form.landing?.service_name),
    },
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
    responses: input.responses,
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
  const { data, error } = await supabase
    .from("leads")
    .select(quoteFlowLeads === false ? LEAD_COLUMNS : `${LEAD_COLUMNS}, ${LEAD_QUOTE_COLUMNS}`)
    .eq("id", id)
    .maybeSingle();
  if (error) fail("load the new lead", error);
  return data ? toLead(data as unknown as LeadRow) : null;
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
type BrandingRow = {
  logo_path: string;
  primary_color: string;
  accent_color: string;
  font: string;
  show_on_quote: boolean;
  show_on_form: boolean;
  logo_on_quote?: boolean;
  logo_on_form?: boolean;
  quote_style?: string;
  quote_bg_path?: string;
  quote_valid_days?: number;
};

export type StoredProfile = { business: Business; branding: Branding };

const PROFILE_COLUMNS = "name, trade, city, phone, email, currency";
const BRANDING_COLUMNS = "logo_path, primary_color, accent_color, font, show_on_quote, show_on_form";
/** Added by the quote-flow database update. */
const QUOTE_OPTION_COLUMNS = "logo_on_quote, logo_on_form, quote_style, quote_bg_path, quote_valid_days";

function toBranding(row: Partial<BrandingRow> | null | undefined): Branding {
  if (!row) return { ...blankBranding };
  const days = Number(row.quote_valid_days);
  return {
    logoPath: text(row.logo_path),
    primaryColor: parseHexColor(row.primary_color),
    accentColor: parseHexColor(row.accent_color),
    font: parseFont(row.font),
    showOnQuote: row.show_on_quote !== false,
    showOnForm: row.show_on_form !== false,
    logoOnQuote: row.logo_on_quote !== false,
    logoOnForm: row.logo_on_form !== false,
    quoteStyle: parseQuoteStyle(row.quote_style),
    quoteBgPath: text(row.quote_bg_path),
    quoteValidDays: Number.isFinite(days) && days >= 1 && days <= 90 ? Math.round(days) : 14,
  };
}

function brandingColumns(branding: Branding) {
  return {
    logo_path: branding.logoPath.slice(0, 300),
    primary_color: branding.primaryColor,
    accent_color: branding.accentColor,
    font: branding.font,
    show_on_quote: branding.showOnQuote,
    show_on_form: branding.showOnForm,
  };
}

function quoteOptionColumns(branding: Branding) {
  return {
    logo_on_quote: branding.logoOnQuote,
    logo_on_form: branding.logoOnForm,
    quote_style: branding.quoteStyle,
    quote_bg_path: branding.quoteBgPath.slice(0, 300),
    quote_valid_days: branding.quoteValidDays,
  };
}

export function publicLogoUrl(logoPath: string) {
  const env = (import.meta as unknown as { env: Record<string, string | undefined> }).env;
  return logoUrl(logoPath, env.VITE_SUPABASE_URL ?? "");
}

export async function fetchProfile(): Promise<StoredProfile | null> {
  for (const columns of [`${PROFILE_COLUMNS}, ${BRANDING_COLUMNS}, ${QUOTE_OPTION_COLUMNS}`, `${PROFILE_COLUMNS}, ${BRANDING_COLUMNS}`]) {
    const result = await supabase.from("business_profiles").select(columns).maybeSingle();
    if (result.error) continue;
    if (!result.data) return null;
    const row = result.data as unknown as ProfileRow & BrandingRow;
    const { name, trade, city, phone, email, currency, ...brand } = row;
    return { business: { name, trade, city, phone, email, currency }, branding: toBranding(brand) };
  }
  const { data, error } = await supabase.from("business_profiles").select(PROFILE_COLUMNS).maybeSingle();
  if (error) fail("load your business details", error);
  return data ? { business: data as ProfileRow, branding: { ...blankBranding } } : null;
}

export async function saveProfile(business: Business, branding?: Branding) {
  const base = { ...business, updated_at: new Date().toISOString() };
  // Anything beyond the plain defaults means the owner has actually set up branding or quote options.
  const wantsBranding =
    !!branding && (hasBranding(branding) || branding.font !== "sans" || !branding.showOnQuote || !branding.showOnForm);
  const wantsQuoteOptions =
    !!branding &&
    (!branding.logoOnQuote ||
      !branding.logoOnForm ||
      branding.quoteStyle !== "clean" ||
      !!branding.quoteBgPath ||
      branding.quoteValidDays !== 14);
  let brandingError: { code?: string; message?: string } | null = null;
  let quoteMissing = false;
  if (branding) {
    const full = await supabase
      .from("business_profiles")
      .upsert({ ...base, ...brandingColumns(branding), ...quoteOptionColumns(branding) }, { onConflict: "user_id" });
    if (!full.error) return;
    const older = await supabase
      .from("business_profiles")
      .upsert({ ...base, ...brandingColumns(branding) }, { onConflict: "user_id" });
    if (!older.error) {
      if (wantsQuoteOptions) {
        throw new Error(
          "Your quote options (style, logo tick boxes, background) can't be saved yet. The quote database update 20261113120000_quote_flow.sql still needs to be applied.",
        );
      }
      return;
    }
    brandingError = older.error;
    quoteMissing = isMissingBrandingColumns(full.error);
  }
  // Older database without the branding columns: keep saving the business details as before.
  const { error } = await supabase.from("business_profiles").upsert(base, { onConflict: "user_id" });
  if (error) fail("save your business details", error);
  // Do not pretend branding was saved when it was not (this used to fail silently).
  if (wantsBranding || (wantsQuoteOptions && quoteMissing)) {
    throw new Error(
      isMissingBrandingColumns(brandingError)
        ? BRANDING_SETUP_MESSAGE
        : `We couldn't save your branding. ${brandingError?.message ?? ""}`.trim(),
    );
  }
}

const LOGO_EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

/** Uploads a picture into the owner's own folder of the public `brand-assets` bucket and returns its path. */
export async function uploadBrandImage(userId: string, file: File, name: string): Promise<string> {
  const mime = logoMimeType(file);
  const ext = LOGO_EXT[mime];
  if (!ext) throw new Error("Please use a PNG, JPG, WEBP or SVG image.");
  if (file.size > 2 * 1024 * 1024) throw new Error("Please keep the image under 2 MB.");
  const path = `${userId}/${name}.${ext}`;
  const { error } = await supabase.storage.from("brand-assets").upload(path, file, { upsert: true, contentType: mime });
  if (error) throw new Error(logoUploadMessage(error as { message?: string; statusCode?: string }));
  return path;
}

export const uploadLogo = (userId: string, file: File) => uploadBrandImage(userId, file, "logo");

export async function removeLogo(logoPath: string) {
  if (!logoPath.trim()) return;
  await supabase.storage.from("brand-assets").remove([logoPath]);
}

type LinkRow = {
  id: string;
  slug: string;
  source: string;
  created_at: string;
  questionnaire_id?: string | null;
  kind?: string | null;
  service_id?: string | null;
  headline?: string | null;
  intro?: string | null;
  media_path?: string | null;
  media_url?: string | null;
  cta_text?: string | null;
  auto_send?: boolean | null;
};

const toLink = (row: LinkRow): LeadLink => ({
  id: row.id,
  slug: row.slug,
  source: row.source,
  questionnaireId: row.questionnaire_id ?? null,
  createdAt: row.created_at,
  kind: parseLinkKind(row.kind),
  serviceId: row.service_id ?? null,
  headline: row.headline ?? "",
  intro: row.intro ?? "",
  mediaPath: row.media_path ?? "",
  mediaUrl: row.media_url ?? "",
  ctaText: row.cta_text ?? "",
  autoSend: row.auto_send !== false,
});

const LINK_COLUMNS = "id, slug, source, created_at";
const LINK_QUOTE_COLUMNS = "kind, service_id, headline, intro, media_path, media_url, cta_text, auto_send";
let quoteFlowLinks: boolean | null = null;

/**
 * Questionnaires need the database update in supabase/proposed/. Until it's applied,
 * every questionnaire call fails softly and links use the default questions.
 */
let questionnairesReady: boolean | null = null;
export const questionnairesAvailable = () => questionnairesReady !== false;
export const quoteFlowAvailable = () => quoteFlowLinks === true;

export async function fetchLinks(): Promise<LeadLink[]> {
  if (questionnairesReady !== false) {
    if (quoteFlowLinks !== false) {
      const full = await supabase
        .from("lead_links")
        .select(`${LINK_COLUMNS}, questionnaire_id, ${LINK_QUOTE_COLUMNS}`)
        .order("created_at", { ascending: false });
      if (!full.error && full.data) {
        questionnairesReady = true;
        quoteFlowLinks = true;
        return (full.data as unknown as LinkRow[]).map(toLink);
      }
      quoteFlowLinks = false;
    }
    const { data, error } = await supabase
      .from("lead_links")
      .select(`${LINK_COLUMNS}, questionnaire_id`)
      .order("created_at", { ascending: false });
    if (!error && data) {
      questionnairesReady = true;
      return (data as LinkRow[]).map(toLink);
    }
    questionnairesReady = false;
  }
  const { data, error } = await supabase.from("lead_links").select(LINK_COLUMNS).order("created_at", { ascending: false });
  if (error || !data) fail("load your links", error);
  return (data as LinkRow[]).map(toLink);
}

export type NewLinkOptions = {
  questionnaireId?: string | null;
  kind?: LinkKind;
  serviceId?: string | null;
  ctaText?: string;
  headline?: string;
};

export async function insertLinks(sources: string[], questionnaireId: string | null = null, options: NewLinkOptions = {}): Promise<LeadLink[]> {
  const withQuestions = questionnairesReady === true && questionnaireId;
  const kind = options.kind ?? "questionnaire";
  if (kind !== "questionnaire" && quoteFlowLinks !== true) {
    throw new Error("Quote and simple links need the quote database update (20261113120000_quote_flow.sql) to be applied first.");
  }
  const extra =
    quoteFlowLinks === true && kind !== "questionnaire"
      ? { kind, service_id: options.serviceId ?? null, cta_text: options.ctaText ?? "", headline: options.headline ?? "" }
      : {};
  const { data, error } = await supabase
    .from("lead_links")
    .insert(sources.map((source) => ({ source, ...(withQuestions ? { questionnaire_id: questionnaireId } : {}), ...extra })))
    .select(
      quoteFlowLinks === true
        ? `${LINK_COLUMNS}, questionnaire_id, ${LINK_QUOTE_COLUMNS}`
        : questionnairesReady === true
          ? `${LINK_COLUMNS}, questionnaire_id`
          : LINK_COLUMNS,
    );
  if (error || !data) fail("create the link", error);
  return (data as unknown as LinkRow[]).map(toLink);
}

export type LinkLandingPatch = Partial<Pick<LeadLink, "headline" | "intro" | "mediaPath" | "mediaUrl" | "ctaText" | "autoSend" | "serviceId">>;

export async function updateLinkLanding(id: string, patch: LinkLandingPatch) {
  const columns: Record<string, unknown> = {};
  if (patch.headline !== undefined) columns.headline = patch.headline.slice(0, 120);
  if (patch.intro !== undefined) columns.intro = patch.intro.slice(0, 600);
  if (patch.mediaPath !== undefined) columns.media_path = patch.mediaPath.slice(0, 300);
  if (patch.mediaUrl !== undefined) columns.media_url = patch.mediaUrl.slice(0, 300);
  if (patch.ctaText !== undefined) columns.cta_text = patch.ctaText.slice(0, 40);
  if (patch.autoSend !== undefined) columns.auto_send = patch.autoSend;
  if (patch.serviceId !== undefined) columns.service_id = patch.serviceId;
  const { error } = await supabase.from("lead_links").update(columns).eq("id", id);
  if (error) fail("save the link", error);
}

export async function updateLinkQuestionnaire(id: string, questionnaireId: string | null) {
  const { error } = await supabase.from("lead_links").update({ questionnaire_id: questionnaireId }).eq("id", id);
  if (error) fail("change the link's questions", error);
}

type QuestionnaireRow = { id: string; name: string; intro: string; questions: unknown; updated_at: string };

const toQuestionnaire = (row: QuestionnaireRow): Questionnaire => ({
  id: row.id,
  name: row.name,
  intro: row.intro,
  questions: parseQuestions(row.questions),
  updatedAt: row.updated_at,
});

export async function fetchQuestionnaires(): Promise<Questionnaire[]> {
  const { data, error } = await supabase
    .from("questionnaires")
    .select("id, name, intro, questions, updated_at")
    .order("updated_at", { ascending: false });
  if (error || !data) fail("load your questionnaires", error);
  return (data as QuestionnaireRow[]).map(toQuestionnaire);
}

export async function insertQuestionnaire(item: Omit<Questionnaire, "updatedAt">) {
  const { error } = await supabase
    .from("questionnaires")
    .insert({ id: item.id, name: item.name, intro: item.intro, questions: item.questions });
  if (error) fail("save the questionnaire", error);
}

export async function updateQuestionnaireRow(item: Omit<Questionnaire, "updatedAt">) {
  const { error } = await supabase
    .from("questionnaires")
    .update({ name: item.name, intro: item.intro, questions: item.questions, updated_at: new Date().toISOString() })
    .eq("id", item.id);
  if (error) fail("save the questionnaire", error);
}

export async function deleteQuestionnaireRow(id: string) {
  const { error } = await supabase.from("questionnaires").delete().eq("id", id);
  if (error) fail("remove the questionnaire", error);
}

export async function updateLinkSource(id: string, source: string) {
  const { error } = await supabase.from("lead_links").update({ source }).eq("id", id);
  if (error) fail("rename the link", error);
}

export async function deleteLinkRow(id: string) {
  const { error } = await supabase.from("lead_links").delete().eq("id", id);
  if (error) fail("remove the link", error);
}

export type LeadPatch = {
  status?: LeadStatus;
  quote?: string | null;
  quoteUpdatedAt?: string | null;
  quoteToken?: string | null;
  quoteState?: QuoteState;
  quoteSentAt?: string | null;
  quoteExpiresAt?: string | null;
};

export async function updateLeadRow(id: string, patch: LeadPatch) {
  const columns: Record<string, unknown> = {};
  if (patch.status !== undefined) columns.status = patch.status;
  if (patch.quote !== undefined) columns.quote = patch.quote;
  if (patch.quoteUpdatedAt !== undefined) columns.quote_updated_at = patch.quoteUpdatedAt;
  if (patch.quoteToken !== undefined) columns.quote_token = patch.quoteToken;
  if (patch.quoteState !== undefined) columns.quote_state = patch.quoteState;
  if (patch.quoteSentAt !== undefined) columns.quote_sent_at = patch.quoteSentAt;
  if (patch.quoteExpiresAt !== undefined) columns.quote_expires_at = patch.quoteExpiresAt;
  const { error } = await supabase.from("leads").update(columns).eq("id", id);
  if (error) fail("save the lead", error);
}

export type LandingResult = { ok: boolean; state: QuoteState; token: string | null; leadId: string | null };

export async function submitLandingRequest(
  slug: string,
  input: { name: string; email: string; phone: string; website: string; consent: boolean },
): Promise<LandingResult> {
  const { data, error } = await supabase.rpc("submit_landing_request", {
    p_slug: slug,
    p_name: input.name,
    p_email: input.email,
    p_phone: input.phone,
    p_website: input.website,
    p_consent: input.consent,
  });
  if (error || !data || typeof data !== "object") fail("send your request", error);
  const row = data as Record<string, unknown>;
  return {
    ok: row.ok === true,
    state: parseQuoteState(row.state),
    token: typeof row.token === "string" ? row.token : null,
    leadId: typeof row.lead_id === "string" ? row.lead_id : null,
  };
}

export type QuoteView = {
  text: string;
  customer: string;
  service: string;
  state: QuoteState;
  expired: boolean;
  expiresAt: string | null;
  acceptedAt: string | null;
  business: { name: string; phone: string; email: string };
  style: QuoteStyle;
  backgroundPath: string;
  branding: Branding | null;
};

export async function fetchQuoteView(token: string, track = true): Promise<QuoteView | null> {
  const { data, error } = await supabase.rpc("view_quote", { p_token: token, p_track: track });
  if (error) fail("load this quote", error);
  if (!data || typeof data !== "object") return null;
  const row = data as Record<string, unknown>;
  const business = (row.business ?? {}) as Record<string, unknown>;
  const branding = toPublicBranding(row.branding);
  return {
    text: text(row.text),
    customer: text(row.customer),
    service: text(row.service),
    state: parseQuoteState(row.state),
    expired: row.expired === true,
    expiresAt: typeof row.expires_at === "string" ? row.expires_at : null,
    acceptedAt: typeof row.accepted_at === "string" ? row.accepted_at : null,
    business: { name: text(business.name), phone: text(business.phone), email: text(business.email) },
    style: parseQuoteStyle(row.style),
    backgroundPath: text(row.background_path),
    branding,
  };
}

export async function acceptQuoteRpc(token: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("accept_quote", { p_token: token });
  if (error) fail("accept this quote", error);
  return data === true;
}

export async function fetchAllowance(): Promise<Allowance | null> {
  const { data, error } = await supabase.rpc("quote_allowance");
  if (error) fail("load your plan", error);
  return toAllowance(data);
}

/** Needs supabase/proposed/20261110090000_plans_whop.sql. Returns null until that update is applied. */
export async function fetchEntitlements(): Promise<Entitlements | null> {
  const { data, error } = await supabase.rpc("my_entitlements");
  if (error) return null;
  return toEntitlements(data);
}

export async function fetchFoundingSpotsLeft(): Promise<number | null> {
  const { data, error } = await supabase.rpc("founding_spots_left");
  if (error || typeof data !== "number") return null;
  return data;
}
