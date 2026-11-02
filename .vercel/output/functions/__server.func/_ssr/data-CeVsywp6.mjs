import { n as supabase } from "./supabase-DVps23Si.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/data-CeVsywp6.js
function toAllowance(raw) {
	if (!raw || typeof raw !== "object") return null;
	const value = raw;
	if (typeof value.used !== "number") return null;
	return {
		plan: value.plan === "pro" ? "pro" : "free",
		used: value.used,
		limit: typeof value.limit === "number" ? value.limit : 5
	};
}
function quotesLeft(allowance) {
	return Math.max(0, allowance.limit - allowance.used);
}
var LEAD_COLUMNS = "id, link_id, source, customer_name, phone, email, address, answers, status, quote, quote_updated_at, created_at";
function fail(action, error) {
	throw new Error(`Couldn't ${action}. ${error?.message ?? ""}`.trim());
}
function toLead(row) {
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
		quoteUpdatedAt: row.quote_updated_at
	};
}
function toTemplate(row) {
	return {
		id: row.id,
		tone: row.tone,
		structure: row.structure,
		paymentTerms: row.payment_terms,
		warranty: row.warranty,
		extra: row.extra
	};
}
function templateColumns(template) {
	return {
		tone: template.tone,
		structure: template.structure,
		payment_terms: template.paymentTerms,
		warranty: template.warranty,
		extra: template.extra
	};
}
async function fetchServices() {
	const { data, error } = await supabase.from("services").select("id, name, description, price, notes").order("created_at", { ascending: false });
	if (error || !data) fail("load services", error);
	return data;
}
async function insertServices(items) {
	const { error } = await supabase.from("services").insert(items);
	if (error) fail("save the service", error);
}
async function updateServiceRow(id, patch) {
	const { error } = await supabase.from("services").update({
		...patch,
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	}).eq("id", id);
	if (error) fail("save the service", error);
}
async function deleteServiceRow(id) {
	const { error } = await supabase.from("services").delete().eq("id", id);
	if (error) fail("remove the service", error);
}
async function fetchTemplate() {
	const { data, error } = await supabase.from("quote_templates").select("id, tone, structure, payment_terms, warranty, extra").order("updated_at", { ascending: false }).limit(1).maybeSingle();
	if (error) fail("load your quote style", error);
	return data ? toTemplate(data) : null;
}
async function saveTemplate(template) {
	const columns = {
		...templateColumns(template),
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	};
	if (template.id) {
		const { error } = await supabase.from("quote_templates").update(columns).eq("id", template.id);
		if (error) fail("save your quote style", error);
		return template.id;
	}
	const { data, error } = await supabase.from("quote_templates").insert(columns).select("id").maybeSingle();
	if (error || !data) fail("save your quote style", error);
	return data.id;
}
async function fetchLeads() {
	const { data, error } = await supabase.from("leads").select(LEAD_COLUMNS).order("created_at", { ascending: false });
	if (error || !data) fail("load leads", error);
	return data.map(toLead);
}
var text = (value) => typeof value === "string" ? value : "";
async function fetchPublicForm(slug) {
	const { data, error } = await supabase.rpc("public_lead_form", { p_slug: slug });
	if (error) fail("load this form", error);
	if (!data || typeof data !== "object") return null;
	const form = data;
	const business = form.business ?? {};
	return {
		source: text(form.source),
		business: {
			name: text(business.name),
			trade: text(business.trade),
			city: text(business.city)
		},
		services: Array.isArray(form.services) ? form.services.filter((name) => typeof name === "string") : []
	};
}
async function submitLeadViaLink(slug, input) {
	const answers = {
		jobType: input.jobType,
		description: input.description,
		urgency: input.urgency,
		preferredTime: input.preferredTime,
		propertyType: input.propertyType,
		budget: input.budget,
		accessNotes: input.accessNotes
	};
	const { data, error } = await supabase.rpc("submit_lead_via_link", {
		p_slug: slug,
		p_name: input.name,
		p_phone: input.phone,
		p_email: input.email,
		p_address: input.address,
		p_answers: answers
	});
	if (error || typeof data !== "string") fail("send your request", error);
	return data;
}
async function fetchLeadById(id) {
	const { data, error } = await supabase.from("leads").select(LEAD_COLUMNS).eq("id", id).maybeSingle();
	if (error) fail("load the new lead", error);
	return data ? toLead(data) : null;
}
function subscribeToNewLeads(userId, onLead) {
	const channel = supabase.channel(`leads:${userId}`).on("postgres_changes", {
		event: "INSERT",
		schema: "public",
		table: "leads",
		filter: `user_id=eq.${userId}`
	}, (payload) => {
		const id = payload.new.id;
		if (typeof id === "string") onLead(id);
	}).subscribe();
	return () => {
		supabase.removeChannel(channel);
	};
}
async function fetchProfile() {
	const { data, error } = await supabase.from("business_profiles").select("name, trade, city, phone, email, currency").maybeSingle();
	if (error) fail("load your business details", error);
	return data ? data : null;
}
async function saveProfile(business) {
	const { error } = await supabase.from("business_profiles").upsert({
		...business,
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	}, { onConflict: "user_id" });
	if (error) fail("save your business details", error);
}
var toLink = (row) => ({
	id: row.id,
	slug: row.slug,
	source: row.source,
	createdAt: row.created_at
});
async function fetchLinks() {
	const { data, error } = await supabase.from("lead_links").select("id, slug, source, created_at").order("created_at", { ascending: false });
	if (error || !data) fail("load your links", error);
	return data.map(toLink);
}
async function insertLinks(sources) {
	const { data, error } = await supabase.from("lead_links").insert(sources.map((source) => ({ source }))).select("id, slug, source, created_at");
	if (error || !data) fail("create the link", error);
	return data.map(toLink);
}
async function updateLinkSource(id, source) {
	const { error } = await supabase.from("lead_links").update({ source }).eq("id", id);
	if (error) fail("rename the link", error);
}
async function deleteLinkRow(id) {
	const { error } = await supabase.from("lead_links").delete().eq("id", id);
	if (error) fail("remove the link", error);
}
async function updateLeadRow(id, patch) {
	const columns = {};
	if (patch.status !== void 0) columns.status = patch.status;
	if (patch.quote !== void 0) columns.quote = patch.quote;
	if (patch.quoteUpdatedAt !== void 0) columns.quote_updated_at = patch.quoteUpdatedAt;
	const { error } = await supabase.from("leads").update(columns).eq("id", id);
	if (error) fail("save the lead", error);
}
async function fetchAllowance() {
	const { data, error } = await supabase.rpc("quote_allowance");
	if (error) fail("load your plan", error);
	return toAllowance(data);
}
//#endregion
export { updateLinkSource as C, updateLeadRow as S, submitLeadViaLink as _, fetchLeadById as a, toLead as b, fetchProfile as c, fetchTemplate as d, insertLinks as f, saveTemplate as g, saveProfile as h, fetchAllowance as i, fetchPublicForm as l, quotesLeft as m, deleteLinkRow as n, fetchLeads as o, insertServices as p, deleteServiceRow as r, fetchLinks as s, LEAD_COLUMNS as t, fetchServices as u, subscribeToNewLeads as v, updateServiceRow as w, toTemplate as x, toAllowance as y };
