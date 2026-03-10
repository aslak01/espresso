import { writeToCsv, readSeenIds } from "./csv.ts";
import { unlink, writeFile } from "node:fs/promises";
import { test, expect, describe, afterEach } from "bun:test";
import type { Ad } from "./types/index.ts";

const tempFiles: string[] = [];

function tempPath(name: string) {
	const p = `./test_${name}_${Date.now()}.csv`;
	tempFiles.push(p);
	return p;
}

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

afterEach(async () => {
	for (const f of tempFiles) {
		try {
			await unlink(f);
		} catch {}
	}
	tempFiles.length = 0;
});

describe("writeToCsv", () => {
	test("throws on empty data array", () => {
		expect(writeToCsv([], tempPath("empty"))).rejects.toThrow(
			"Data array cannot be empty",
		);
	});

	test("writes headers for a new file", async () => {
		const path = tempPath("new");
		await writeToCsv([makeAd()], path);
		const ids = await readSeenIds(path);
		expect(ids.has(123)).toBe(true);
	});

	test("skips headers when appending to existing file", async () => {
		const path = tempPath("append");
		await writeToCsv([makeAd({ ad_id: 1 })], path);
		await writeToCsv([makeAd({ ad_id: 2 })], path);

		const ids = await readSeenIds(path);
		expect(ids.has(1)).toBe(true);
		expect(ids.has(2)).toBe(true);
		expect(ids.size).toBe(2);
	});

	test("handles values with commas", async () => {
		const path = tempPath("commas");
		await writeToCsv([makeAd({ heading: "Machine, barely used" })], path);
		const ids = await readSeenIds(path);
		expect(ids.has(123)).toBe(true);
	});
});

describe("readSeenIds", () => {
	test("throws for nonexistent file", async () => {
		expect(readSeenIds("./nonexistent_file_xyz.csv")).rejects.toThrow();
	});

	test("returns empty set for empty file", async () => {
		const path = tempPath("emptyfile");
		await writeFile(path, "", "utf-8");
		const ids = await readSeenIds(path);
		expect(ids.size).toBe(0);
	});

	test("returns empty set for whitespace-only file", async () => {
		const path = tempPath("whitespace");
		await writeFile(path, "   \n  \n  ", "utf-8");
		const ids = await readSeenIds(path);
		expect(ids.size).toBe(0);
	});

	test("parses ad_id column into a Set of numbers", async () => {
		const path = tempPath("ids");
		const csv =
			"ad_id,heading,location\n123,Test,Oslo\n456,Test2,Bergen\n";
		await writeFile(path, csv, "utf-8");
		const ids = await readSeenIds(path);
		expect(ids.size).toBe(2);
		expect(ids.has(123)).toBe(true);
		expect(ids.has(456)).toBe(true);
	});

	test("round-trip: written ads can be read back as seen IDs", async () => {
		const path = tempPath("roundtrip");
		await writeToCsv(
			[makeAd({ ad_id: 111 }), makeAd({ ad_id: 222 })],
			path,
		);
		const ids = await readSeenIds(path);
		expect(ids.has(111)).toBe(true);
		expect(ids.has(222)).toBe(true);
	});
});
