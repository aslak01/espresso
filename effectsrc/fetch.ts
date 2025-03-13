import { HttpClient } from "@effect/platform/HttpClient";
import type { HttpClientError } from "@effect/platform/HttpClientError";
import { Effect, Schedule } from "effect";
import type { TimeoutException } from "effect/Cause";

const getTodo = (
	id: number,
): Effect.Effect<unknown, HttpClientError | TimeoutException> =>
	httpClient.get(`/todos/${id}`).pipe(
		Effect.andThen((response) => response.json),
		Effect.scoped,
		Effect.timeout("1 second"),
		Effect.retry({
			schedule: Schedule.exponential(1000),
			times: 3,
		}),
		Effect.withSpan("getTodo", { attributes: { id } }),
	);
