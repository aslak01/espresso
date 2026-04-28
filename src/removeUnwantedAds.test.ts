import { readSeenIds } from "./csv.ts";
import { configFor } from "./consts.ts";
import { removeUnwantedAds } from "./validation.ts";

const { params, blacklist } = configFor("torget");
import { writeFile, unlink } from "node:fs/promises";
import { test, expect } from "bun:test";
import type { FinnAd } from "./schema.ts";

test("removeUnwantedAds filter using actual CSV data", async () => {
	const csvContent = `ad_id,heading,location,timestamp,date,amount,lat,lon,canonical_url,image
297837349,Espresso cup,Oslo,1714481940000,30.04.24,200,59.9259,10.76864,https://www.finn.no/bap/forsale/ad.html?finnkode=297837349,https://images.finncdn.no/dynamic/default/2023/4/vertical-0/07/9/297/837/349_1476891388.jpg
350880502,Espresso og cappuccino maskin DeLonghi,Oslo,1714414693630,29.04.24,3000,59.90675,10.75783,https://www.finn.no/bap/forsale/ad.html?finnkode=350880502,https://images.finncdn.no/dynamic/default/2024/4/vertical-0/29/2/350/880/502_74635caa-29d6-44c5-a544-ade5ab1640e3.jpg
131823830,Espresso maskin Lelit Mara håndlaget italiensk PL62 T. Veil pris 18.000!,Oslo,1714465440000,30.04.24,12000,59.95193,10.64475,https://www.finn.no/bap/forsale/ad.html?finnkode=131823830,https://images.finncdn.no/dynamic/default/2018/10/vertical-5/17/0/131/823/830_616650614.jpg`;

	const tempFilePath = "./temp_seen_ads.csv";

	await writeFile(tempFilePath, csvContent, { encoding: "utf-8" });

	const seenIds = await readSeenIds(tempFilePath);

	await unlink(tempFilePath);

	const newAds: FinnAd[] = [
		{
			id: "dummy-1",
			main_search_key: "SEARCH_ID_BAP_ALL",
			heading: "Espresso cup",
			location: "Oslo",
			image: {
				url: "https://dummyimage.com/300",
				path: "https://dummyimage.com/300",
				height: 300,
				width: 300,
				aspect_ratio: 1,
			},
			timestamp: 1714481940000,
			coordinates: { lat: 59.9259, lon: 10.76864 },
			ad_type: 67,
			canonical_url:
				"https://www.finn.no/bap/forsale/ad.html?finnkode=297837349",
			price: { amount: 200, currency_code: "NOK", price_unit: "kr" },
			trade_type: "Til salgs",
			ad_id: 297837349,
		},
		{
			id: "dummy-2",
			main_search_key: "SEARCH_ID_BAP_ALL",
			heading: "New Espresso Machine",
			location: "Oslo",
			image: {
				url: "https://dummyimage.com/300",
				path: "https://dummyimage.com/300",
				height: 300,
				width: 300,
				aspect_ratio: 1,
			},
			timestamp: 1714414693630,
			coordinates: { lat: 59.90675, lon: 10.75783 },
			ad_type: 67,
			canonical_url:
				"https://www.finn.no/bap/forsale/ad.html?finnkode=999999999",
			price: { amount: 343, currency_code: "NOK", price_unit: "kr" },
			trade_type: "Til salgs",
			ad_id: 999999999,
		},
	];

	const filterFn = removeUnwantedAds(
		seenIds,
		blacklist,
		params.trade_type,
		params.search_key,
		params.ad_type,
	);

	const validatedAds = newAds.filter(filterFn);

	expect(validatedAds).toHaveLength(1);
	expect(validatedAds[0].ad_id).toBe(999999999);
});
