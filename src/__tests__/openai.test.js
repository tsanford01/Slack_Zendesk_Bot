const createMock = jest.fn();

jest.mock('openai', () => ({ OpenAI: jest.fn() }));

const { OpenAI } = require('openai');
const OpenAIClient = require('../openai');

describe('OpenAIClient', () => {
  beforeEach(() => {
    createMock.mockReset();
    OpenAI.mockImplementation(() => ({
      chat: { completions: { create: createMock } }
    }));
  });

  describe('summarizeTicket', () => {
    test('returns summary from OpenAI response', async () => {
      const expected = 'A short summary.';
      createMock.mockResolvedValue({
        choices: [{ message: { content: expected } }]
      });

      const client = new OpenAIClient('fake-key');
      const ticket = { id: 1, subject: 'Bug', status: 'open', priority: 'high', description: 'Details' };

      const summary = await client.summarizeTicket(ticket, []);
      expect(createMock).toHaveBeenCalled();
      expect(summary).toBe(expected);
    });
  });

  describe('prepareConversationHistory', () => {
    test('formats ticket and comments into history', () => {
      const client = new OpenAIClient('fake-key');
      const ticket = {
        id: 1,
        subject: 'Bug report',
        status: 'open',
        priority: 'high',
        description: 'Something is broken'
      };
      const comments = [
        { author: 'Alice', body: 'First comment', public: true },
        { author: 'Bob', body: 'Private comment', public: false },
        { author: 'Charlie', body: 'Another comment', public: true }
      ];

      const history = client.prepareConversationHistory(ticket, comments);

      expect(history).toContain('TICKET #1: Bug report');
      expect(history).toContain('Status: open');
      expect(history).toContain('Priority: high');
      expect(history).toContain('Initial Description:\nSomething is broken');
      expect(history).toContain('Conversation:');
      expect(history).toContain('From: Alice');
      expect(history).toContain('First comment');
      expect(history).toContain('From: Charlie');
      expect(history).toContain('Another comment');
      expect(history).not.toContain('Private comment');
    });
  });

  describe('generateSummaryBlocks', () => {
    test('produces Slack blocks with ticket information', async () => {
      const client = new OpenAIClient('fake-key');
      const ticket = { id: 42, subject: 'Important bug', url: 'https://example.com/tickets/42' };
      const blocks = await client.generateSummaryBlocks(ticket, 'Summary here');

      expect(Array.isArray(blocks)).toBe(true);
      expect(blocks[0].text.text).toBe('📝 Summary of Ticket #42');
      expect(blocks[1].text.text).toBe('*Original Subject:* Important bug');
      expect(blocks[3].text.text).toBe('Summary here');
      expect(blocks[4].elements[0].text).toContain(`<${ticket.url}|View the full ticket in Zendesk>`);
    });
  });
});
