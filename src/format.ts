import type { ParsedAd } from "./dynamic_parser.ts";

export function formatDiscordMsg(ad: ParsedAd) {
	return {
		content: `**${ad.heading ?? "Unknown"}**, ${ad.location ?? "Unknown"}: **${ad.amount ?? "N/A"}**\n${ad.canonical_url ?? ""}`,
	};
}
