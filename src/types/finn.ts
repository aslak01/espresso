import type { FinnAd } from "./quicktype.ts";

type FilteredFinnAd = Pick<FinnAd, "heading" | "location" | "timestamp">;

type MassagedFinnAd = {
	ad_id: number;
	amount: number;
	date: string;
	lat: number;
	lon: number;
	canonical_url: string;
	image: string;
};

export type FilteredAndMassagedFinnAd = FilteredFinnAd & MassagedFinnAd;
