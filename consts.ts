import { load } from "jsr:@std/dotenv";
const env = await load();

export const baseUrl = Deno.env.get("SCRAPE_BASE_URL") ||
  env["SCRAPE_BASE_URL"];
export const hookUrl = Deno.env.get("WEBHOOK_URL") || env["WEBHOOK_URL"];

export const query = Deno.env.get("Q") || env["Q"];
export const latitude = Deno.env.get("LAT") || env["LAT"];
export const longitude = Deno.env.get("LON") || env["LON"];
export const rad = Deno.env.get("RAD") || env["RAD"];
export const cat = Deno.env.get("CAT") || env["CAT"];
export const s_cat = Deno.env.get("S_CAT") || env["S_CAT"];
export const marketplace = Deno.env.get("MARKETPLACE") || env["MARKETPLACE"];

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
