import type { FilteredAndMassagedFinnAd, FinnAd } from "./types/index.ts";

export function parse(ad: FinnAd): FilteredAndMassagedFinnAd {
  const {
    heading,
    location,
    coordinates,
    price,
    timestamp,
    image,
    trade_type,
  } = ad;

  const id = ad.ad_id;
  const nokPrice = price.amount;
  const joinedCoordinates = coordinates.lat + "," + coordinates.lon;
  const url = "https://www.finn.no/bap/forsale/ad.html?finnkode=" + id;
  const img = image?.url || "";
  const date = timestampToDatestring(timestamp);

  return {
    id,
    heading,
    location,
    trade_type,
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
