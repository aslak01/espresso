import { SECTION_DEFAULTS } from "./section_defaults.ts";

const configJson = await import("../config.json", { with: { type: "json" } });

export const hookUrl = process.env.WEBHOOK_URL;

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

type SectionConfig = {
	params?: Record<string, string>;
	blacklist?: string[];
};

type Config = {
	default_section: Section;
	sections: Partial<Record<Section, SectionConfig>>;
};

const config: Config = configJson.default;

export const defaultSection: Section = config.default_section;

export type ResolvedConfig = {
	params: Record<string, string>;
	blacklist: string[];
};

export function configFor(section: Section): ResolvedConfig {
	const user = config.sections[section] ?? {};
	const defaults = SECTION_DEFAULTS[section] ?? {};
	return {
		params: { ...defaults, ...(user.params ?? {}) },
		blacklist: user.blacklist ?? [],
	};
}
