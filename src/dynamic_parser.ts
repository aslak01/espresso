const configJson = await import("../config.json", { with: { type: "json" } });
const keepList = configJson.default.keep;

type RawAd = Record<string, string | number | object>;
type ParsedAd = Record<string, string | number>;

function parseObjectWithKeys(keysToKeep: string[]): (ad: RawAd) => ParsedAd {
	return function (ad: RawAd): ParsedAd {
		if (!ad || typeof ad !== "object" || !Array.isArray(keysToKeep)) {
			return {};
		}

		const parsedObject: ParsedAd = {};

		function getValueForKey(
			key: string,
			obj: RawAd,
		): string | number | undefined {
			const nestedKeys = key.split(".");
			const [firstKey, ...remainingKeys] = nestedKeys;

			if (!Object.prototype.hasOwnProperty.call(obj, firstKey)) {
				return undefined;
			}

			const value = obj[firstKey];

			if (remainingKeys.length === 0) {
				if (typeof value === "object") return undefined;

				if (firstKey === "timestamp") {
					const timestampValue = value as number;
					parsedObject.timestamp = timestampValue;
					parsedObject.date = formatTimestampToDate(timestampValue);
					return undefined;
				} else if (firstKey === "url") {
					parsedObject.image = value;
					return undefined;
				}

				return typeof value === "string"
					? (value as string).replaceAll(",", "")
					: value;
			} else if (typeof value === "object") {
				return getValueForKey(
					remainingKeys.join("."),
					value as Record<string, string | number>,
				);
			} else {
				return undefined;
			}
		}

		keysToKeep.forEach((key) => {
			const value = getValueForKey(key, ad);
			if (value !== undefined) {
				parsedObject[key.split(".").pop()!] = value;
			}
		});

		return parsedObject;
	};
}

export function parseAd(ad: RawAd): ParsedAd {
	console.log("parsing", ad.heading);
	const parser = parseObjectWithKeys(keepList);
	return parser(ad);
}

function formatTimestampToDate(timestamp) {
	return new Date(timestamp).toLocaleDateString("no-NO", {
		day: "2-digit",
		month: "2-digit",
		year: "2-digit",
	});
}
