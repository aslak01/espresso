type UrlBuilder = (searchkey: string, queryString: string) => string;

const SECTION_SEARCH_URL: Record<string, UrlBuilder> = {
	jobb: (k, q) =>
		`https://www.finn.no/job/job-search-page/api/search/${k}?${q}`,
	torget: (k, q) =>
		`https://www.finn.no/recommerce/forsale/search/api/search/${k}?${q}`,
	bil: (k, q) => `https://www.finn.no/mobility/search/api/search/${k}?${q}`,
	// Eiendom uses Remix's `.data` loader endpoint (turbo-stream encoded
	// response, decoded in src/eiendom.ts). The searchkey isn't part of the
	// URL — the subvertical path ("homes") is — so we ignore the searchkey arg.
	eiendom: (_k, q) => `https://www.finn.no/realestate/homes/search.html.data?${q}`,
};

export function buildSearchUrl(
	section: string,
	searchkey: string,
	params: Record<string, string>,
): string {
	const builder = SECTION_SEARCH_URL[section];
	if (!builder) {
		throw new Error(`No search endpoint configured for section "${section}"`);
	}

	const query = new URLSearchParams();
	for (const [param, value] of Object.entries(params)) {
		if (value !== "" && param !== "trade_type" && param !== "ad_type") {
			query.append(param, value);
		}
	}

	return builder(searchkey, query.toString());
}
