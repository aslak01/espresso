// deno-lint-ignore-file no-explicit-any
// To parse this data:
//   import { Convert, FinnAdFetch } from "./file";
//   const finnAdFetch = Convert.toFinnAdFetch(json);
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export type FinnAdFetch = {
  docs: PromotedAd[];
  filters: Filter[];
  metadata: Metadata;
  mapUrl: string;
  newMapUrl: string;
  pageMetadata: PageMetadata;
  resultHeading: string;
  promotedAd: PromotedAd;
};

export type PromotedAd = {
  type: PromotedAdType;
  id: string;
  main_search_key: MainSearchKey;
  heading: string;
  location: string;
  image: PromotedAdImage;
  flags: Flag[];
  timestamp: number;
  coordinates: Coordinates;
  ad_type: number;
  labels: Label[];
  canonical_url: string;
  extras: any[];
  price: Price;
  distance: number;
  trade_type: TradeType;
  image_urls: string[];
  ad_id: number;
  organisation_name?: string;
  fusClickUrl?: string;
  fusViewUrl?: string;
  paidPromotions?: PaidPromotion[];
};

export type Coordinates = {
  lat: number;
  lon: number;
};

export type Flag = "private" | "retailer" | "shipping_exists";

export type PromotedAdImage = {
  url: string;
  path: string;
  height: number;
  width: number;
  aspect_ratio: number;
};

export type Label = {
  id: ID;
  text: Text;
  type: LabelType;
};

export type ID = "private" | "retailer" | "fiks_ferdig" | "fus";

export type Text =
  | "Privat"
  | "Forhandler"
  | "Fiks ferdig"
  | "Betalt plassering";

export type LabelType = "SECONDARY" | "PRIMARY";

export type MainSearchKey = "SEARCH_ID_BAP_ALL";

export type PaidPromotion = {
  "@id": string;
};

export type Price = {
  amount: number;
  currency_code: CurrencyCode;
  price_unit: Unit;
};

export type CurrencyCode = "NOK";

export type Unit = "kr";

export type TradeType = "Til salgs";

export type PromotedAdType = "bap";

export type Filter = {
  display_name: string;
  name: Name;
  filter_items: FilterItem[];
  value?: string;
  gs_value?: string;
  type: string;
  latitude?: string;
  longitude?: string;
  location_name?: string;
  min_value?: number;
  max_value?: number;
  step?: number;
  unit?: Unit;
  name_from?: string;
  name_to?: string;
  is_year?: boolean;
};

export type FilterItem = {
  display_name: string;
  name: Name;
  value: string;
  hits: number;
  selected: boolean;
  filter_items?: FilterItem[];
};

export type Name =
  | "q"
  | "category"
  | "shipping_exists"
  | "location"
  | "for_rent"
  | "trade_type"
  | "dealer_segment"
  | "condition"
  | "published"
  | "sub_category"
  | "product_category"
  | "radius"
  | "price";

export type Metadata = {
  params: Params;
  search_key: string;
  selected_filters: SelectedFilter[];
  num_results: number;
  quest_time: number;
  solr_time: number;
  solr_elapsed_time: number;
  result_size: ResultSize;
  paging: Paging;
  title: string;
  is_savable_search: boolean;
  search_key_description: string;
  vertical: string;
  vertical_description: string;
  sort: string;
  descriptions: Descriptions;
  uuid: string;
  tracking: MetadataTracking;
  guided_search: GuidedSearch;
  actions: any[];
  is_end_of_paging: boolean;
};

export type Descriptions = {
  title: string;
  heading: string;
  saved_search: string;
  search_key: string;
  vertical: string;
  canonical_search_params: string;
};

export type GuidedSearch = {
  suggestions: Suggestion[];
  tracking: GuidedSearchTracking;
};

export type Suggestion = {
  display_name: string;
  param: string;
  no_of_hits: number;
  types: string[];
  score: number;
  selected: boolean;
  algorithm: string;
  image: SuggestionImage;
  hash: string;
  tracking_object: TrackingObject;
};

export type SuggestionImage = {
  url: string;
  path: string;
};

export type TrackingObject = {
  query: string;
  algorithm: string;
  types: string[];
  "@id": string;
  "@type": string;
};

