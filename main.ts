import { assert } from "jsr:@std/assert/assert";
import { parseArgs } from "jsr:@std/cli/parse-args";
import { formatMsg, parse } from "./src/parse.ts";
import { isFinnAd, removeUnwantedAds } from "./src/validation.ts";
import {
  baseUrl,
  blacklist,
  cat,
  hookUrl,
  latitude,
  longitude,
  query,
  rad,
  s_cat,
  search_key,
  section,
} from "./src/consts.ts";
import { createRateLimitedQueue } from "./src/webhook.ts";
import { readCsv, writeToCsv } from "./src/csv.ts";
import { parseParams } from "./src/query_parser.ts";

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

  const q = args.q || query;
  const lat = args.lat || latitude;
  const lon = args.lon || longitude;
  const radius = args.rad || rad;
  const category = args.cat || cat;
  const sub_category = args.sc || s_cat;
  const sec = args.m || section;

  const d = args.d;

  const inputUrl = url +
    parseParams(
      search_key(sec),
      q,
      lat,
      lon,
      radius,
      category,
      sub_category,
    );

  d && console.log("Scraping ", inputUrl);

  const outputUrl = args.o || hookUrl;

  d && console.log("Publishing to ", outputUrl);

  const filters = await blacklist();

  d && console.log("filtering ads with words", filters);

  const q_fn = q.replace(" ", "_");

  const seenAds = await readCsv(`./data/${q_fn}.csv`);
  const seenIds = seenAds.map((ad) => Number(ad.id));

  if (seenIds && seenIds.length) {
    assert(Array.isArray(seenIds), "Malformed seen ads data type.");
    assert(
      seenIds.every((id) => typeof id === "number"),
      "Malformed seen ads content.",
    );
    d && console.log("Already saw", seenIds.length, "ads");
  }

  const fetchData = await fetch(inputUrl);
  const fetchJson = await fetchData.json();
  const ads = fetchJson.docs;

  assert(ads.length > 0, "No ads found.");

  const wellFormedAds = ads.filter(isFinnAd);
  d && console.log("found", wellFormedAds.length, "ads");

  // SEARCH_ID_BAP_ALL filters away "gis bort"
  // 67 filters for private
  const wantedAd = removeUnwantedAds(
    seenIds,
    filters,
    "Til salgs",
    "SEARCH_ID_BAP_ALL",
    67,
  );

  const validatedNewAds = wellFormedAds.filter(wantedAd);
  if (validatedNewAds.length === 0) return end(start);
  d && console.log("found", validatedNewAds, "interesting ads");

  const parsedAds = validatedNewAds.map(parse);

  const writeCsv = writeToCsv(parsedAds, `./data/${q_fn}.csv`);

  if (outputUrl) {
    const messages = parsedAds.map(formatMsg).map((msg: string) => ({
      content: msg,
    }));

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
