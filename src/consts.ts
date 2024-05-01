import { load } from "jsr:@std/dotenv";
const configJson = await import("../config.json", { with: { "type": "json" } });
const env = await load();

export const baseUrl = "https://www.finn.no/api/search-qf?";
// Two env variable parsing formats because github actions has no .env file
export const hookUrl = Deno.env.get("WEBHOOK_URL") || env["WEBHOOK_URL"];

const config = configJson.default;

export const params = config.params;
export const section = config.section;

export const blacklist = config.blacklist;

const searchkey_prefix = "SEARCH_ID_";
const searchkey_postfix = {
  torget: "BAP_COMMON",
  jobb: "JOB_FULLTIME",
  eiendom: "REALESTATE_HOMES",
  bil: "CAR_USED",
};

export function search_key(market: keyof typeof searchkey_postfix): string {
  return searchkey_prefix + searchkey_postfix[market];
}
