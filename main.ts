import { assert } from "jsr:@std/assert/assert";
import { parseArgs } from "jsr:@std/cli/parse-args";
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

// Learn more at https://deno.land/manual/examples/module_metadata#concepts
// TODO: Learn that
if (import.meta.main) {
  await main();
}

async function main() {
  const start = performance.now();

  const args = parseArgs(Deno.args);

  const url = args.i || baseUrl;
  assert(url, "url needs to be defined.");

  const sec = args.m || section;

  const d = args.d;

  const inputUrl = url +
    assembleQuery(
      search_key(sec),
      params,
    );

  d && console.log("Scraping ", inputUrl);

  const outputUrl = args.o || hookUrl;

  d && outputUrl && console.log("Publishing to ", outputUrl);

  const escapedQuery = params.q.replace(" ", "_");

  const seenAds = await readCsv(`./data/${escapedQuery}.csv`);
  const seenIds = seenAds.map((ad) => Number(ad.ad_id));

  const fetchData = await fetch(inputUrl);
  const fetchJson = await fetchData.json();
  const ads = fetchJson.docs;

  assert(ads.length > 0, "No ads found.");

  const wellFormedAds = ads.filter(isFinnAd);
  console.log("found", wellFormedAds.length, "ads");

  // SEARCH_ID_BAP_ALL filters away "gis bort"
  // 67 filters for private
  const wantedAd = removeUnwantedAds(
    seenIds,
    blacklist,
    "Til salgs",
    "SEARCH_ID_BAP_ALL",
    67,
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

    await Promise.all([sendWebhooks, writeCsv]).then(() => {
      return end(start, parsedAds.length);
    }).catch((err) => {
      throw new Error(err);
    });
    return 1;
  }

  await Promise.all([writeCsv]).then(() => {
    return end(start, parsedAds.length);
  }).catch((err) => {
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
