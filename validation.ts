import type { FinnAd } from "./types/index.ts";

export function isFinnAd<T extends FinnAd>(obj: unknown): obj is T {
  return (
    typeof obj === "object" && obj !== null &&
    (("id" in obj && typeof obj.id === "string") ||
      ("ad_id" in obj && typeof obj.ad_id === "number")) &&
    "heading" in obj && typeof obj.heading === "string" &&
    "location" in obj && typeof obj.location === "string" &&
    "timestamp" in obj && typeof obj.timestamp === "number" &&
    "trade_type" in obj && typeof obj.trade_type === "string" &&
    "image" in obj && typeof obj.image === "object" &&
    "price" in obj && typeof obj.price === "object"
  );
}

const blacklist = [
  "bialetti",
  "integrert",
  "automatisk",
  "kapsel",
  "kapsler",
  "pod",
  "nespresso",
  "nescafe",
  "aeropress",
  "moka",
  "tyrkisk",
];

function noneIncluded(arr1: string[], arr2: string[]): boolean {
  return arr1.every((str1) =>
    !arr2.some((str2) => str2.includes(str1)) && !arr2.includes(str1)
  );
}

function stripDiacritics(str: string): string {
  return str.normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

function stripQuotes(str: string): string {
  return str.replace(/['"`´«»]/g, "");
}

function removeUnwantedAds(
  blacklist: string[],
  tradeType: string,
): (ad: FinnAd) => boolean {
  return (ad: FinnAd): boolean => {
    const desc = stripQuotes(ad.heading);
    const descArr = desc.split(" ").map((s: string) => s.toLowerCase()).map(
      stripDiacritics,
    );
    const verdict = noneIncluded(blacklist, descArr) &&
      ad.trade_type === tradeType;
    return verdict;
  };
}

const adFilter = removeUnwantedAds(blacklist, "Til salgs");

export function isWantedValidAd(ad: FinnAd) {
  return isFinnAd(ad) && adFilter(ad);
}
