import { assert } from "@std/assert/assert";
import { parse } from "./parse.ts";
import { isFinnAd } from "./validation.ts";
import { Convert, FinnAdFetch } from "./quicktype.ts";

// Learn more at https://deno.land/manual/examples/module_metadata#concepts
if (import.meta.main) {
  // TODO: Learn that

  const start = performance.now();
  assert(
    Deno.args.length > 0 && Deno.args.length < 3,
    "This program needs to be called with one or two parameters.",
  );
  const inputUrl = Deno.args[0];
  const outputUrl = Deno.args[1] || "";

  const seenAds = await import("./data/seen.json");
  assert("ids" in seenAds, "Seen ads couldn't be imported.");

  const seenIds = seenAds.ids;
  assert(Array.isArray(seenIds), "Malformed seen ads.");

  const fetchData = await fetch(inputUrl);
  const fetchJson = await fetchData.json();

  // Quicktype data import safety:
  const data = Convert.toFinnAdFetch(fetchJson);
  const fetchedAds = data.docs;

  const newAds = fetchedAds.filter((ad) =>
    seenIds.includes(ad.ad_id) === false
  );
  if (newAds.length === 0) end(start);
  const validatedNewAds = newAds.filter(isFinnAd);

  const parsedNewAds = validatedNewAds.map(parse);
  const newIds = parsedNewAds.map((ad) => ad.id);

  const newUniqueIds = new Set([seenIds, ...newIds]);

  // TODO: Send new ads formatted to webhook
  // TODO: Format and write new ads to csv
  // TODO: Overwrite seenAds file with new unique ids

  end(start, newIds.length);
}

function end(start: number, processedAds = 0) {
  const finish = performance.now();
  const delta = finish - start;

  console.log(`Processed ${processedAds} lines in ${delta} ms`);
}
