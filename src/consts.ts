const configJson = await import("../config.json", { with: { type: "json" } });

export const baseUrl = "https://www.finn.no/api/search-qf?";
export const hookUrl = process.env.WEBHOOK_URL;

const config = configJson.default;

export const { params, section } = config;

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
