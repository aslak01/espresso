import { Either } from "effect";
import { type FinnAd, decodeFinnAd } from "./schema.ts";

export function parseFinnAd(obj: unknown): FinnAd | null {
	const result = decodeFinnAd(obj);
	return Either.isRight(result) ? result.right : null;
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
		if (seenIds.has(ad.ad_id)) return false;

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
