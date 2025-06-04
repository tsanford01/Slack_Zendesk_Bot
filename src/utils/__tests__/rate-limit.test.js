const RateLimiter = require('../rate-limit');

// Ensure real timers are used as other test suites may enable fake timers
jest.useRealTimers();

describe('RateLimiter', () => {
  let rateLimiter;
  const userId = 'test-user';

  beforeEach(() => {
    // Create a new rate limiter for each test with 2 requests per 100ms
    rateLimiter = new RateLimiter(2, 100);
  });

  test('should allow requests within limit', () => {
    expect(rateLimiter.isRateLimited(userId)).toBe(false);
    expect(rateLimiter.isRateLimited(userId)).toBe(false);
  });

  test('should block requests over limit', () => {
    expect(rateLimiter.isRateLimited(userId)).toBe(false);
    expect(rateLimiter.isRateLimited(userId)).toBe(false);
    expect(rateLimiter.isRateLimited(userId)).toBe(true);
  });

  test('should handle multiple users independently', () => {
    const user1 = 'user1';
    const user2 = 'user2';

    expect(rateLimiter.isRateLimited(user1)).toBe(false);
    expect(rateLimiter.isRateLimited(user1)).toBe(false);
    expect(rateLimiter.isRateLimited(user1)).toBe(true);

    // Different user should not be affected
    expect(rateLimiter.isRateLimited(user2)).toBe(false);
    expect(rateLimiter.isRateLimited(user2)).toBe(false);
  });

  test('should reset after time window', async () => {
    expect(rateLimiter.isRateLimited(userId)).toBe(false);
    expect(rateLimiter.isRateLimited(userId)).toBe(false);
    expect(rateLimiter.isRateLimited(userId)).toBe(true);

    // Wait for the time window to pass
    await new Promise(resolve => setTimeout(resolve, 100));

    // Should be able to make requests again
    expect(rateLimiter.isRateLimited(userId)).toBe(false);
  });

  test('should calculate remaining time correctly', () => {
    rateLimiter.isRateLimited(userId);
    const remainingTime = rateLimiter.getRemainingTime(userId);

    expect(remainingTime).toBeGreaterThan(0);
    expect(remainingTime).toBeLessThanOrEqual(100);
  });

  test('should clean expired requests after limit is reached', async () => {
    // Hit the limit
    expect(rateLimiter.isRateLimited(userId)).toBe(false);
    expect(rateLimiter.isRateLimited(userId)).toBe(false);
    expect(rateLimiter.isRateLimited(userId)).toBe(true);

    // Wait for the time window to pass
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Remaining time should be zero once requests have expired
    expect(rateLimiter.getRemainingTime(userId)).toBe(0);
    expect(rateLimiter.isRateLimited(userId)).toBe(false);
  });


  test('should return 0 remaining time with no requests or after window', async () => {
    // No requests made yet
    expect(rateLimiter.getRemainingTime(userId)).toBe(0);

    // Make a request and wait for the window to expire
    rateLimiter.isRateLimited(userId);
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(rateLimiter.getRemainingTime(userId)).toBe(0);
  });

});
