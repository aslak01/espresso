import type { FinnAd } from "./schema.ts";
import type { Ad } from "./types/index.ts";

export function parseAd(ad: FinnAd): Ad {
	console.log("parsing", ad.heading);
	return {
		ad_id: ad.ad_id,
		heading: ad.heading,
		location: ad.location,
		timestamp: ad.timestamp,
		date: formatTimestampToDate(ad.timestamp),
		amount: ad.price.amount,
		lat: ad.coordinates.lat,
		lon: ad.coordinates.lon,
		canonical_url: ad.canonical_url,
		image: ad.image.url,
	};
}

function formatTimestampToDate(timestamp: number) {
	return new Date(timestamp).toLocaleDateString("no-NO", {
		day: "2-digit",
		month: "2-digit",
		year: "2-digit",
	});
}
