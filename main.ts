import { assert } from "@std/assert/assert";
import { formatMsg, parse } from "./parse.ts";
import { isFinnAd, isWantedValidAd, removeUnwantedAds } from "./validation.ts";
import { FinnAd } from "./types/quicktype.ts";
import { blacklist, hookUrl, scrapeUrl } from "./consts.ts";
import { sendWebhook } from "./webhook.ts";
import { FilteredAndMassagedFinnAd } from "./types/index.ts";
import { writeToCsv } from "./csv.ts";

// Learn more at https://deno.land/manual/examples/module_metadata#concepts
// TODO: Learn that
if (import.meta.main) {
  await main();
}

async function main() {
  const start = performance.now();
  const inputUrl = scrapeUrl || Deno.args[0];
  const outputUrl = hookUrl || Deno.args[1];

  const seenAds = await import("./data/seen.json", {
    with: { "type": "json" },
  });
  assert("ids" in seenAds.default, "Seen ads couldn't be imported.");

  const seenIds: number[] = seenAds.default.ids;
  assert(Array.isArray(seenIds), "Malformed seen ads data type.");
  assert(
    seenIds.every((id) => typeof id === "number"),
    "Malformed seen ads content.",
  );

  const fetchData = await fetch(inputUrl);
  const fetchJson = await fetchData.json();
  const ads = fetchJson.docs;

  assert(ads.length > 0, "No ads found.");

  // SEARCH_ID_BAP_ALL filters away "gis bort"
  // 67 filters for private
  const adFilter = removeUnwantedAds(
    seenIds,
    blacklist,
    "Til salgs",
    "SEARCH_ID_BAP_ALL",
    67,
  );

  function isWantedAd(ad: FinnAd) {
    return isFinnAd(ad) && adFilter(ad);
  }

  const validatedNewAds = ads.filter(isWantedAd);

  if (validatedNewAds.length === 0) return end(start);

  const parsedAds = validatedNewAds.map(parse);
  const newIds = parsedAds.map((
    ad: FilteredAndMassagedFinnAd,
  ) => ad.id);

  const newSeenIds = {
    ids: Array.from(new Set([...seenIds, ...newIds])).sort((a, b) => a - b),
  };

  const writeIds = Deno.writeTextFile(
    "./data/seen.json",
    JSON.stringify(newSeenIds),
  );

  const writeCsv = writeToCsv(parsedAds, "./data/log.csv");

  const messages = parsedAds.map(formatMsg);
  const webhookPromises = messages.map((msg: string) =>
    sendWebhook({ content: msg, destination: outputUrl })
  );
  const sendAllWebhooks = () => {
    return Promise.all(webhookPromises);
  };

  await Promise.all([writeIds, sendAllWebhooks(), writeCsv]).then(() => {
    return end(start, newIds.length);
  });
}

function end(start: number, processedAds = 0) {
  const finish = performance.now();
  const delta = finish - start;

  console.log(`Processed ${processedAds} lines in ${delta} ms`);

  return 0;
}
