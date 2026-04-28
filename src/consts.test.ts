import { test, expect, describe } from "bun:test";
import { configFor, search_key, validSections } from "./consts.ts";
import type { Section } from "./consts.ts";

describe("search_key", () => {
	test("returns correct key for torget", () => {
		expect(search_key("torget")).toBe("SEARCH_ID_BAP_COMMON");
	});

	test("returns correct key for jobb", () => {
		expect(search_key("jobb")).toBe("SEARCH_ID_JOB_FULLTIME");
	});

	test("returns correct key for eiendom", () => {
		expect(search_key("eiendom")).toBe("SEARCH_ID_REALESTATE_HOMES");
	});

	test("returns correct key for bil", () => {
		expect(search_key("bil")).toBe("SEARCH_ID_CAR_USED");
	});
});

describe("validSections", () => {
	test("contains all four sections", () => {
		expect(validSections).toContain("torget");
		expect(validSections).toContain("jobb");
		expect(validSections).toContain("eiendom");
		expect(validSections).toContain("bil");
		expect(validSections).toHaveLength(4);
	});
});

describe("configFor", () => {
	test("torget merges plumbing defaults with user params", () => {
		const { params } = configFor("torget");
		// from SECTION_DEFAULTS:
		expect(params.search_key).toBe("SEARCH_ID_BAP_ALL");
		expect(params.ad_type).toBe("67");
		expect(params.trade_type).toBe("Til salgs");
		// from user config:
		expect(params.q).toBe("espresso");
	});

	test("eiendom plumbing defaults are present even with no user config block", () => {
		const { params } = configFor("eiendom");
		expect(params.search_key).toBe("SEARCH_ID_REALESTATE_HOMES");
		expect(params.ad_type).toBe("1");
		expect(params.trade_type).toBe("Til salgs");
	});

	test("returns empty defaults for sections without explicit config", () => {
		const { params, blacklist } = configFor("jobb");
		expect(params).toEqual({});
		expect(blacklist).toEqual([]);
	});
});
