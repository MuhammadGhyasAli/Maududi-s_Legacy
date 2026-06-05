import { RateLimitError, onRateLimit, emitRateLimit, handleApiResponse } from '../services/apiEvents';

describe('apiEvents', () => {
  describe('RateLimitError', () => {
    it('creates error with default message', () => {
      const err = new RateLimitError();
      expect(err.message).toBe('Too many requests. Please slow down.');
      expect(err.name).toBe('RateLimitError');
    });

    it('creates error with custom message and retry-after', () => {
      const err = new RateLimitError('Custom message', 30);
      expect(err.message).toBe('Custom message');
      expect(err.retryAfter).toBe(30);
    });
  });

  describe('onRateLimit / emitRateLimit', () => {
    it('calls registered listeners', () => {
      const listener = jest.fn();
      const unsub = onRateLimit(listener);

      const err = new RateLimitError();
      emitRateLimit(err);

      expect(listener).toHaveBeenCalledWith(err);
      unsub();
    });

    it('stops calling after unsubscribe', () => {
      const listener = jest.fn();
      const unsub = onRateLimit(listener);
      unsub();

      emitRateLimit(new RateLimitError());
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('handleApiResponse', () => {
    it('passes through non-429 responses', async () => {
      const res = new Response(null, { status: 200 });
      const result = await handleApiResponse(res);
      expect(result.status).toBe(200);
    });

    it('throws RateLimitError on 429', async () => {
      const res = new Response(null, { status: 429, headers: { 'Retry-After': '60' } });
      await expect(handleApiResponse(res)).rejects.toThrow(RateLimitError);
    });
  });
});
