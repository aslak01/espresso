import assert from "node:assert";
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
} from "./src/consts.ts";
import { createRateLimitedQueue } from "./src/webhook.ts";
import { readCsv, writeToCsv } from "./src/csv.ts";
import { assembleQuery } from "./src/query_parser.ts";
import { parseAd } from "./src/dynamic_parser.ts";
import type { FinnAd } from "./src/types/quicktype.ts";

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
	assert(url, "url needs to be defined.");

	const sec = args.values.m || section;

	const d = args.values.d;

	const inputUrl = url + assembleQuery(search_key(sec), params);
	console.log(inputUrl);

	d && console.log("Scraping ", inputUrl);

	const outputUrl = args.values.o || hookUrl;

	d && outputUrl && console.log("Publishing to ", outputUrl);

	const escapedQuery = params.q.replace(" ", "_");

	const seenAds = await readCsv(`./data/${escapedQuery}.csv`);
	const seenIds = seenAds.map((ad) => Number(ad.ad_id));

	const fetchData = await fetch(inputUrl);

	assert(fetchData.ok, `fetch failed, ${fetchData.statusText}`);

	const fetchJson = await fetchData.json();
	const ads = fetchJson.docs;

	assert(ads && ads.length > 0, "No ads found.");

	const wellFormedAds = ads.filter(isFinnAd);
	console.log("found", wellFormedAds.length, "ads");

	// SEARCH_ID_BAP_ALL filters away "gis bort"
	// 67 filters for private
	// console.log("seen", seenIds);
	// console.log(
	// 	"found",
	// 	wellFormedAds.map((ad: FinnAd) => ad.id),
	// );

	const wantedAd = removeUnwantedAds(
		seenIds,
		blacklist,
		params.trade_type,
		params.search_key,
		params.ad_type,
	);

	const validatedNewAds = wellFormedAds.filter(wantedAd);
	if (validatedNewAds.length === 0) return end(start);
	console.log("found", validatedNewAds, "interesting ads");

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
