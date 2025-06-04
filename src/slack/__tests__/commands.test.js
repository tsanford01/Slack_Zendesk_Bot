process.env.OPENAI_API_KEY = 'test';
const { ticketDetails, ticketSummary, searchTickets } = require('../commands');
const { formatErrorMessage } = require('../../utils/validation');

describe('Slack Command Validation', () => {
  test('ticketDetails responds with error on invalid ticket ID', async () => {
    const ack = jest.fn();
    const respond = jest.fn();
    await ticketDetails({ command: { text: 'abc' }, ack, respond });
    expect(ack).toHaveBeenCalled();
    expect(respond).toHaveBeenCalledWith(
      formatErrorMessage('Invalid ticket ID', 'ticket-details')
    );
  });

  test('ticketSummary responds with error on invalid ticket ID', async () => {
    const ack = jest.fn();
    const respond = jest.fn();
    await ticketSummary({ command: { text: '' }, ack, respond });
    expect(ack).toHaveBeenCalled();
    expect(respond).toHaveBeenCalledWith(
      formatErrorMessage('Invalid ticket ID', 'ticket-summary')
    );
  });

  test('searchTickets responds with error on invalid query', async () => {
    const ack = jest.fn();
    const respond = jest.fn();
    await searchTickets({ command: { text: 'a' }, ack, respond });
    expect(ack).toHaveBeenCalled();
    expect(respond).toHaveBeenCalledWith(
      formatErrorMessage(
        'Search query must be at least 2 characters long',
        'search-tickets'
      )
    );
  });
});
