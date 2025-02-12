import type { FilteredAndMassagedFinnAd } from "./types/index.ts";
export function formatDiscordMsg(ad: FilteredAndMassagedFinnAd) {
	return {
		content: `**${ad.heading}**, ${ad.location}: **${ad.amount}**\n${ad.canonical_url}`,
	};
}
