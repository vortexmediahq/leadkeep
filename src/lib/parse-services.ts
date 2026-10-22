import type { Service } from "@/lib/types";

const PRICE =
  /((?:from\s+)?(?:R|ZAR|\$|£|€)\s?\d[\d\s,]*(?:\s*[–—-]\s*(?:R|ZAR|\$|£|€)?\s?\d[\d\s,]*)?)/i;

function pullPrice(text: string) {
  const match = text.match(PRICE);
  if (!match || match.index === undefined) return { text: text.trim(), price: "" };
  const price = match[1].trim();
  const next = `${text.slice(0, match.index)} ${text.slice(match.index + match[0].length)}`
    .replace(/\s{2,}/g, " ")
    .replace(/^[\s,–—-]+|[\s,–—-]+$/g, "")
    .trim();
  return { text: next, price };
}

function clean(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function parseServiceList(raw: string): Omit<Service, "id">[] {
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 40);

  const services: Omit<Service, "id">[] = [];

  for (const original of lines) {
    if (/^(name|service)\b/i.test(original) && /[|,\t]/.test(original)) continue;
    const line = original.replace(/^[-*•]\s+/, "");

    let name = "";
    let description = "";
    let price = "";
    let notes = "";

    if (line.includes("|")) {
      const parts = line.split("|").map(clean);
      name = parts[0] ?? "";
      description = parts[1] ?? "";
      price = parts[2] ?? "";
      notes = parts[3] ?? "";
    } else if (line.includes("\t")) {
      const parts = line.split("\t").map(clean);
      name = parts[0] ?? "";
      description = parts[1] ?? "";
      price = parts[2] ?? "";
      notes = parts[3] ?? "";
    } else {
      const dashed = line.match(/^(.+?)\s+[—–-]\s+(.+)$/);
      const colon = line.match(/^(.+?):\s+(.+)$/);
      if (dashed) {
        name = clean(dashed[1]);
        price = clean(dashed[2]);
      } else if (colon) {
        name = clean(colon[1]);
        description = clean(colon[2]);
      } else {
        name = clean(line);
      }
    }

    if (!price) {
      const fromDescription = pullPrice(description);
      if (fromDescription.price) {
        description = fromDescription.text;
        price = fromDescription.price;
      } else {
        const fromName = pullPrice(name);
        if (fromName.price && fromName.text) {
          name = fromName.text;
          price = fromName.price;
        }
      }
    }

    if (!name) continue;
    services.push({ name, description, price, notes });
  }

  return services;
}
