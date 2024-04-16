import { assert } from "jsr:@std/assert@^0.222.1/assert";

export async function readInput<T>(
  link: string,
  parser: (data: unknown) => T | null,
) {
  const fetched = await fetch(link);
  assert(fetched, "No data got fetched.");

  const parsed = parser(fetched);
  assert(parsed, "Data couldn't be parsed");

  return parsed;
}
