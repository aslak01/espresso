import { test, expect, describe } from "bun:test";
import { formatDiscordMsg } from "./format.ts";

describe("formatDiscordMsg", () => {
	test("formats a complete ad with markdown", () => {
		const result = formatDiscordMsg({
			heading: "Espresso Machine",
			location: "Oslo",
			amount: 500,
			canonical_url: "https://www.finn.no/bap/forsale/ad.html?finnkode=123",
		});
		expect(result.content).toBe(
			"**Espresso Machine**, Oslo: **500**\nhttps://www.finn.no/bap/forsale/ad.html?finnkode=123",
		);
	});

	test("falls back to Unknown for missing heading", () => {
		const result = formatDiscordMsg({ location: "Oslo", amount: 500 });
		expect(result.content).toContain("**Unknown**,");
	});

	test("falls back to Unknown for missing location", () => {
		const result = formatDiscordMsg({ heading: "Test", amount: 500 });
		expect(result.content).toContain("Unknown:");
	});

	test("falls back to N/A for missing amount", () => {
		const result = formatDiscordMsg({ heading: "Test", location: "Oslo" });
		expect(result.content).toContain("**N/A**");
	});

	test("falls back to empty string for missing canonical_url", () => {
		const result = formatDiscordMsg({
			heading: "Test",
			location: "Oslo",
			amount: 100,
		});
		expect(result.content).toEndWith("\n");
	});
});
