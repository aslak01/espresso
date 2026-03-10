import { test, expect, describe } from "bun:test";
import {
	isFinnAd,
	removeUnwantedAds,
	noneIncluded,
	stripDiacritics,
	stripPunctuation,
} from "./validation.ts";
import type { FinnAd } from "./types/quicktype.ts";

function makeFinnAd(overrides: Partial<FinnAd> = {}): FinnAd {
	return {
		type: "bap",
		id: "123",
		main_search_key: "SEARCH_ID_BAP_ALL",
		heading: "Espresso Machine",
		location: "Oslo",
		image: {
			url: "https://img.example.com/1",
			path: "https://img.example.com/1",
			height: 300,
			width: 300,
			aspect_ratio: 1,
		},
		flags: [],
		timestamp: 1714481940000,
		coordinates: { lat: 59.9, lon: 10.7 },
		ad_type: 67,
		labels: [],
		canonical_url: "https://www.finn.no/bap/forsale/ad.html?finnkode=123",
		extras: [],
		price: { amount: 500, currency_code: "NOK", price_unit: "kr" },
		distance: 0,
		trade_type: "Til salgs",
		image_urls: ["https://img.example.com/1"],
		ad_id: 123,
		organisation_name: "Test",
		...overrides,
	};
}

// --- isFinnAd ---

describe("isFinnAd", () => {
	test("accepts a valid ad with string id", () => {
		const ad = makeFinnAd();
		expect(isFinnAd(ad)).toBe(true);
	});

	test("accepts a valid ad with only ad_id (number)", () => {
		const { id, ...rest } = makeFinnAd();
		expect(isFinnAd(rest)).toBe(true);
	});

	test("rejects null", () => {
		expect(isFinnAd(null)).toBe(false);
	});

	test("rejects undefined", () => {
		expect(isFinnAd(undefined)).toBe(false);
	});

	test("rejects primitives", () => {
		expect(isFinnAd("string")).toBe(false);
		expect(isFinnAd(42)).toBe(false);
		expect(isFinnAd(true)).toBe(false);
	});

	test("rejects empty object", () => {
		expect(isFinnAd({})).toBe(false);
	});

	test("rejects object missing heading", () => {
		const { heading, ...rest } = makeFinnAd();
		expect(isFinnAd(rest)).toBe(false);
	});

	test("rejects object missing location", () => {
		const { location, ...rest } = makeFinnAd();
		expect(isFinnAd(rest)).toBe(false);
	});

	test("rejects object missing timestamp", () => {
		const { timestamp, ...rest } = makeFinnAd();
		expect(isFinnAd(rest)).toBe(false);
	});

	test("rejects object missing trade_type", () => {
		const { trade_type, ...rest } = makeFinnAd();
		expect(isFinnAd(rest)).toBe(false);
	});

	test("rejects object missing image", () => {
		const { image, ...rest } = makeFinnAd();
		expect(isFinnAd(rest)).toBe(false);
	});

	test("rejects object missing price", () => {
		const { price, ...rest } = makeFinnAd();
		expect(isFinnAd(rest)).toBe(false);
	});

	test("rejects when heading is not a string", () => {
		expect(isFinnAd({ ...makeFinnAd(), heading: 123 })).toBe(false);
	});

	test("rejects when timestamp is not a number", () => {
		expect(isFinnAd({ ...makeFinnAd(), timestamp: "not a number" })).toBe(
			false,
		);
	});

	test("rejects object with neither id nor ad_id", () => {
		const { id, ad_id, ...rest } = makeFinnAd();
		expect(isFinnAd(rest)).toBe(false);
	});
});

// --- noneIncluded ---

describe("noneIncluded", () => {
	test("returns true when blacklist is empty", () => {
		expect(noneIncluded([], ["espresso", "machine"])).toBe(true);
	});

	test("returns true when words is empty", () => {
		expect(noneIncluded(["pod", "kapsel"], [])).toBe(true);
	});

	test("returns true when both are empty", () => {
		expect(noneIncluded([], [])).toBe(true);
	});

	test("returns true when no blacklist words match", () => {
		expect(noneIncluded(["pod", "kapsel"], ["espresso", "machine"])).toBe(
			true,
		);
	});

	test("returns false when a blacklist word matches", () => {
		expect(noneIncluded(["pod", "kapsel"], ["espresso", "pod"])).toBe(false);
	});

	test("uses exact matching, not substring", () => {
		// "pod" should NOT match "tripod"
		expect(noneIncluded(["pod"], ["tripod"])).toBe(true);
	});

	test("is case sensitive", () => {
		expect(noneIncluded(["Pod"], ["pod"])).toBe(true);
		expect(noneIncluded(["pod"], ["Pod"])).toBe(true);
	});
});

