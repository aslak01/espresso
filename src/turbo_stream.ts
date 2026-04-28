/**
 * Decode the flat-array reference encoding that finn.no's Remix routes serve
 * at `*.data` URLs.
 *
 * Wire shape (observed): a JSON array. Index 0 is the root. Each entry is
 * either a primitive, a regular array, or an object whose keys are
 * `_<idx>` — meaning the *key* is the string at index `<idx>` and the *value*
 * is the entry at the index given by the property's value. References can
 * cycle, so resolved entries are memoised. Negative indices are sentinels
 * (e.g. -7 ≈ null); they're collapsed to null since we don't depend on the
 * distinction.
 */
export function decodeTurboStream(raw: unknown[]): unknown {
	const cache = new Map<number, unknown>();

	function resolve(ref: unknown): unknown {
		if (typeof ref !== "number") return ref;
		if (ref < 0) return null;
		if (cache.has(ref)) return cache.get(ref);

		const val = raw[ref];
		if (Array.isArray(val)) {
			const out: unknown[] = [];
			cache.set(ref, out);
			for (const item of val) out.push(resolve(item));
			return out;
		}
		if (val !== null && typeof val === "object") {
			const out: Record<string, unknown> = {};
			cache.set(ref, out);
			for (const [k, v] of Object.entries(val)) {
				if (k.startsWith("_")) {
					const key = resolve(Number(k.slice(1)));
					if (typeof key === "string") out[key] = resolve(v);
				} else {
					out[k] = v;
				}
			}
			return out;
		}
		cache.set(ref, val);
		return val;
	}

	return resolve(0);
}
