import { decodeTurboStream } from "./turbo_stream.ts";

const EIENDOM_RESULTS_KEY =
	"routes/realestate+/_search+/$subvertical.search[.html]";

/**
 * Pull the docs array out of finn.no's Remix realestate loader response.
 * Eiendom docs differ from torget docs in two relevant ways:
 *   - they use `price_suggestion` instead of `price`
 *   - they have no `trade_type` field
 * Both are normalised here so the existing FinnAd schema and downstream
 * filters keep working unchanged.
 */
export function extractEiendomDocs(raw: unknown): unknown[] {
	if (!Array.isArray(raw)) {
		throw new Error("Eiendom response was not a JSON array");
	}
	const root = decodeTurboStream(raw) as Record<string, unknown> | null;
	const route = root?.[EIENDOM_RESULTS_KEY] as
		| { data?: { results?: { docs?: unknown[] } } }
		| undefined;
	const docs = route?.data?.results?.docs;
	if (!Array.isArray(docs)) {
		throw new Error(
			`Could not locate docs at "${EIENDOM_RESULTS_KEY}/data/results/docs"`,
		);
	}
	return docs.map(normaliseDoc);
}

function normaliseDoc(doc: unknown): unknown {
	if (doc === null || typeof doc !== "object") return doc;
	const d = doc as Record<string, unknown>;
	return {
		...d,
		price: d.price ?? d.price_suggestion,
		trade_type: d.trade_type ?? "Til salgs",
	};
}
