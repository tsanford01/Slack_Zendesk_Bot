/**
 * Validates a Zendesk ticket ID
 * @param {string} ticketId - The ticket ID to validate
 * @returns {boolean} - Whether the ticket ID is valid
 */
const isValidTicketId = (ticketId) => {
  return /^\d+$/.test(ticketId.trim());
};

/**
 * Validates search query
 * @param {string} query - The search query to validate
 * @returns {object} - Validation result and cleaned query
 */
const validateSearchQuery = (query) => {
  const cleaned = query.trim();
  return {
    isValid: cleaned.length >= 2, // Minimum 2 characters
    cleaned,
    error: cleaned.length < 2 ? 'Search query must be at least 2 characters long' : null
  };
};

/**
 * Formats error messages for Slack
 * @param {string} message - The error message
 * @param {string} command - The command that caused the error
 * @returns {object} - Formatted Slack message
 */
const formatErrorMessage = (message, command) => {
  return {
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `❌ *Error:* ${message}`
        }
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Type \`/help ${command}\` for usage information`
          }
        ]
      }
    ]
  };
};

module.exports = {
  isValidTicketId,
  validateSearchQuery,
  formatErrorMessage
};
