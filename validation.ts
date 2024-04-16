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
