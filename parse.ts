import type { FilteredAndMassagedFinnAd } from "./types/index.ts";
import type { FinnAd } from "./types/quicktype.ts";

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

  const { lat, lon } = coordinates;

  const cleanedHeading = heading.replace(",", "");
  const nokPrice = price.amount;
  const img = image?.url || "";
  const date = timestampToDatestring(timestamp);

  return {
    id,
    heading: cleanedHeading,
    location,
    date,
    timestamp,
    price: nokPrice,
    lat,
    lon,
    url,
    img,
  };
}

function timestampToDatestring(dt: number) {
  const date = new Date(dt);
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  };
  return date.toLocaleDateString("no-NO", options);
}

export function formatMsg(ad: FilteredAndMassagedFinnAd) {
  return `**${ad.heading}**, ${ad.location}: ${ad.price}\n${ad.url}`;
}
