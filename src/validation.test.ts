import { test, expect, describe } from "bun:test";
import {
	parseFinnAd,
	removeUnwantedAds,
	noneIncluded,
	stripDiacritics,
	stripPunctuation,
} from "./validation.ts";
import type { FinnAd } from "./schema.ts";

function makeFinnAd(overrides: Partial<FinnAd> = {}): FinnAd {
	return {
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
		timestamp: 1714481940000,
		coordinates: { lat: 59.9, lon: 10.7 },
		ad_type: 67,
		canonical_url: "https://www.finn.no/bap/forsale/ad.html?finnkode=123",
		price: { amount: 500, currency_code: "NOK", price_unit: "kr" },
		trade_type: "Til salgs",
		ad_id: 123,
		...overrides,
	};
}

// --- parseFinnAd ---

describe("parseFinnAd", () => {
	test("parses a valid ad with string id", () => {
		const ad = makeFinnAd();
		const result = parseFinnAd(ad);
		expect(result).not.toBeNull();
		expect(result!.heading).toBe("Espresso Machine");
	});

	test("parses a valid ad with only ad_id (number)", () => {
		const { id, ...rest } = makeFinnAd();
		expect(parseFinnAd(rest)).not.toBeNull();
	});

	test("returns null for null", () => {
		expect(parseFinnAd(null)).toBeNull();
	});

	test("returns null for undefined", () => {
		expect(parseFinnAd(undefined)).toBeNull();
	});

	test("returns null for primitives", () => {
		expect(parseFinnAd("string")).toBeNull();
		expect(parseFinnAd(42)).toBeNull();
		expect(parseFinnAd(true)).toBeNull();
	});

	test("returns null for empty object", () => {
		expect(parseFinnAd({})).toBeNull();
	});

	test("returns null for object missing heading", () => {
		const { heading, ...rest } = makeFinnAd();
		expect(parseFinnAd(rest)).toBeNull();
	});

	test("returns null for object missing location", () => {
		const { location, ...rest } = makeFinnAd();
		expect(parseFinnAd(rest)).toBeNull();
	});

	test("returns null for object missing timestamp", () => {
		const { timestamp, ...rest } = makeFinnAd();
		expect(parseFinnAd(rest)).toBeNull();
	});

	test("returns null for object missing trade_type", () => {
		const { trade_type, ...rest } = makeFinnAd();
		expect(parseFinnAd(rest)).toBeNull();
	});

	test("returns null for object missing image", () => {
		const { image, ...rest } = makeFinnAd();
		expect(parseFinnAd(rest)).toBeNull();
	});

	test("returns null for object missing price", () => {
		const { price, ...rest } = makeFinnAd();
		expect(parseFinnAd(rest)).toBeNull();
	});

	test("returns null when heading is not a string", () => {
		expect(parseFinnAd({ ...makeFinnAd(), heading: 123 })).toBeNull();
	});

	test("returns null when timestamp is not a number", () => {
		expect(
			parseFinnAd({ ...makeFinnAd(), timestamp: "not a number" }),
		).toBeNull();
	});

	test("returns null when price.amount is missing", () => {
		expect(parseFinnAd({ ...makeFinnAd(), price: {} })).toBeNull();
	});

	test("returns null when coordinates.lat is missing", () => {
		expect(parseFinnAd({ ...makeFinnAd(), coordinates: { lon: 10.7 } })).toBeNull();
	});

	test("returns null when image.url is missing", () => {
		expect(parseFinnAd({ ...makeFinnAd(), image: { path: "/x" } })).toBeNull();
	});

	test("returns null when ad_id is not a number", () => {
		expect(parseFinnAd({ ...makeFinnAd(), ad_id: "string" })).toBeNull();
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
	test("rejects ads already in seenIds", () => {
		const filter = removeUnwantedAds(
			new Set([123]),
			[],
			"Til salgs",
			"SEARCH_ID_BAP_ALL",
			"67",
		);
		expect(filter(makeFinnAd({ ad_id: 123 }))).toBe(false);
	});

	test("accepts new ads matching all criteria", () => {
		const filter = removeUnwantedAds(
			new Set(),
			[],
			"Til salgs",
			"SEARCH_ID_BAP_ALL",
			"67",
		);
		expect(filter(makeFinnAd())).toBe(true);
	});

	test("rejects ads with mismatched trade_type", () => {
		const filter = removeUnwantedAds(
			new Set(),
			[],
			"Til salgs",
			"SEARCH_ID_BAP_ALL",
			"67",
		);
		expect(filter(makeFinnAd({ trade_type: "Gis bort" }))).toBe(false);
	});

	test("rejects ads with mismatched main_search_key", () => {
		const filter = removeUnwantedAds(
			new Set(),
			[],
			"Til salgs",
			"SEARCH_ID_BAP_ALL",
			"67",
		);
		expect(filter(makeFinnAd({ main_search_key: "SEARCH_ID_OTHER" }))).toBe(
			false,
		);
	});

	test("rejects ads with mismatched ad_type", () => {
		const filter = removeUnwantedAds(
			new Set(),
			[],
			"Til salgs",
			"SEARCH_ID_BAP_ALL",
			"67",
		);
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
		expect(filter(makeFinnAd({ heading: "Tripod stand" }))).toBe(true);
	});

	test("stripPunctuation removes non-ASCII before diacritics normalization", () => {
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
