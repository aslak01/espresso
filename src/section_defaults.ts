import type { Section } from "./consts.ts";

/**
 * Per-section query-param defaults that the scraper needs but a user
 * shouldn't have to memorise: which `search_key` distinguishes ads of this
 * type, which `ad_type` numeric code matches, which `trade_type` string,
 * and any constant URL params finn.no expects for the vertical.
 *
 * User config in `config.json` only has to set what actually varies between
 * runs (q, location, lat/lon/radius, blacklist). User values override these.
 *
 * Only torget and eiendom are filled in: those are the two sections whose
 * response shape the rest of the pipeline currently knows how to parse.
 * The URL build path works for jobb/bil too, but their docs would need a
 * schema variant before scraping is meaningful.
 */
export const SECTION_DEFAULTS: Partial<Record<Section, Record<string, string>>> =
	{
		torget: {
			section: "torget",
			search_key: "SEARCH_ID_BAP_ALL",
			trade_type: "Til salgs",
			ad_type: "67",
		},
		eiendom: {
			search_key: "SEARCH_ID_REALESTATE_HOMES",
			trade_type: "Til salgs",
			ad_type: "1",
		},
	};