export type GuidedSearchTracking = {
  search: Search;
  vertical: Vertical;
  name: string;
  intent: string;
  type: string;
};

export type Search = {
  items: TrackingObject[];
  originalQuery: string;
  "@type": string;
  "@id": string;
};

export type Vertical = {
  name: string;
};

export type Paging = {
  param: string;
  current: number;
  last: number;
};

export type Params = {
  geoLocationName: string[];
  lat: string[];
  lon: string[];
  q: string[];
  sub_category: string[];
};

export type ResultSize = {
  match_count: number;
  group_count: number;
};

export type SelectedFilter = {
  parameters: Parameter[];
  filter_name: Name;
  display_name: string;
  prefix: string;
};

export type Parameter = {
  parameter_name: Name;
  parameter_value: string;
};

export type MetadataTracking = {
  object: Object;
  vertical: Vertical;
};

export type Object = {
  filters: Filters;
  selectionFilters: SelectionFilter[];
  sortingType: string;
  numItems: number;
  pageNumber: number;
  layout: string;
  type: string;
};

export type Filters = {
  query: string;
};

export type SelectionFilter = {
  name: Name;
  value: string;
  valueId: string;
};

export type PageMetadata = {
  title: string;
  description: string;
  indexDirective: string;
  canonicalUrl: string;
  openGraphUrl: string;
  jsonLd: JSONLd;
  image: string;
};

export type JSONLd = {
  "@context": string;
  "@type": string;
  url: string;
  mainContentOfPage: MainContentOfPage;
  breadcrumb: Breadcrumb;
  headline: string;
};

export type Breadcrumb = {
  "@type": string;
  name: string;
  itemListElement: ItemListElement[];
};

export type ItemListElement = {
  "@type": string;
  position: number;
  item: Item;
};

export type Item = {
  "@id": string;
  name: string;
};

export type MainContentOfPage = {
  "@type": string;
  cssSelector: string;
};

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
  public static toFinnAdFetch(json: string): FinnAdFetch {
    return cast(JSON.parse(json), r("FinnAdFetch"));
  }

  public static finnAdFetchToJson(value: FinnAdFetch): string {
    return JSON.stringify(uncast(value, r("FinnAdFetch")), null, 2);
  }
}

function invalidValue(typ: any, val: any, key: any, parent: any = ""): never {
  const prettyTyp = prettyTypeName(typ);
  const parentText = parent ? ` on ${parent}` : "";
  const keyText = key ? ` for key "${key}"` : "";
  throw Error(
    `Invalid value${keyText}${parentText}. Expected ${prettyTyp} but got ${
      JSON.stringify(val)
    }`,
  );
}

function prettyTypeName(typ: any): string {
  if (Array.isArray(typ)) {
    if (typ.length === 2 && typ[0] === undefined) {
      return `an optional ${prettyTypeName(typ[1])}`;
    } else {
      return `one of [${
        typ.map((a) => {
          return prettyTypeName(a);
        }).join(", ")
      }]`;
    }
  } else if (typeof typ === "object" && typ.literal !== undefined) {
    return typ.literal;
  } else {
    return typeof typ;
  }
}

function jsonToJSProps(typ: any): any {
  if (typ.jsonToJS === undefined) {
    const map: any = {};
    typ.props.forEach((p: any) => map[p.json] = { key: p.js, typ: p.typ });
    typ.jsonToJS = map;
  }
  return typ.jsonToJS;
}

function jsToJSONProps(typ: any): any {
  if (typ.jsToJSON === undefined) {
    const map: any = {};
    typ.props.forEach((p: any) => map[p.js] = { key: p.json, typ: p.typ });
    typ.jsToJSON = map;
  }
  return typ.jsToJSON;
}

