const configJson = await import("../config.json", { with: { type: "json" } });

export const baseUrl = "https://www.finn.no/api/search-qf?";
export const hookUrl = process.env.WEBHOOK_URL;

type SearchParams = {
	q: string;
	section: string;
	category: string;
	sub_category: string;
	trade_type: string;
	search_key: string;
	ad_type: string;
	radius: string;
	lat: string;
	lon: string;
};

type Config = {
	section: string;
	params: SearchParams;
	blacklist: string[];
};

const config: Config = configJson.default;

export const params: SearchParams = config.params;
export const section: string = config.section;
export const blacklist: string[] = config.blacklist;

const searchkey_prefix = "SEARCH_ID_";
const searchkey_postfix = {
	torget: "BAP_COMMON",
	jobb: "JOB_FULLTIME",
	eiendom: "REALESTATE_HOMES",
	bil: "CAR_USED",
} as const;

export const validSections = Object.keys(searchkey_postfix) as Section[];
export type Section = keyof typeof searchkey_postfix;

export function search_key(market: Section): string {
	return searchkey_prefix + searchkey_postfix[market];
}
