export type Ad = {
	ad_id: number;
	heading: string;
	location: string;
	timestamp: number;
	date: string;
	amount: number;
	lat: number;
	lon: number;
	canonical_url: string;
	image: string;
};

export type DiscordMessage = {
	content: string;
};
