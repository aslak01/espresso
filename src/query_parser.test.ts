import { test, expect, describe } from "bun:test";
import { buildSearchUrl } from "./query_parser.ts";

describe("buildSearchUrl", () => {
	test("non-job: includes searchkey and vertical=bap", () => {
		const result = buildSearchUrl("torget", "SEARCH_ID_BAP_COMMON", {});
		expect(result).toContain("searchkey=SEARCH_ID_BAP_COMMON");
		expect(result).toContain("vertical=bap");
		expect(result).toStartWith("https://www.finn.no/api/search-qf?");
	});

	test("non-job: includes normal params", () => {
		const result = buildSearchUrl("torget", "SEARCH_ID_BAP_COMMON", {
			q: "espresso",
			radius: "30000",
		});
		expect(result).toContain("q=espresso");
		expect(result).toContain("radius=30000");
	});

	test("excludes trade_type param", () => {
		const result = buildSearchUrl("torget", "KEY", {
			q: "espresso",
			trade_type: "Til salgs",
		});
		expect(result).not.toContain("trade_type");
		expect(result).toContain("q=espresso");
	});

	test("excludes ad_type param", () => {
		const result = buildSearchUrl("torget", "KEY", {
			q: "espresso",
			ad_type: "67",
		});
		expect(result).not.toContain("ad_type");
	});

	test("excludes params with empty string values", () => {
		const result = buildSearchUrl("torget", "KEY", {
			q: "espresso",
			category: "",
		});
		expect(result).not.toContain("category");
		expect(result).toContain("q=espresso");
	});

	test("URL-encodes special characters", () => {
		const result = buildSearchUrl("torget", "KEY", { q: "kaffe maskin" });
		expect(result).toContain("q=kaffe+maskin");
	});

	test("jobb: uses new job search endpoint with searchkey in path", () => {
		const result = buildSearchUrl("jobb", "SEARCH_ID_JOB_FULLTIME", {
			q: "utvikler",
			location: "1.20001.20061",
		});
		expect(result).toStartWith(
			"https://www.finn.no/job/job-search-page/api/search/SEARCH_ID_JOB_FULLTIME?",
		);
		expect(result).toContain("q=utvikler");
		expect(result).toContain("location=1.20001.20061");
		expect(result).not.toContain("vertical=");
		expect(result).not.toContain("searchkey=");
	});
});
