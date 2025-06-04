const mockZendesk = {
  getTicket: jest.fn(),
  getTicketComments: jest.fn(),
  searchTickets: jest.fn(),
  formatTicketForSlack: jest.fn()
};

jest.mock('../../zendesk', () => jest.fn(() => mockZendesk));

const mockOpenAI = {
  summarizeTicket: jest.fn(),
  generateSummaryBlocks: jest.fn()
};

jest.mock('../../openai', () => jest.fn(() => mockOpenAI));

process.env.ZENDESK_DOMAIN = 'test.zendesk.com';
process.env.ZENDESK_EMAIL = 'test@example.com';
process.env.ZENDESK_API_TOKEN = 'token';
process.env.OPENAI_API_KEY = 'key';

const { ticketDetails, ticketSummary, searchTickets } = require('../commands');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Slack Commands Success', () => {
  test('ticketDetails responds with formatted blocks for valid ID', async () => {
    const formatted = { blocks: [{ type: 'header', text: { type: 'plain_text', text: 'Ticket' } }] };
    mockZendesk.getTicket.mockResolvedValue({ id: '1' });
    mockZendesk.formatTicketForSlack.mockReturnValue(formatted);

    const ack = jest.fn();
    const respond = jest.fn();
    await ticketDetails({ command: { text: '1' }, ack, respond });

    expect(ack).toHaveBeenCalled();
    expect(respond).toHaveBeenCalledWith(formatted);
  });

  test('ticketSummary returns summary blocks for valid ID', async () => {
    const blocks = [{ type: 'section', text: { type: 'mrkdwn', text: 'summary' } }];
    mockZendesk.getTicket.mockResolvedValue({ id: '2', subject: 'Bug' });
    mockZendesk.getTicketComments.mockResolvedValue([]);
    mockOpenAI.summarizeTicket.mockResolvedValue('summary');
    mockOpenAI.generateSummaryBlocks.mockResolvedValue(blocks);

    const ack = jest.fn();
    const respond = jest.fn();
    await ticketSummary({ command: { text: '2' }, ack, respond });

    expect(ack).toHaveBeenCalled();
    expect(respond).toHaveBeenNthCalledWith(1, {
      text: '🎫 Fetching ticket #2 and generating summary...'
    });
    expect(respond).toHaveBeenNthCalledWith(2, { replace_original: true, blocks });
  });

  test('searchTickets responds with results when query valid', async () => {
    const results = [{ id: 5, subject: 'Hello', status: 'new', url: 'https://t/5', createdAt: '2024-01-01T00:00:00Z' }];
    mockZendesk.searchTickets.mockResolvedValue({ results, count: 1 });

    const ack = jest.fn();
    const respond = jest.fn();
    await searchTickets({ command: { text: 'he' }, ack, respond });

    expect(ack).toHaveBeenCalled();
    expect(respond).toHaveBeenCalledWith(
      expect.objectContaining({ blocks: expect.any(Array) })
    );
    expect(respond.mock.calls[0][0].blocks[0].text.text).toContain('Found 1 ticket');
  });
});
