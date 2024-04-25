import type { FilteredAndMassagedFinnAd } from "./types/index.ts";
import type { FinnAd } from "./quicktype.ts";

export function parse(ad: FinnAd): FilteredAndMassagedFinnAd {
  const {
    ad_id: id,
    canonical_url: url,
    heading,
    location,
    coordinates,
    price,
    timestamp,
    image,
  } = ad;

  const nokPrice = price.amount;
  const joinedCoordinates = coordinates.lat + "," + coordinates.lon;
  const img = image?.url || "";
  const date = timestampToDatestring(timestamp);

  return {
    id,
    heading,
    location,
    date,
    timestamp,
    price: nokPrice,
    coords: joinedCoordinates,
    url,
    img,
  };
}

export function timestampToDatestring(dt: number) {
  const date = new Date(dt);
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  };
  return date.toLocaleDateString("no-NO", options);
}
