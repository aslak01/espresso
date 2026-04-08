const SEARCH_QF_BASE = "https://www.finn.no/api/search-qf";
const JOB_SEARCH_BASE = "https://www.finn.no/job/job-search-page/api/search";

export function buildSearchUrl(
	section: string,
	searchkey: string,
	params: Record<string, string>,
): string {
	const query = new URLSearchParams();

	if (section !== "jobb") {
		query.append("searchkey", searchkey);
		query.append("vertical", "bap");
	}

	for (const [param, value] of Object.entries(params)) {
		if (value !== "" && param !== "trade_type" && param !== "ad_type") {
			query.append(param, value);
		}
	}

	if (section === "jobb") {
		return `${JOB_SEARCH_BASE}/${searchkey}?${query.toString()}`;
	}

	return `${SEARCH_QF_BASE}?${query.toString()}`;
}
