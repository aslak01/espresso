import { parseArgs } from "node:util";
import { formatDiscordMsg } from "./src/format.ts";
import { parseFinnAd, removeUnwantedAds } from "./src/validation.ts";
import {
	blacklist,
	hookUrl,
	params,
	search_key,
	validSections,
	section,
	type Section,
} from "./src/consts.ts";
import { createRateLimitedQueue } from "./src/webhook.ts";
import { readSeenIds, writeToCsv } from "./src/csv.ts";
import { buildSearchUrl } from "./src/query_parser.ts";
import { parseAd } from "./src/dynamic_parser.ts";

type CliArgs = {
	inputUrl: string | undefined;
	section: Section;
	debug: boolean;
	webhookUrl: string | undefined;
};

function parseCliArgs(): CliArgs {
	const args = parseArgs({
		args: Bun.argv.slice(2),
		options: {
			i: { type: "string" }, // Input URL
			m: { type: "string" }, // Section
			d: { type: "boolean" }, // Debug flag
			o: { type: "string" }, // Output URL
		},
	});

	const inputUrl = args.values.i;

	const sec = args.values.m || section;
	if (!validSections.includes(sec as Section)) {
		throw new Error(
			`Invalid section "${sec}". Must be one of: ${validSections.join(", ")}`,
		);
	}

	return {
		inputUrl,
		section: sec as Section,
		debug: args.values.d ?? false,
		webhookUrl: args.values.o || hookUrl,
	};
}

async function main() {
	const start = performance.now();

	const cli = parseCliArgs();

	const queryUrl =
		cli.inputUrl ??
		buildSearchUrl(cli.section, search_key(cli.section), params);
	console.log(queryUrl);

	cli.debug && console.log("Scraping ", queryUrl);
	cli.debug && cli.webhookUrl && console.log("Publishing to ", cli.webhookUrl);

	const escapedQuery = params.q.replace(/[^a-zA-Z0-9_-]/g, "_");
	const csvPath = `./data/${escapedQuery}.csv`;

	// --- Boundary: CSV file ---
	let seenIds = new Set<number>();
	try {
		seenIds = await readSeenIds(csvPath);
	} catch (err) {
		console.warn("Failed to read CSV, starting fresh:", err);
	}

	// --- Boundary: finn.no API ---
	const fetchData = await fetchWithRetry(queryUrl);
	const fetchJson = await fetchData.json();
	const rawDocs: unknown[] = fetchJson.docs ?? [];

	// Parse at boundary: unknown[] → FinnAd[]
	const ads = rawDocs
		.map(parseFinnAd)
		.filter((ad) => ad !== null);

	if (ads.length === 0) {
		console.log("No ads found.");
		return end(start);
	}

	console.log("found", ads.length, "ads");

	// --- Core: typed data flows through, no more runtime checks ---
	const wantedAd = removeUnwantedAds(
		seenIds,
		blacklist,
		params.trade_type,
		params.search_key,
		params.ad_type,
	);

	const newAds = ads.filter(wantedAd);

	if (newAds.length === 0) return end(start);

	console.log("found", newAds.length, "interesting ads");

	// FinnAd[] → Ad[] (typed mapping, no runtime checks)
	const parsedAds = newAds.map(parseAd);

	// --- Boundary: CSV write + webhook ---
	const writeCsv = writeToCsv(parsedAds, csvPath);

	if (cli.webhookUrl) {
		const messages = parsedAds.map(formatDiscordMsg);
		const queue = createRateLimitedQueue(cli.webhookUrl);
		const sendWebhooks = queue.enqueueBatch(messages);

		await Promise.all([sendWebhooks, writeCsv])
			.then(() => end(start, parsedAds.length))
			.catch((err) => {
				throw new Error(err);
			});
		return 1;
	}

	await Promise.all([writeCsv])
		.then(() => end(start, parsedAds.length))
		.catch((err) => {
			throw new Error(err);
		});

	return 1;
}

async function fetchWithRetry(
	url: string,
	maxRetries = 3,
	baseDelay = 1000,
): Promise<Response> {
	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		const response = await fetch(url);
		if (response.ok) return response;

		if (attempt === maxRetries) {
			throw new Error(
				`Fetch failed after ${maxRetries + 1} attempts: ${response.status} ${response.statusText}`,
			);
		}

		const delay = baseDelay * 2 ** attempt;
		console.warn(
			`Fetch attempt ${attempt + 1} failed (${response.status}), retrying in ${delay}ms...`,
		);
		await new Promise((resolve) => setTimeout(resolve, delay));
	}

	throw new Error("Unreachable");
}

function end(start: number, processedAds = 0) {
	const finish = performance.now();
	const delta = finish - start;
	console.log(`Processed ${processedAds} lines in ${delta} ms`);

	return 0;
}

main();
