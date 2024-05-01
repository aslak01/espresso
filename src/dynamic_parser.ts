const configJson = await import("../config.json", { with: { "type": "json" } });
const keepList = configJson.default.keep;

function parseObjectWithKeys(
  keysToKeep: string[],
): (
  data: Record<string, string | number | object>,
) => Record<string, string | number> {
  return function (
    data: Record<string, string | number | object>,
  ): Record<string, string | number> {
    if (!data || typeof data !== "object" || !Array.isArray(keysToKeep)) {
      return {};
    }

    const parsedObject: Record<string, string | number> = {};

    function getValueForKey(
      key: string,
      obj: Record<string, string | number | object>,
    ): string | number | undefined {
      const nestedKeys = key.split(".");
      const firstKey = nestedKeys[0];
      const remainingKeys = nestedKeys.slice(1);

      if (!Object.prototype.hasOwnProperty.call(obj, firstKey)) {
        return undefined;
      }

      const value = obj[firstKey];

      if (remainingKeys.length === 0) {
        if (typeof value === "object") return undefined;

        if (firstKey === "timestamp") {
          const timestampValue = value as number;
          parsedObject["timestamp"] = timestampValue;
          parsedObject["date"] = new Date(timestampValue)
            .toLocaleDateString("no-NO", {
              day: "2-digit",
              month: "2-digit",
              year: "2-digit",
            });
          return undefined;
        } else if (firstKey === "url") {
          parsedObject["image"] = value;
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
      const value = getValueForKey(key, data);
      if (value !== undefined) {
        parsedObject[key.split(".").pop()!] = value;
      }
    });

    return parsedObject;
  };
}

export function parseAd(
  data: Record<string, string | number | object>,
): Record<string, string | number> {
  return parseObjectWithKeys(keepList)(data);
}
