const SECTION_SEARCH_BASE: Record<string, string> = {
	jobb: "https://www.finn.no/job/job-search-page/api/search",
	torget: "https://www.finn.no/recommerce/forsale/search/api/search",
	bil: "https://www.finn.no/mobility/search/api/search",
};

export function buildSearchUrl(
	section: string,
	searchkey: string,
	params: Record<string, string>,
): string {
	const base = SECTION_SEARCH_BASE[section];
	if (!base) {
		throw new Error(
			`No migrated search endpoint for section "${section}". finn.no's /api/search-qf was deprecated in 2026; eiendom hasn't been ported yet (response is Remix turbo-stream encoded).`,
		);
	}

	const query = new URLSearchParams();
	for (const [param, value] of Object.entries(params)) {
		if (value !== "" && param !== "trade_type" && param !== "ad_type") {
			query.append(param, value);
		}
	}

	return `${base}/${searchkey}?${query.toString()}`;
}
