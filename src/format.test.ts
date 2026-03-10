import { test, expect, describe } from "bun:test";
import { formatDiscordMsg } from "./format.ts";
import type { Ad } from "./types/index.ts";

function makeAd(overrides: Partial<Ad> = {}): Ad {
	return {
		ad_id: 123,
		heading: "Espresso Machine",
		location: "Oslo",
		timestamp: 1714481940000,
		date: "30.04.24",
		amount: 500,
		lat: 59.9,
		lon: 10.7,
		canonical_url: "https://www.finn.no/bap/forsale/ad.html?finnkode=123",
		image: "https://img.example.com/1",
		...overrides,
	};
}

describe("formatDiscordMsg", () => {
	test("formats ad with markdown bold heading and amount", () => {
		const result = formatDiscordMsg(makeAd());
		expect(result.content).toBe(
			"**Espresso Machine**, Oslo: **500**\nhttps://www.finn.no/bap/forsale/ad.html?finnkode=123",
		);
	});

	test("includes location between heading and amount", () => {
		const result = formatDiscordMsg(makeAd({ location: "Bergen" }));
		expect(result.content).toContain("Bergen:");
	});

	test("includes canonical_url on second line", () => {
		const result = formatDiscordMsg(makeAd());
		const lines = result.content.split("\n");
		expect(lines).toHaveLength(2);
		expect(lines[1]).toBe(
			"https://www.finn.no/bap/forsale/ad.html?finnkode=123",
		);
	});

	test("returns object with content field (DiscordMessage shape)", () => {
		const result = formatDiscordMsg(makeAd());
		expect(result).toHaveProperty("content");
		expect(typeof result.content).toBe("string");
	});
});
