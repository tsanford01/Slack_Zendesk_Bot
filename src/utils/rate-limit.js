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
    const validRequests = userRequests.filter(timestamp => 
      now - timestamp < this.timeWindowMs
    );

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
    const userRequests = this.requests.get(userId) || [];
    if (userRequests.length === 0) return 0;

    const oldestRequest = userRequests[0];
    const timeUntilReset = this.timeWindowMs - (Date.now() - oldestRequest);
    return Math.max(0, timeUntilReset);
  }
}

module.exports = RateLimiter;