function transform(
  val: any,
  typ: any,
  getProps: any,
  key: any = "",
  parent: any = "",
): any {
  function transformPrimitive(typ: string, val: any): any {
    if (typeof typ === typeof val) return val;
    return invalidValue(typ, val, key, parent);
  }

  function transformUnion(typs: any[], val: any): any {
    // val must validate against one typ in typs
    const l = typs.length;
    for (let i = 0; i < l; i++) {
      const typ = typs[i];
      try {
        return transform(val, typ, getProps);
      } catch (_) {
        // No comment
      }
    }
    return invalidValue(typs, val, key, parent);
  }

  function transformEnum(cases: string[], val: any): any {
    if (cases.indexOf(val) !== -1) return val;
    return invalidValue(
      cases.map((a) => {
        return l(a);
      }),
      val,
      key,
      parent,
    );
  }

  function transformArray(typ: any, val: any): any {
    // val must be an array with no invalid elements
    if (!Array.isArray(val)) return invalidValue(l("array"), val, key, parent);
    return val.map((el) => transform(el, typ, getProps));
  }

  function transformDate(val: any): any {
    if (val === null) {
      return null;
    }
    const d = new Date(val);
    if (isNaN(d.valueOf())) {
      return invalidValue(l("Date"), val, key, parent);
    }
    return d;
  }

  function transformObject(
    props: { [k: string]: any },
    additional: any,
    val: any,
  ): any {
    if (val === null || typeof val !== "object" || Array.isArray(val)) {
      return invalidValue(l(ref || "object"), val, key, parent);
    }
    const result: any = {};
    Object.getOwnPropertyNames(props).forEach((key) => {
      const prop = props[key];
      const v = Object.prototype.hasOwnProperty.call(val, key)
        ? val[key]
        : undefined;
      result[prop.key] = transform(v, prop.typ, getProps, key, ref);
    });
    Object.getOwnPropertyNames(val).forEach((key) => {
      if (!Object.prototype.hasOwnProperty.call(props, key)) {
        result[key] = transform(val[key], additional, getProps, key, ref);
      }
    });
    return result;
  }

  if (typ === "any") return val;
  if (typ === null) {
    if (val === null) return val;
    return invalidValue(typ, val, key, parent);
  }
  if (typ === false) return invalidValue(typ, val, key, parent);
  let ref: any = undefined;
  while (typeof typ === "object" && typ.ref !== undefined) {
    ref = typ.ref;
    typ = typeMap[typ.ref];
  }
  if (Array.isArray(typ)) return transformEnum(typ, val);
  if (typeof typ === "object") {
    return Object.prototype.hasOwnProperty.call(typ, "unionMembers")
      ? transformUnion(typ.unionMembers, val)
      : Object.prototype.hasOwnProperty.call(typ, "arrayItems")
      ? transformArray(typ.arrayItems, val)
      : Object.prototype.hasOwnProperty.call(typ, "props")
      ? transformObject(getProps(typ), typ.additional, val)
      : invalidValue(typ, val, key, parent);
  }
  // Numbers can be parsed by Date but shouldn't be.
  if (typ === Date && typeof val !== "number") return transformDate(val);
  return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
  return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
  return transform(val, typ, jsToJSONProps);
}

function l(typ: any) {
  return { literal: typ };
}

function a(typ: any) {
  return { arrayItems: typ };
}

function u(...typs: any[]) {
  return { unionMembers: typs };
}

function o(props: any[], additional: any) {
  return { props, additional };
}

// Unused:
// function m(additional: any) {
//   return { props: [], additional };
// }

function r(name: string) {
  return { ref: name };
}

