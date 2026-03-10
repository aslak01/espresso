import type { Ad, DiscordMessage } from "./types/index.ts";

export function formatDiscordMsg(ad: Ad): DiscordMessage {
	return {
		content: `**${ad.heading}**, ${ad.location}: **${ad.amount}**\n${ad.canonical_url}`,
	};
}
