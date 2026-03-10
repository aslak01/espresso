import { test, expect, describe } from "bun:test";
import { parseAd } from "./dynamic_parser.ts";

// parseAd uses the config.json keepList:
// ["ad_id", "heading", "location", "timestamp", "price.amount",
//  "coordinates.lat", "coordinates.lon", "canonical_url", "image.url"]

function makeRawAd(overrides: Record<string, unknown> = {}) {
	return {
		ad_id: 12345,
		heading: "Espresso Machine",
		location: "Oslo",
		timestamp: 1714481940000,
		price: { amount: 500, currency_code: "NOK" },
		coordinates: { lat: 59.9, lon: 10.7 },
		canonical_url: "https://www.finn.no/bap/forsale/ad.html?finnkode=12345",
		image: {
			url: "https://images.finncdn.no/img.jpg",
			path: "/img.jpg",
			height: 300,
			width: 300,
		},
		trade_type: "Til salgs",
		...overrides,
	} as Record<string, string | number | object>;
}

describe("parseAd", () => {
	test("extracts flat keys", () => {
		const result = parseAd(makeRawAd());
		expect(result.ad_id).toBe(12345);
		expect(result.heading).toBe("Espresso Machine");
		expect(result.location).toBe("Oslo");
		expect(result.canonical_url).toBe(
			"https://www.finn.no/bap/forsale/ad.html?finnkode=12345",
		);
	});

	test("extracts nested price.amount", () => {
		const result = parseAd(makeRawAd());
		expect(result.amount).toBe(500);
	});

	test("extracts nested coordinates.lat and coordinates.lon", () => {
		const result = parseAd(makeRawAd());
		expect(result.lat).toBe(59.9);
		expect(result.lon).toBe(10.7);
	});

	test("timestamp special handling adds both timestamp and date", () => {
		const result = parseAd(makeRawAd());
		expect(result.timestamp).toBe(1714481940000);
		expect(typeof result.date).toBe("string");
		expect(result.date).toBeTruthy();
	});

	test("image.url maps to image key", () => {
		const result = parseAd(makeRawAd());
		expect(result.image).toBe("https://images.finncdn.no/img.jpg");
	});

	test("missing nested key returns undefined (no crash)", () => {
		const ad = makeRawAd({ price: {} });
		const result = parseAd(ad);
		// price.amount missing, should not be in result
		expect(result.amount).toBeUndefined();
	});

	test("missing top-level key is skipped", () => {
		const { canonical_url, ...rest } = makeRawAd();
		const result = parseAd(rest as Record<string, string | number | object>);
		expect(result.canonical_url).toBeUndefined();
	});

	test("preserves commas in string values", () => {
		const result = parseAd(makeRawAd({ heading: "Machine, barely used" }));
		expect(result.heading).toBe("Machine, barely used");
	});
});