const typeMap: any = {
  "FinnAdFetch": o([
    { json: "docs", js: "docs", typ: a(r("PromotedAd")) },
    { json: "filters", js: "filters", typ: a(r("Filter")) },
    { json: "metadata", js: "metadata", typ: r("Metadata") },
    { json: "mapUrl", js: "mapUrl", typ: "" },
    { json: "newMapUrl", js: "newMapUrl", typ: "" },
    { json: "pageMetadata", js: "pageMetadata", typ: r("PageMetadata") },
    { json: "resultHeading", js: "resultHeading", typ: "" },
    { json: "promotedAd", js: "promotedAd", typ: r("PromotedAd") },
  ], false),
  "PromotedAd": o([
    { json: "type", js: "type", typ: r("PromotedAdType") },
    { json: "id", js: "id", typ: "" },
    { json: "main_search_key", js: "main_search_key", typ: r("MainSearchKey") },
    { json: "heading", js: "heading", typ: "" },
    { json: "location", js: "location", typ: "" },
    { json: "image", js: "image", typ: r("PromotedAdImage") },
    { json: "flags", js: "flags", typ: a(r("Flag")) },
    { json: "timestamp", js: "timestamp", typ: 0 },
    { json: "coordinates", js: "coordinates", typ: r("Coordinates") },
    { json: "ad_type", js: "ad_type", typ: 0 },
    { json: "labels", js: "labels", typ: a(r("Label")) },
    { json: "canonical_url", js: "canonical_url", typ: "" },
    { json: "extras", js: "extras", typ: a("any") },
    { json: "price", js: "price", typ: r("Price") },
    { json: "distance", js: "distance", typ: 0 },
    { json: "trade_type", js: "trade_type", typ: r("TradeType") },
    { json: "image_urls", js: "image_urls", typ: a("") },
    { json: "ad_id", js: "ad_id", typ: 0 },
    {
      json: "organisation_name",
      js: "organisation_name",
      typ: u(undefined, ""),
    },
    { json: "fusClickUrl", js: "fusClickUrl", typ: u(undefined, "") },
    { json: "fusViewUrl", js: "fusViewUrl", typ: u(undefined, "") },
    {
      json: "paidPromotions",
      js: "paidPromotions",
      typ: u(undefined, a(r("PaidPromotion"))),
    },
  ], false),
  "Coordinates": o([
    { json: "lat", js: "lat", typ: 3.14 },
    { json: "lon", js: "lon", typ: 3.14 },
  ], false),
  "PromotedAdImage": o([
    { json: "url", js: "url", typ: "" },
    { json: "path", js: "path", typ: "" },
    { json: "height", js: "height", typ: 0 },
    { json: "width", js: "width", typ: 0 },
    { json: "aspect_ratio", js: "aspect_ratio", typ: 3.14 },
  ], false),
  "Label": o([
    { json: "id", js: "id", typ: r("ID") },
    { json: "text", js: "text", typ: r("Text") },
    { json: "type", js: "type", typ: r("LabelType") },
  ], false),
  "PaidPromotion": o([
    { json: "@id", js: "@id", typ: "" },
  ], false),
  "Price": o([
    { json: "amount", js: "amount", typ: 0 },
    { json: "currency_code", js: "currency_code", typ: r("CurrencyCode") },
    { json: "price_unit", js: "price_unit", typ: r("Unit") },
  ], false),
  "Filter": o([
    { json: "display_name", js: "display_name", typ: "" },
    { json: "name", js: "name", typ: r("Name") },
    { json: "filter_items", js: "filter_items", typ: a(r("FilterItem")) },
    { json: "value", js: "value", typ: u(undefined, "") },
    { json: "gs_value", js: "gs_value", typ: u(undefined, "") },
    { json: "type", js: "type", typ: "" },
    { json: "latitude", js: "latitude", typ: u(undefined, "") },
    { json: "longitude", js: "longitude", typ: u(undefined, "") },
    { json: "location_name", js: "location_name", typ: u(undefined, "") },
    { json: "min_value", js: "min_value", typ: u(undefined, 0) },
    { json: "max_value", js: "max_value", typ: u(undefined, 0) },
    { json: "step", js: "step", typ: u(undefined, 0) },
    { json: "unit", js: "unit", typ: u(undefined, r("Unit")) },
    { json: "name_from", js: "name_from", typ: u(undefined, "") },
    { json: "name_to", js: "name_to", typ: u(undefined, "") },
    { json: "is_year", js: "is_year", typ: u(undefined, true) },
  ], false),
  "FilterItem": o([
    { json: "display_name", js: "display_name", typ: "" },
    { json: "name", js: "name", typ: r("Name") },
    { json: "value", js: "value", typ: "" },
    { json: "hits", js: "hits", typ: 0 },
    { json: "selected", js: "selected", typ: true },
    {
      json: "filter_items",
      js: "filter_items",
      typ: u(undefined, a(r("FilterItem"))),
    },
  ], false),
  "Metadata": o([
    { json: "params", js: "params", typ: r("Params") },
    { json: "search_key", js: "search_key", typ: "" },
    {
      json: "selected_filters",
      js: "selected_filters",
      typ: a(r("SelectedFilter")),
    },
    { json: "num_results", js: "num_results", typ: 0 },
    { json: "quest_time", js: "quest_time", typ: 0 },
    { json: "solr_time", js: "solr_time", typ: 0 },
    { json: "solr_elapsed_time", js: "solr_elapsed_time", typ: 0 },
    { json: "result_size", js: "result_size", typ: r("ResultSize") },
    { json: "paging", js: "paging", typ: r("Paging") },
    { json: "title", js: "title", typ: "" },
    { json: "is_savable_search", js: "is_savable_search", typ: true },
    { json: "search_key_description", js: "search_key_description", typ: "" },
    { json: "vertical", js: "vertical", typ: "" },
    { json: "vertical_description", js: "vertical_description", typ: "" },
    { json: "sort", js: "sort", typ: "" },
    { json: "descriptions", js: "descriptions", typ: r("Descriptions") },
    { json: "uuid", js: "uuid", typ: "" },
    { json: "tracking", js: "tracking", typ: r("MetadataTracking") },
    { json: "guided_search", js: "guided_search", typ: r("GuidedSearch") },
    { json: "actions", js: "actions", typ: a("any") },
    { json: "is_end_of_paging", js: "is_end_of_paging", typ: true },
  ], false),
  "Descriptions": o([
    { json: "title", js: "title", typ: "" },
    { json: "heading", js: "heading", typ: "" },
    { json: "saved_search", js: "saved_search", typ: "" },
    { json: "search_key", js: "search_key", typ: "" },
    { json: "vertical", js: "vertical", typ: "" },
    { json: "canonical_search_params", js: "canonical_search_params", typ: "" },
  ], false),
  "GuidedSearch": o([
    { json: "suggestions", js: "suggestions", typ: a(r("Suggestion")) },
    { json: "tracking", js: "tracking", typ: r("GuidedSearchTracking") },
  ], false),
  "Suggestion": o([
    { json: "display_name", js: "display_name", typ: "" },
    { json: "param", js: "param", typ: "" },
    { json: "no_of_hits", js: "no_of_hits", typ: 0 },
    { json: "types", js: "types", typ: a("") },
    { json: "score", js: "score", typ: 3.14 },
    { json: "selected", js: "selected", typ: true },
    { json: "algorithm", js: "algorithm", typ: "" },
    { json: "image", js: "image", typ: r("SuggestionImage") },
    { json: "hash", js: "hash", typ: "" },
    {
      json: "tracking_object",
      js: "tracking_object",
      typ: r("TrackingObject"),
    },
  ], false),
  "SuggestionImage": o([
    { json: "url", js: "url", typ: "" },
    { json: "path", js: "path", typ: "" },
  ], false),
  "TrackingObject": o([
    { json: "query", js: "query", typ: "" },
    { json: "algorithm", js: "algorithm", typ: "" },
    { json: "types", js: "types", typ: a("") },
    { json: "@id", js: "@id", typ: "" },
    { json: "@type", js: "@type", typ: "" },
  ], false),
  "GuidedSearchTracking": o([
    { json: "search", js: "search", typ: r("Search") },
    { json: "vertical", js: "vertical", typ: r("Vertical") },
    { json: "name", js: "name", typ: "" },
    { json: "intent", js: "intent", typ: "" },
    { json: "type", js: "type", typ: "" },
  ], false),
  "Search": o([
    { json: "items", js: "items", typ: a(r("TrackingObject")) },
    { json: "originalQuery", js: "originalQuery", typ: "" },
    { json: "@type", js: "@type", typ: "" },
    { json: "@id", js: "@id", typ: "" },
  ], false),
  "Vertical": o([
    { json: "name", js: "name", typ: "" },
  ], false),
  "Paging": o([
    { json: "param", js: "param", typ: "" },
    { json: "current", js: "current", typ: 0 },
    { json: "last", js: "last", typ: 0 },
  ], false),
  "Params": o([
    { json: "geoLocationName", js: "geoLocationName", typ: a("") },
    { json: "lat", js: "lat", typ: a("") },
    { json: "lon", js: "lon", typ: a("") },
    { json: "q", js: "q", typ: a("") },
    { json: "sub_category", js: "sub_category", typ: a("") },
  ], false),
  "ResultSize": o([
    { json: "match_count", js: "match_count", typ: 0 },
    { json: "group_count", js: "group_count", typ: 0 },
  ], false),
  "SelectedFilter": o([
    { json: "parameters", js: "parameters", typ: a(r("Parameter")) },
    { json: "filter_name", js: "filter_name", typ: r("Name") },
    { json: "display_name", js: "display_name", typ: "" },
    { json: "prefix", js: "prefix", typ: "" },
  ], false),
  "Parameter": o([
    { json: "parameter_name", js: "parameter_name", typ: r("Name") },
    { json: "parameter_value", js: "parameter_value", typ: "" },
  ], false),
  "MetadataTracking": o([
    { json: "object", js: "object", typ: r("Object") },
    { json: "vertical", js: "vertical", typ: r("Vertical") },
  ], false),
  "Object": o([
    { json: "filters", js: "filters", typ: r("Filters") },
    {
      json: "selectionFilters",
      js: "selectionFilters",
      typ: a(r("SelectionFilter")),
    },
    { json: "sortingType", js: "sortingType", typ: "" },
    { json: "numItems", js: "numItems", typ: 0 },
    { json: "pageNumber", js: "pageNumber", typ: 0 },
    { json: "layout", js: "layout", typ: "" },
    { json: "type", js: "type", typ: "" },
  ], false),
  "Filters": o([
    { json: "query", js: "query", typ: "" },
  ], false),
  "SelectionFilter": o([
    { json: "name", js: "name", typ: r("Name") },
    { json: "value", js: "value", typ: "" },
    { json: "valueId", js: "valueId", typ: "" },
  ], false),
  "PageMetadata": o([
    { json: "title", js: "title", typ: "" },
    { json: "description", js: "description", typ: "" },
    { json: "indexDirective", js: "indexDirective", typ: "" },
    { json: "canonicalUrl", js: "canonicalUrl", typ: "" },
    { json: "openGraphUrl", js: "openGraphUrl", typ: "" },
    { json: "jsonLd", js: "jsonLd", typ: r("JSONLd") },
    { json: "image", js: "image", typ: "" },
  ], false),
  "JSONLd": o([
    { json: "@context", js: "@context", typ: "" },
    { json: "@type", js: "@type", typ: "" },
    { json: "url", js: "url", typ: "" },
    {
      json: "mainContentOfPage",
      js: "mainContentOfPage",
      typ: r("MainContentOfPage"),
    },
    { json: "breadcrumb", js: "breadcrumb", typ: r("Breadcrumb") },
    { json: "headline", js: "headline", typ: "" },
  ], false),
  "Breadcrumb": o([
    { json: "@type", js: "@type", typ: "" },
    { json: "name", js: "name", typ: "" },
    {
      json: "itemListElement",
      js: "itemListElement",
      typ: a(r("ItemListElement")),
    },
  ], false),
  "ItemListElement": o([
    { json: "@type", js: "@type", typ: "" },
    { json: "position", js: "position", typ: 0 },
    { json: "item", js: "item", typ: r("Item") },
  ], false),
  "Item": o([
    { json: "@id", js: "@id", typ: "" },
    { json: "name", js: "name", typ: "" },
  ], false),
  "MainContentOfPage": o([
    { json: "@type", js: "@type", typ: "" },
    { json: "cssSelector", js: "cssSelector", typ: "" },
  ], false),
  "Flag": [
    "private",
    "retailer",
    "shipping_exists",
  ],
  "ID": [
    "fiks_ferdig",
    "fus",
    "private",
    "retailer",
  ],
  "Text": [
    "Betalt plassering",
    "Fiks ferdig",
    "Forhandler",
    "Privat",
  ],
  "LabelType": [
    "PRIMARY",
    "SECONDARY",
  ],
  "MainSearchKey": [
    "SEARCH_ID_BAP_ALL",
  ],
  "CurrencyCode": [
    "NOK",
  ],
  "Unit": [
    "kr",
  ],
  "TradeType": [
    "Til salgs",
  ],
  "PromotedAdType": [
    "bap",
  ],
  "Name": [
    "category",
    "condition",
    "dealer_segment",
    "for_rent",
    "location",
    "price",
    "product_category",
    "published",
    "q",
    "radius",
    "shipping_exists",
    "sub_category",
    "trade_type",
  ],
};
