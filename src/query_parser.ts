export function parseParams(
  searchkey: string,
  q?: string,
  lat?: string,
  lon?: string,
  radius?: string,
  category?: string,
  sub_category?: string,
) {
  const params = new URLSearchParams();
  params.append("searchkey", searchkey);
  params.append("vertical", "bap");

  q && params.append("q", q);
  lat && params.append("lat", lat);
  lon && params.append("lon", lon);
  radius && params.append("radius", radius);
  category && params.append("category", category);
  sub_category && params.append("sub_category", sub_category);

  return params.toString();
}
