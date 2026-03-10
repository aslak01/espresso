import { test, expect, describe, beforeEach, afterEach, mock } from "bun:test";
import { createRateLimitedQueue } from "./webhook.ts";

const originalFetch = globalThis.fetch;

function mockFetch(status = 200, headers: Record<string, string> = {}) {
	const headerMap = new Headers(headers);
	const fn = mock(() =>
		Promise.resolve({
			ok: status >= 200 && status < 300,
			status,
			statusText: status === 200 ? "OK" : "Bad Request",
			headers: headerMap,
		} as Response),
	);
	globalThis.fetch = fn;
	return fn;
}

afterEach(() => {
	globalThis.fetch = originalFetch;
});

describe("createRateLimitedQueue", () => {
	test("sends POST with JSON body to the correct URL", async () => {
		const fetchMock = mockFetch(200, {
			"X-RateLimit-Limit": "5",
			"X-RateLimit-Remaining": "4",
			"X-RateLimit-Reset": "0",
		});
		const queue = createRateLimitedQueue("https://discord.com/api/webhooks/test");

		await queue.enqueueBatch([{ content: "hello" }]);

		expect(fetchMock).toHaveBeenCalledTimes(1);
		const call = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
		expect(call[0]).toBe("https://discord.com/api/webhooks/test");
		expect(call[1].method).toBe("POST");
		expect(call[1].headers).toEqual({ "Content-Type": "application/json" });
		expect(call[1].body).toBe(JSON.stringify({ content: "hello" }));
	});

	test("sends multiple items sequentially", async () => {
		const fetchMock = mockFetch(200, {
			"X-RateLimit-Limit": "5",
			"X-RateLimit-Remaining": "4",
			"X-RateLimit-Reset": "0",
		});
		const queue = createRateLimitedQueue("https://example.com/webhook");

		await queue.enqueueBatch([{ content: "a" }, { content: "b" }, { content: "c" }]);

		expect(fetchMock).toHaveBeenCalledTimes(3);
	});

	test("resolves immediately for empty items", async () => {
		const fetchMock = mockFetch();
		const queue = createRateLimitedQueue("https://example.com/webhook");

		await queue.enqueueBatch([]);

		expect(fetchMock).not.toHaveBeenCalled();
	});

	test("logs error on non-ok response", async () => {
		mockFetch(400, {
			"X-RateLimit-Limit": "5",
			"X-RateLimit-Remaining": "4",
			"X-RateLimit-Reset": "0",
		});
		const errorSpy = mock(() => {});
		const origError = console.error;
		console.error = errorSpy;

		const queue = createRateLimitedQueue("https://example.com/webhook");
		await queue.enqueueBatch([{ content: "bad" }]);

		expect(errorSpy).toHaveBeenCalled();
		const msg = (errorSpy.mock.calls[0] as unknown as [string])[0];
		expect(msg).toContain("400");

		console.error = origError;
	});
});
