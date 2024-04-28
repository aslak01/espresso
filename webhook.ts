type RateLimitInfo = {
  limit: number;
  remaining: number;
  reset: number; // Time when the rate limit will reset
};

export function createRateLimitedQueue(url: string) {
  const queue: (() => Promise<void>)[] = [];
  let rateLimitInfo: RateLimitInfo | null = null;
  let isWaiting = false;
  let resolveAll: (() => void) | null = null;

  const processQueue = async () => {
    if (queue.length === 0) {
      if (resolveAll) resolveAll();
      return;
    }

    if (
      isWaiting ||
      (rateLimitInfo && rateLimitInfo.remaining === 0 &&
        Date.now() < rateLimitInfo.reset * 1000)
    ) {
      setTimeout(processQueue, 500);
      return;
    }

    isWaiting = false;
    const task = queue.shift();
    if (task) {
      await task();
      processQueue();
    }
  };

  const updateRateLimitInfo = (headers: Headers) => {
    const limit = headers.get("X-RateLimit-Limit");
    const remaining = headers.get("X-RateLimit-Remaining");
    const reset = headers.get("X-RateLimit-Reset");

    if (limit && remaining && reset) {
      rateLimitInfo = {
        limit: Number(limit),
        remaining: Number(remaining),
        reset: Number(reset),
      };
    }

    if (rateLimitInfo && rateLimitInfo.remaining === 0) {
      const currentTime = Date.now();
      const resetTime = rateLimitInfo.reset * 1000;
      if (currentTime < resetTime) {
        isWaiting = true;
        const delay = resetTime - currentTime;
        console.log(`Rate limited. Waiting for ${delay} ms.`);
        setTimeout(() => {
          isWaiting = false;
          processQueue();
        }, delay);
      }
    }
  };

  const enqueueBatch = (items: unknown[]): Promise<void> => {
    for (const item of items) {
      const task = async () => {
        const response = await fetch(`${url}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        });
        updateRateLimitInfo(response.headers);
      };
      queue.push(task);
    }

    return new Promise((resolve) => {
      resolveAll = resolve;
      processQueue();
    });
  };

  return {
    enqueueBatch,
  };
}
