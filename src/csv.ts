import { parse, stringify } from "csv";
import { appendFile, stat, readFile } from "node:fs/promises";

export async function writeToCsv(
	data: Record<string, string | number>[],
	filePath: string,
): Promise<number> {
	if (!data.length) throw new Error("Data array cannot be empty");

	const columns = Object.keys(data[0]);
	let headers = false;

	try {
		const fileInfo = await stat(filePath);
		// write headers if file is tiny
		headers = fileInfo.size < 10;
	} catch {
		// File doesn't exist, write headers
		headers = true;
	}

	try {
		const csvData: string = await new Promise((resolve, reject) => {
			stringify(data, { header: headers, columns }, (err, output) => {
				if (err) reject(err);
				else resolve(output);
			});
		});

		await appendFile(filePath, csvData);
		return 0;
	} catch (error) {
		console.error("Error writing to CSV:", error);
		throw error;
	}
}

export async function readCsv(
	filePath: string,
): Promise<Record<string, string | undefined>[]> {
	try {
		const stats = await stat(filePath);
		if (!stats.isFile()) {
			return [];
		}

		const csvText = await readFile(filePath, "utf-8");

		if (!csvText || csvText.trim().length === 0) {
			return [];
		}

		const parsedData = await new Promise<Record<string, string>[]>(
			(resolve, reject) => {
				parse(
					csvText,
					{
						columns: true,
						skip_empty_lines: true,
						// allow rows with inconsistent column counts
						relax_column_count: true,
					},
					(err, data) => {
						if (err) {
							reject(err);
						} else {
							resolve(data);
						}
					},
				);
			},
		);

		return parsedData;
	} catch (error) {
		console.error("Error reading or parsing csv file:", error);
		throw error;
	}
}
