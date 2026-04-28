import { test, expect, describe } from "bun:test";
import { decodeTurboStream } from "./turbo_stream.ts";

describe("decodeTurboStream", () => {
	test("resolves keys and values via index references", () => {
		// {"name": "Aslak", "age": 31}
		const wire: unknown[] = [
			{ _1: 2, _3: 4 }, // 0: root
			"name", // 1
			"Aslak", // 2
			"age", // 3
			31, // 4
		];
		expect(decodeTurboStream(wire)).toEqual({ name: "Aslak", age: 31 });
	});

	test("resolves nested objects", () => {
		// {"a": {"b": 1}}
		const wire: unknown[] = [{ _1: 2 }, "a", { _3: 4 }, "b", 1];
		expect(decodeTurboStream(wire)).toEqual({ a: { b: 1 } });
	});

	test("resolves arrays through index references", () => {
		// {"docs": [10, 20]}
		const wire: unknown[] = [{ _1: 2 }, "docs", [3, 4], 10, 20];
		expect(decodeTurboStream(wire)).toEqual({ docs: [10, 20] });
	});

	test("memoises shared references", () => {
		// {"a": <obj>, "b": <same obj>}
		const wire: unknown[] = [{ _1: 3, _2: 3 }, "a", "b", { _4: 5 }, "v", 1];
		const out = decodeTurboStream(wire) as Record<string, object>;
		expect(out.a).toEqual({ v: 1 });
		expect(out.a).toBe(out.b);
	});

	test("collapses negative-index sentinels to null", () => {
		// {"x": <sentinel>}
		const wire: unknown[] = [{ _1: -7 }, "x"];
		expect(decodeTurboStream(wire)).toEqual({ x: null });
	});

	test("handles literal values inline (non-_ keys)", () => {
		// objects that already include resolved values pass through
		const wire: unknown[] = [{ literal: "value", _1: 2 }, "k", "v"];
		expect(decodeTurboStream(wire)).toEqual({
			literal: "value",
			k: "v",
		});
	});
});
