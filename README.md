# Slack Zendesk Bot

A powerful Slack bot that integrates with Zendesk for ticket management and provides AI-powered summaries using OpenAI's GPT-4.

## Features

- 🎫 View detailed Zendesk ticket information
- 🤖 Generate AI-powered summaries of ticket conversations
- 🔍 Search Zendesk tickets directly from Slack
- 📚 Comprehensive help system
- ⚡ Rate limiting for API protection
- 🎨 Beautiful, interactive message formatting

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Slack App credentials
- Zendesk API credentials
- OpenAI API key

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Slack_Zendesk_Bot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment template and fill in your credentials:
   ```bash
   cp .env.template .env
   ```

4. Configure your environment variables in `.env`:
   ```
   SLACK_BOT_TOKEN=xoxb-your-token
   SLACK_SIGNING_SECRET=your-signing-secret
    ZENDESK_DOMAIN=your-subdomain.zendesk.com
    ZENDESK_EMAIL=your-email
    ZENDESK_API_TOKEN=your-api-token
    OPENAI_API_KEY=your-openai-api-key
    OPENAI_MODEL=
    PORT=3000
    ```

## Development

Start the development server with hot reloading:
```bash
npm run dev
```

Run tests:
```bash
npm test                 # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage report
```

Run linting using ESLint:
```bash
npm run lint
```
The linter configuration is defined in `.eslintrc.json` and extends
`eslint:recommended` with Node and Jest environments.

## Available Commands

### /ticket-details [TICKET_ID]
View detailed information about a specific Zendesk ticket.
```
/ticket-details 12345
```

### /ticket-summary [TICKET_ID]
Get an AI-generated summary of a ticket conversation.
```
/ticket-summary 12345
```

### /search-tickets [KEYWORDS]
Search for Zendesk tickets using keywords.
```
/search-tickets login issue
```

### /help [COMMAND]
Get help about available commands or specific command usage.
```
/help
/help ticket-summary
```

## Project Structure

```
Slack_Zendesk_Bot/
├── src/
│   ├── slack/          # Slack-related functionality
│   │   ├── commands.js # Command implementations
│   │   ├── help.js    # Help system
│   │   └── middleware.js
│   ├── utils/          # Utility functions
│   │   ├── validation.js
│   │   └── rate-limit.js
│   ├── zendesk.js     # Zendesk API client
│   └── openai.js      # OpenAI API client
├── app.js             # Main application
├── package.json       # Dependencies and scripts
└── .env.template      # Environment variables template
```

## Testing

The project includes comprehensive tests for all major components:

- Unit tests for utility functions
- Integration tests for API clients
- Command handling tests
- Rate limiting tests

Run the test suite:
```bash
npm test
```

View test coverage:
```bash
npm run test:coverage
```

## Rate Limiting

The bot implements rate limiting to prevent API abuse:
- 10 requests per minute per user
- Separate limits for each user
- Clear error messages with waiting time

## Error Handling

The bot provides clear error messages for common issues:
- Invalid ticket IDs
- Rate limiting
- API errors
- Missing permissions
- Invalid commands

## Contributing

1. Fork the repository
2. Create your feature branch
3. Write tests for your changes
4. Ensure all tests pass
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please:
1. Check the `/help` command in Slack
2. Review this documentation
3. Open an issue on GitHub

## Security

- Never commit your `.env` file
- Regularly rotate API keys
- Use appropriate Slack app scopes
- Monitor rate limiting and usage

## Deployment

For production deployment:
1. Set up your hosting environment (e.g., AWS, Heroku)
2. Configure environment variables
3. Set up monitoring and logging
4. Configure your domain and SSL
5. Update Slack app configuration with production URLs
