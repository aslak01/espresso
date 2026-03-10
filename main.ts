import { parseArgs } from "node:util";
import { formatDiscordMsg } from "./src/format.ts";
import { isFinnAd, removeUnwantedAds } from "./src/validation.ts";
import {
	baseUrl,
	blacklist,
	hookUrl,
	params,
	search_key,
	section,
	validSections,
	type Section,
} from "./src/consts.ts";
import { createRateLimitedQueue } from "./src/webhook.ts";
import { readCsv, writeToCsv } from "./src/csv.ts";
import { assembleQuery } from "./src/query_parser.ts";
import { parseAd } from "./src/dynamic_parser.ts";

async function main() {
	const start = performance.now();

	const args = parseArgs({
		args: Bun.argv.slice(2),
		options: {
			i: { type: "string" }, // Input URL
			m: { type: "string" }, // Section
			d: { type: "boolean" }, // Debug flag
			o: { type: "string" }, // Output URL
		},
	});

	const url = args.values.i || baseUrl;
	if (!url) throw new Error("url needs to be defined.");

	const sec = args.values.m || section;
	if (!validSections.includes(sec as Section)) {
		throw new Error(
			`Invalid section "${sec}". Must be one of: ${validSections.join(", ")}`,
		);
	}

	const d = args.values.d;

	const inputUrl = url + assembleQuery(search_key(sec as Section), params);
	console.log(inputUrl);

	d && console.log("Scraping ", inputUrl);

	const outputUrl = args.values.o || hookUrl;

	d && outputUrl && console.log("Publishing to ", outputUrl);

	const escapedQuery = params.q.replace(/[^a-zA-Z0-9_-]/g, "_");

	let seenAds: Record<string, string | undefined>[] = [];
	try {
		seenAds = await readCsv(`./data/${escapedQuery}.csv`);
	} catch (err) {
		console.warn("Failed to read CSV, starting fresh:", err);
	}
	const seenIds = new Set(seenAds.map((ad) => Number(ad.ad_id)));

	const fetchData = await fetch(inputUrl);

	if (!fetchData.ok) {
		throw new Error(`Fetch failed: ${fetchData.status} ${fetchData.statusText}`);
	}

	const fetchJson = await fetchData.json();
	const ads = fetchJson.docs;

	if (!ads || ads.length === 0) {
		console.log("No ads found.");
		return end(start);
	}

	const wellFormedAds = ads.filter(isFinnAd);
	console.log("found", wellFormedAds.length, "ads");

	const wantedAd = removeUnwantedAds(
		seenIds,
		blacklist,
		params.trade_type,
		params.search_key,
		params.ad_type,
	);

	const validatedNewAds = wellFormedAds.filter(wantedAd);

	if (validatedNewAds.length === 0) return end(start);

	console.log("found", validatedNewAds.length, "interesting ads");

	const parsedAds = validatedNewAds.map(parseAd);

	const writeCsv = writeToCsv(parsedAds, `./data/${escapedQuery}.csv`);

	if (outputUrl) {
		const messages = parsedAds.map(formatDiscordMsg);
		const queue = createRateLimitedQueue(outputUrl);
		const sendWebhooks = queue.enqueueBatch(messages);

		await Promise.all([sendWebhooks, writeCsv])
			.then(() => {
				return end(start, parsedAds.length);
			})
			.catch((err) => {
				throw new Error(err);
			});
		return 1;
	}

	await Promise.all([writeCsv])
		.then(() => {
			return end(start, parsedAds.length);
		})
		.catch((err) => {
			throw new Error(err);
		});

	return 1;
}

function end(start: number, processedAds = 0) {
	const finish = performance.now();
	const delta = finish - start;
	console.log(`Processed ${processedAds} lines in ${delta} ms`);

	return 0;
}

main();
