import { Schema as S } from "@effect/schema";

export const FinnAdSchema = S.Struct({
	id: S.optional(S.String),
	ad_id: S.Number,
	heading: S.String,
	location: S.String,
	timestamp: S.Number,
	trade_type: S.String,
	canonical_url: S.String,
	main_search_key: S.String,
	ad_type: S.Number,
	image: S.Struct({
		url: S.String,
		path: S.String,
		height: S.Number,
		width: S.Number,
		aspect_ratio: S.Number,
	}),
	price: S.Struct({
		amount: S.Number,
		currency_code: S.String,
		price_unit: S.String,
	}),
	coordinates: S.Struct({
		lat: S.Number,
		lon: S.Number,
	}),
});

export type FinnAd = typeof FinnAdSchema.Type;

export const decodeFinnAd = S.decodeUnknownEither(FinnAdSchema, { onExcessProperty: "ignore" });
