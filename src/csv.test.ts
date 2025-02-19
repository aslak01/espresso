import { writeToCsv, readCsv } from "./csv.ts";
import { unlink } from "node:fs/promises";
import { test } from "bun:test";

test("writeToCsv and readCsv functions work correctly", async () => {
	const filePath = "./test.csv";

	// Clean up the test file if it exists
	try {
		await unlink(filePath);
	} catch {
		// Ignore if the file doesn't exist
	}

	const testData = [
		{ name: "Alice", age: 30 },
		{ name: "Bob", age: 25 },
	];

	// Write CSV data
	await writeToCsv(testData, filePath);

	// Read CSV data
	const result = await readCsv(filePath);

	// CSV parser returns all values as strings,
	// so we convert our expected data accordingly.
	const expected = testData.map((row) =>
		Object.fromEntries(
			Object.entries(row).map(([key, value]) => [key, String(value)]),
		),
	);

	// Clean up the test file after the test
	await unlink(filePath);

	if (JSON.stringify(result) !== JSON.stringify(expected)) {
		throw new Error(
			`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(result)}`,
		);
	}
});
