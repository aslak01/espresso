import { test, expect, describe } from "bun:test";
import { search_key, validSections } from "./consts.ts";
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
