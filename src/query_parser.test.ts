import { test, expect, describe } from "bun:test";
import { assembleQuery } from "./query_parser.ts";

describe("assembleQuery", () => {
	test("includes searchkey and vertical=bap", () => {
		const result = assembleQuery("SEARCH_ID_BAP_COMMON", {});
		expect(result).toContain("searchkey=SEARCH_ID_BAP_COMMON");
		expect(result).toContain("vertical=bap");
	});

	test("includes normal params", () => {
		const result = assembleQuery("SEARCH_ID_BAP_COMMON", {
			q: "espresso",
			radius: "30000",
		});
		expect(result).toContain("q=espresso");
		expect(result).toContain("radius=30000");
	});

	test("excludes trade_type param", () => {
		const result = assembleQuery("KEY", {
			q: "espresso",
			trade_type: "Til salgs",
		});
		expect(result).not.toContain("trade_type");
		expect(result).toContain("q=espresso");
	});

	test("excludes ad_type param", () => {
		const result = assembleQuery("KEY", {
			q: "espresso",
			ad_type: "67",
		});
		expect(result).not.toContain("ad_type");
	});

	test("excludes params with empty string values", () => {
		const result = assembleQuery("KEY", {
			q: "espresso",
			category: "",
		});
		expect(result).not.toContain("category");
		expect(result).toContain("q=espresso");
	});

	test("URL-encodes special characters", () => {
		const result = assembleQuery("KEY", { q: "kaffe maskin" });
		expect(result).toContain("q=kaffe+maskin");
	});
});
