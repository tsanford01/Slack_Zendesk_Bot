require('dotenv').config();

// List of required environment variables
const requiredEnvVars = [
  'SLACK_BOT_TOKEN',
  'SLACK_SIGNING_SECRET',
  'ZENDESK_DOMAIN',
  'ZENDESK_EMAIL',
  'ZENDESK_API_TOKEN',
  'OPENAI_API_KEY'
];

// Check that all required environment variables are present
function checkEnvVars() {
  const missing = requiredEnvVars.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    console.error(`Missing environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
}

checkEnvVars();

const { App, LogLevel } = require('@slack/bolt');
const { ticketDetails, ticketSummary, searchTickets } = require('./src/slack/commands');
const { errorHandler, logMiddleware } = require('./src/slack/middleware');
const { helpCommand } = require('./src/slack/help');
const RateLimiter = require('./src/utils/rate-limit');

// Initialize rate limiter (10 requests per minute per user)
const rateLimiter = new RateLimiter(10, 60000);

// Initialize Slack app with more detailed configuration
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  logLevel: LogLevel.INFO,
  customRoutes: [
    {
      path: '/health',
      method: ['GET'],
      handler: (req, res) => {
        res.writeHead(200);
        res.end('Health check OK');
      },
    },
  ],
});

// Register middleware
app.use(logMiddleware);

// Rate limiting middleware
app.use(async ({ payload, next }) => {
  const userId = payload.user_id;
  if (rateLimiter.isRateLimited(userId)) {
    const remainingTime = Math.ceil(rateLimiter.getRemainingTime(userId) / 1000);
    const message = `⚠️ Rate limit exceeded. Please try again in ${remainingTime} seconds.`;
    throw new Error(message);
  }
  await next();
});

// Register commands
app.command('/ticket-details', ticketDetails);
app.command('/ticket-summary', ticketSummary);
app.command('/search-tickets', searchTickets);
app.command('/help', helpCommand);

// Health check message
app.message('ping', async ({ say }) => {
  await say({
    text: 'pong',
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '🏓 pong! Bot is alive and well!'
        }
      }
    ]
  });
});

// Error handler
app.error(errorHandler);

// Start the app
(async () => {
  try {
    const port = process.env.PORT || 3000;
    await app.start(port);
    console.log(`⚡️ Slack Zendesk Bot is running on port ${port}!`);
    console.log('🔗 Available commands: /ticket-details, /ticket-summary, /search-tickets, /help');
  } catch (error) {
    console.error('Failed to start app:', error);
    process.exit(1);
  }
})();
