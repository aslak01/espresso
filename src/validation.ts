import type { FinnAd } from "./types/index.ts";

export function isFinnAd<T extends FinnAd>(obj: unknown): obj is T {
	return (
		typeof obj === "object" &&
		obj !== null &&
		(("id" in obj && typeof obj.id === "string") ||
			("ad_id" in obj && typeof obj.ad_id === "number")) &&
		"heading" in obj &&
		typeof obj.heading === "string" &&
		"location" in obj &&
		typeof obj.location === "string" &&
		"timestamp" in obj &&
		typeof obj.timestamp === "number" &&
		"trade_type" in obj &&
		typeof obj.trade_type === "string" &&
		"image" in obj &&
		typeof obj.image === "object" &&
		"price" in obj &&
		typeof obj.price === "object"
	);
}

export function noneIncluded(blacklist: string[], words: string[]): boolean {
	return blacklist.every((banned) => !words.includes(banned));
}

export function stripDiacritics(str: string): string {
	return str.normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

export function stripPunctuation(str: string): string {
	return str.replace(/[^\w\s]|_/g, "");
}

export function removeUnwantedAds(
	seenIds: Set<number>,
	blacklist: string[],
	tradeType: string,
	searchKey: string,
	adType: string,
): (ad: FinnAd) => boolean {
	return (ad: FinnAd): boolean => {
		// exit early if ad was already parsed at some other point
		if (seenIds.has(Number(ad.ad_id))) return false;

		const description = stripPunctuation(ad.heading).replace("-", " ");

		const descriptionWords = description
			.split(" ")
			.filter((word) => word !== "")
			.map(stripDiacritics)
			.map((word) => word.trim().toLowerCase());
		const verdict =
			noneIncluded(blacklist, descriptionWords) &&
			ad.trade_type === tradeType &&
			ad.main_search_key === searchKey &&
			ad.ad_type === Number(adType);
		return verdict;
	};
}
