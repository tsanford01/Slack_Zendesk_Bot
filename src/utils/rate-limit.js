class RateLimiter {
  constructor(maxRequests = 10, timeWindowMs = 60000) { // Default: 10 requests per minute
    this.maxRequests = maxRequests;
    this.timeWindowMs = timeWindowMs;
    this.requests = new Map(); // userId -> [timestamps]
  }

  isRateLimited(userId) {
    const now = Date.now();
    const userRequests = this.requests.get(userId) || [];

    // Remove old requests outside the time window
    const validRequests = userRequests.filter(
      (timestamp) => now - timestamp < this.timeWindowMs
    );

    // Update stored requests with cleaned list or delete if none left
    if (validRequests.length === 0) {
      this.requests.delete(userId);
    } else {
      this.requests.set(userId, validRequests);
    }

    // Check if user has exceeded rate limit
    if (validRequests.length >= this.maxRequests) {
      return true;
    }

    // Add new request
    validRequests.push(now);
    this.requests.set(userId, validRequests);
    return false;
  }

  getRemainingTime(userId) {
    const now = Date.now();
    const userRequests = this.requests.get(userId) || [];

    // Remove outdated requests and update store
    const validRequests = userRequests.filter(
      (timestamp) => now - timestamp < this.timeWindowMs
    );

    if (validRequests.length === 0) {
      this.requests.delete(userId);
      return 0;
    }

    this.requests.set(userId, validRequests);


    const oldestRequest = validRequests[0];
    const timeUntilReset = this.timeWindowMs - (now - oldestRequest);
    return Math.max(0, timeUntilReset);
  }
}

module.exports = RateLimiter;
