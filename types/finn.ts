import type { FinnAd } from "./quicktype.ts";

type FilteredFinnAd = Pick<
  FinnAd,
  "heading" | "location" | "timestamp"
>;

type MassagedFinnAd = {
  price: number;
  coords: string;
  id: number;
  url: string;
  img: string;
  date: string;
};

export type FilteredAndMassagedFinnAd =
  & FilteredFinnAd
  & MassagedFinnAd;
