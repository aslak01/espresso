import { writeToCsv, readCsv } from "./csv.ts";
import { unlink, writeFile } from "node:fs/promises";
import { test, expect, describe, afterEach } from "bun:test";

const tempFiles: string[] = [];

function tempPath(name: string) {
	const p = `./test_${name}_${Date.now()}.csv`;
	tempFiles.push(p);
	return p;
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
		await writeToCsv([{ name: "Alice", age: 30 }], path);
		const result = await readCsv(path);
		expect(result).toEqual([{ name: "Alice", age: "30" }]);
	});

	test("skips headers when appending to existing file", async () => {
		const path = tempPath("append");
		await writeToCsv([{ name: "Alice", age: 30 }], path);
		await writeToCsv([{ name: "Bob", age: 25 }], path);

		const result = await readCsv(path);
		expect(result).toHaveLength(2);
		expect(result[0].name).toBe("Alice");
		expect(result[1].name).toBe("Bob");
	});

	test("handles values with commas", async () => {
		const path = tempPath("commas");
		await writeToCsv([{ heading: "Machine, barely used", price: 500 }], path);
		const result = await readCsv(path);
		expect(result[0].heading).toBe("Machine, barely used");
	});
});

describe("readCsv", () => {
	test("throws for nonexistent file", async () => {
		expect(readCsv("./nonexistent_file_xyz.csv")).rejects.toThrow();
	});

	test("returns empty array for empty file", async () => {
		const path = tempPath("emptyfile");
		await writeFile(path, "", "utf-8");
		const result = await readCsv(path);
		expect(result).toEqual([]);
	});

	test("returns empty array for whitespace-only file", async () => {
		const path = tempPath("whitespace");
		await writeFile(path, "   \n  \n  ", "utf-8");
		const result = await readCsv(path);
		expect(result).toEqual([]);
	});

	test("handles rows with inconsistent column counts", async () => {
		const path = tempPath("relaxed");
		const csv = "a,b,c\n1,2,3\n4,5\n";
		await writeFile(path, csv, "utf-8");
		const result = await readCsv(path);
		expect(result).toHaveLength(2);
		expect(result[0]).toEqual({ a: "1", b: "2", c: "3" });
		expect(result[1].a).toBe("4");
		expect(result[1].b).toBe("5");
	});

	test("round-trip preserves data", async () => {
		const path = tempPath("roundtrip");
		const data = [
			{ name: "Alice", age: 30 },
			{ name: "Bob", age: 25 },
		];
		await writeToCsv(data, path);
		const result = await readCsv(path);
		const expected = data.map((row) =>
			Object.fromEntries(
				Object.entries(row).map(([key, value]) => [key, String(value)]),
			),
		);
		expect(result).toEqual(expected);
	});
});
