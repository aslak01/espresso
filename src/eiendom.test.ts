import { test, expect, describe } from "bun:test";
import { extractEiendomDocs } from "./eiendom.ts";
import { parseFinnAd } from "./validation.ts";
import fixture from "./__fixtures__/eiendom_search.data.json" with {
	type: "json",
};

describe("extractEiendomDocs", () => {
	test("pulls docs out of a real finn.no realestate response", () => {
		const docs = extractEiendomDocs(fixture);
		expect(docs.length).toBeGreaterThan(0);
		const first = docs[0] as Record<string, unknown>;
		expect(first.ad_id).toBeNumber();
		expect(first.heading).toBeString();
		expect(first.canonical_url).toBeString();
	});

	test("synthesises trade_type when missing on source doc", () => {
		const docs = extractEiendomDocs(fixture) as Array<Record<string, unknown>>;
		// Realestate ads don't carry trade_type; we default it so the existing
		// validation pipeline (which requires it) accepts them.
		expect(docs.every((d) => d.trade_type === "Til salgs")).toBe(true);
	});

	test("maps price_suggestion to price for schema compatibility", () => {
		const docs = extractEiendomDocs(fixture) as Array<Record<string, unknown>>;
		const withPrice = docs.find((d) => d.price);
		expect(withPrice).toBeDefined();
		const price = withPrice?.price as { amount: number };
		expect(price.amount).toBeGreaterThan(0);
	});

	test("normalised docs decode through the existing FinnAd schema", () => {
		const docs = extractEiendomDocs(fixture);
		const parsed = docs.map(parseFinnAd).filter((ad) => ad !== null);
		expect(parsed.length).toBeGreaterThan(0);
	});

	test("rejects non-array input", () => {
		expect(() => extractEiendomDocs({} as unknown)).toThrow(
			/not a JSON array/,
		);
	});

	test("throws when expected route key is missing", () => {
		// A valid turbo-stream encoding of {} — root is empty object at idx 0
		expect(() => extractEiendomDocs([{}])).toThrow(/Could not locate docs/);
	});
});
