import { load } from "@std/dotenv";

const env = await load();

export const scrapeUrl = env["ESPRESSO_QUERY"] ||
  Deno.env.get("ESPRESSO_QUERY");
export const hookUrl = env["WEBHOOK_URL"] || Deno.env.get("WEBHOOK_URL");

export const blacklist = [
  "bialetti",
  "ibili",
  "integrert",
  "automatisk",
  "kapsel",
  "kapsler",
  "pod",
  "nespresso",
  "nescafe",
  "aeropress",
  "moka",
  "tyrkisk",
  "electrolux",
  "siemens",
  "jura",
  "tassimo",
  "dualit",
  "kitchenaid",
];
