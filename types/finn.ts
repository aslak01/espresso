import type { FinnAd } from "./quicktype.ts";

type FilteredFinnAd = Pick<
  FinnAd,
  "heading" | "location" | "timestamp"
>;

type MassagedFinnAd = {
  id: number;
  price: number;
  date: string;
  lat: number;
  lon: number;
  url: string;
  img: string;
};

export type FilteredAndMassagedFinnAd =
  & FilteredFinnAd
  & MassagedFinnAd;
