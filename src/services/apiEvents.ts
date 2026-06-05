export class RateLimitError extends Error {
  retryAfter?: number;
  constructor(message = "Too many requests. Please slow down.", retryAfter?: number) {
    super(message);
    this.name = "RateLimitError";
    this.retryAfter = retryAfter;
  }
}

type ApiEventCallback = (error: RateLimitError) => void;
const listeners = new Set<ApiEventCallback>();

export function onRateLimit(cb: ApiEventCallback) {
  listeners.add(cb);
  return (): void => { listeners.delete(cb); };
}

export function emitRateLimit(error: RateLimitError) {
  listeners.forEach((cb) => cb(error));
}

export async function handleApiResponse(response: Response): Promise<Response> {
  if (response.status === 429) {
    const retryAfter = response.headers.get("Retry-After");
    const err = new RateLimitError(
      "Too many requests. Please wait a moment before trying again.",
      retryAfter ? parseInt(retryAfter, 10) : undefined
    );
    emitRateLimit(err);
    throw err;
  }
  return response;
}
