import { test, expect, describe } from "bun:test";
import { parseAd } from "./dynamic_parser.ts";
import type { FinnAd } from "./schema.ts";

function makeFinnAd(overrides: Partial<FinnAd> = {}): FinnAd {
	return {
		id: "12345",
		main_search_key: "SEARCH_ID_BAP_ALL",
		heading: "Espresso Machine",
		location: "Oslo",
		image: {
			url: "https://images.finncdn.no/img.jpg",
			path: "/img.jpg",
			height: 300,
			width: 300,
			aspect_ratio: 1,
		},
		timestamp: 1714481940000,
		coordinates: { lat: 59.9, lon: 10.7 },
		ad_type: 67,
		canonical_url: "https://www.finn.no/bap/forsale/ad.html?finnkode=12345",
		price: { amount: 500, currency_code: "NOK", price_unit: "kr" },
		trade_type: "Til salgs",
		ad_id: 12345,
		...overrides,
	};
}

describe("parseAd", () => {
	test("maps flat fields from FinnAd to Ad", () => {
		const result = parseAd(makeFinnAd());
		expect(result.ad_id).toBe(12345);
		expect(result.heading).toBe("Espresso Machine");
		expect(result.location).toBe("Oslo");
		expect(result.canonical_url).toBe(
			"https://www.finn.no/bap/forsale/ad.html?finnkode=12345",
		);
	});

	test("extracts price.amount into amount", () => {
		const result = parseAd(makeFinnAd());
		expect(result.amount).toBe(500);
	});

	test("extracts coordinates into lat/lon", () => {
		const result = parseAd(makeFinnAd());
		expect(result.lat).toBe(59.9);
		expect(result.lon).toBe(10.7);
	});

	test("adds both timestamp and formatted date", () => {
		const result = parseAd(makeFinnAd());
		expect(result.timestamp).toBe(1714481940000);
		expect(typeof result.date).toBe("string");
		expect(result.date).toBeTruthy();
	});

	test("extracts image.url into image", () => {
		const result = parseAd(makeFinnAd());
		expect(result.image).toBe("https://images.finncdn.no/img.jpg");
	});

	test("preserves commas in string values", () => {
		const result = parseAd(makeFinnAd({ heading: "Machine, barely used" }));
		expect(result.heading).toBe("Machine, barely used");
	});

	test("returns all fields of Ad type", () => {
		const result = parseAd(makeFinnAd());
		expect(result).toHaveProperty("ad_id");
		expect(result).toHaveProperty("heading");
		expect(result).toHaveProperty("location");
		expect(result).toHaveProperty("timestamp");
		expect(result).toHaveProperty("date");
		expect(result).toHaveProperty("amount");
		expect(result).toHaveProperty("lat");
		expect(result).toHaveProperty("lon");
		expect(result).toHaveProperty("canonical_url");
		expect(result).toHaveProperty("image");
	});
});