// --- stripDiacritics ---

describe("stripDiacritics", () => {
	test("strips å (decomposes under NFD)", () => {
		expect(stripDiacritics("blå")).toBe("bla");
	});

	test("does not strip ø (does not decompose under NFD)", () => {
		// ø is a standalone character, not a composed diacritic
		expect(stripDiacritics("grønn")).toBe("grønn");
	});

	test("strips accented characters", () => {
		expect(stripDiacritics("café")).toBe("cafe");
		expect(stripDiacritics("naïve")).toBe("naive");
		expect(stripDiacritics("über")).toBe("uber");
	});

	test("leaves plain ASCII unchanged", () => {
		expect(stripDiacritics("espresso")).toBe("espresso");
	});

	test("handles empty string", () => {
		expect(stripDiacritics("")).toBe("");
	});
});

// --- stripPunctuation ---

describe("stripPunctuation", () => {
	test("removes common punctuation", () => {
		expect(stripPunctuation("hello, world!")).toBe("hello world");
		expect(stripPunctuation("price: 500kr.")).toBe("price 500kr");
	});

	test("removes underscores", () => {
		expect(stripPunctuation("some_thing")).toBe("something");
	});

	test("preserves spaces and alphanumeric", () => {
		expect(stripPunctuation("espresso machine 2024")).toBe(
			"espresso machine 2024",
		);
	});

	test("handles empty string", () => {
		expect(stripPunctuation("")).toBe("");
	});
});

// --- removeUnwantedAds ---

describe("removeUnwantedAds", () => {
	const defaultFilter = (overrides: Partial<Parameters<typeof removeUnwantedAds>> = {}) =>
		removeUnwantedAds(
			overrides[0] ?? new Set<number>(),
			overrides[1] ?? [],
			overrides[2] ?? "Til salgs",
			overrides[3] ?? "SEARCH_ID_BAP_ALL",
			overrides[4] ?? "67",
		);

	test("rejects ads already in seenIds", () => {
		const filter = defaultFilter([new Set([123])]);
		expect(filter(makeFinnAd({ ad_id: 123 }))).toBe(false);
	});

	test("accepts new ads matching all criteria", () => {
		const filter = defaultFilter();
		expect(filter(makeFinnAd())).toBe(true);
	});

	test("rejects ads with mismatched trade_type", () => {
		const filter = defaultFilter();
		expect(filter(makeFinnAd({ trade_type: "Gis bort" }))).toBe(false);
	});

	test("rejects ads with mismatched main_search_key", () => {
		const filter = defaultFilter();
		expect(filter(makeFinnAd({ main_search_key: "SEARCH_ID_OTHER" }))).toBe(
			false,
		);
	});

	test("rejects ads with mismatched ad_type", () => {
		const filter = defaultFilter();
		expect(filter(makeFinnAd({ ad_type: 99 }))).toBe(false);
	});

	test("rejects ads with blacklisted word in heading", () => {
		const filter = removeUnwantedAds(
			new Set(),
			["nespresso"],
			"Til salgs",
			"SEARCH_ID_BAP_ALL",
			"67",
		);
		expect(filter(makeFinnAd({ heading: "Nespresso maskin" }))).toBe(false);
	});

	test("blacklist does not match substrings", () => {
		const filter = removeUnwantedAds(
			new Set(),
			["pod"],
			"Til salgs",
			"SEARCH_ID_BAP_ALL",
			"67",
		);
		// "tripod" contains "pod" but should NOT be filtered
		expect(filter(makeFinnAd({ heading: "Tripod stand" }))).toBe(true);
	});

	test("stripPunctuation removes non-ASCII before diacritics normalization", () => {
		// Note: stripPunctuation uses \w which is ASCII-only, so non-ASCII
		// letters like é, å, ø are stripped as "punctuation" before
		// stripDiacritics can normalize them. "Café" becomes "Caf", not "cafe".
		const filter = removeUnwantedAds(
			new Set(),
			["caf"],
			"Til salgs",
			"SEARCH_ID_BAP_ALL",
			"67",
		);
		expect(filter(makeFinnAd({ heading: "Café maskin" }))).toBe(false);
	});

	test("handles headings with punctuation", () => {
		const filter = removeUnwantedAds(
			new Set(),
			["espresso"],
			"Til salgs",
			"SEARCH_ID_BAP_ALL",
			"67",
		);
		expect(filter(makeFinnAd({ heading: "Espresso!!" }))).toBe(false);
	});
});
