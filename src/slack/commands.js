const ZendeskClient = require('../zendesk');
const OpenAIClient = require('../openai');
const {
  isValidTicketId,
  validateSearchQuery,
  formatErrorMessage
} = require('../utils/validation');

// Initialize clients
const zendesk = new ZendeskClient(
  process.env.ZENDESK_DOMAIN,
  process.env.ZENDESK_EMAIL,
  process.env.ZENDESK_API_TOKEN
);

const openai = new OpenAIClient(process.env.OPENAI_API_KEY);

const ticketDetails = async ({ command, ack, respond }) => {
  await ack();
  try {
    const ticketId = command.text.trim();
    if (!isValidTicketId(ticketId)) {
      await respond(formatErrorMessage('Invalid ticket ID', 'ticket-details'));
      return;
    }

    // Fetch ticket details from Zendesk
    const ticket = await zendesk.getTicket(ticketId);
    
    // Format and send the response
    await respond(zendesk.formatTicketForSlack(ticket));
  } catch (error) {
    console.error('Error in ticket-details command:', error);
    await respond({
      text: error.message.includes('not found')
        ? `❌ Ticket ${command.text.trim()} not found`
        : "❌ Sorry, something went wrong while fetching the ticket details."
    });
  }
};

const ticketSummary = async ({ command, ack, respond }) => {
  await ack();
  try {
    const ticketId = command.text.trim();
    if (!isValidTicketId(ticketId)) {
      await respond(formatErrorMessage('Invalid ticket ID', 'ticket-summary'));
      return;
    }

    // Send initial response
    await respond({
      text: `🎫 Fetching ticket #${ticketId} and generating summary...`
    });

    // Fetch ticket and comments in parallel
    const [ticket, comments] = await Promise.all([
      zendesk.getTicket(ticketId),
      zendesk.getTicketComments(ticketId)
    ]);

    // Generate AI summary
    const summary = await openai.summarizeTicket(ticket, comments);
    
    // Format and send the summary
    const blocks = await openai.generateSummaryBlocks(ticket, summary);
    
    // Update the message with the summary
    await respond({
      replace_original: true,
      blocks
    });
  } catch (error) {
    console.error('Error in ticket-summary command:', error);
    await respond({
      replace_original: true,
      text: error.message.includes('not found')
        ? `❌ Ticket ${command.text.trim()} not found`
        : "❌ Sorry, something went wrong while generating the ticket summary."
    });
  }
};

const searchTickets = async ({ command, ack, respond }) => {
  await ack();
  try {
    const { isValid, cleaned, error } = validateSearchQuery(command.text);
    if (!isValid) {
      await respond(formatErrorMessage(error, 'search-tickets'));
      return;
    }
    const searchQuery = cleaned;

    // Search tickets in Zendesk
    const { results, count } = await zendesk.searchTickets(searchQuery);
    
    if (results.length === 0) {
      await respond({
        text: `No tickets found matching: "${searchQuery}"`
      });
      return;
    }

    // Format the search results
    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `🔍 Found ${count} ticket${count === 1 ? '' : 's'} matching: "${searchQuery}"`,
          emoji: true
        }
      }
    ];

    // Add each ticket as a section
    results.forEach(ticket => {
      blocks.push(
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*<${ticket.url}|#${ticket.id}: ${ticket.subject}>*\n${ticket.status} • Created: <!date^${Math.floor(new Date(ticket.createdAt).getTime()/1000)}^{date_short}|${ticket.createdAt}>`
          }
        }
      );
    });

    if (count > results.length) {
      blocks.push({
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `_Showing ${results.length} of ${count} matches. View all results in <https://${process.env.ZENDESK_DOMAIN}/agent/search?q=${encodeURIComponent(searchQuery)}|Zendesk>_`
          }
        ]
      });
    }

    await respond({ blocks });
  } catch (error) {
    console.error('Error in search-tickets command:', error);
    await respond({
      text: "❌ Sorry, something went wrong while searching for tickets."
    });
  }
};

module.exports = {
  ticketDetails,
  ticketSummary,
  searchTickets
};
