const errorHandler = async ({ error, logger }) => {
  // Log the error
  logger.error({
    message: 'An error occurred',
    error: error.message,
    stack: error.stack
  });

  // You could add additional error reporting here (e.g., to a monitoring service)
  console.error('Slack Bot Error:', error);
};

const logMiddleware = async ({ logger, context, next }) => {
  // Record start time for logging
  const startTime = new Date().getTime();
  
  // Continue processing the request
  await next();
  
  // Log request completion time
  const endTime = new Date().getTime();
  logger.info({
    message: 'Request processed',
    processingTime: `${endTime - startTime}ms`,
    type: context.type,
    user: context.user_id
  });
};

module.exports = {
  errorHandler,
  logMiddleware
};
