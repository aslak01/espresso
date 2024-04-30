import { load } from "jsr:@std/dotenv";
const env = await load();

export const baseUrl = "https://www.finn.no/api/search-qf?";
export const hookUrl = Deno.env.get("WEBHOOK_URL") || env["WEBHOOK_URL"];
export const latitude = Deno.env.get("LAT") || env["LAT"];
export const longitude = Deno.env.get("LON") || env["LON"];

const configJson = await import("../config.json", { with: { "type": "json" } });
const config = configJson.default;

export const query = config.query;
export const rad = config.radius;
export const cat = config.category;
export const s_cat = config.sub_category;
export const section = config.section;

export async function blacklist(url = "./blacklist"): Promise<string[]> {
  const list = await Deno.readTextFile(url);
  const splitList = list.trim().split("\n").filter(Boolean).map((word) =>
    word.trim()
  );
  return splitList;
}

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
