const ZendeskClient = require('../zendesk');

describe('ZendeskClient', () => {
  describe('searchTickets', () => {
    test('should include correct domain in ticket URLs', async () => {
      const client = new ZendeskClient('example.zendesk.com', 'user@example.com', 'token');

      // Mock makeRequest to return a fake search response
      client.makeRequest = jest.fn().mockResolvedValue({
        results: [
          {
            id: 123,
            subject: 'Test',
            description: 'Desc',
            status: 'open',
            priority: 'normal',
            requester_id: 1,
            assignee_id: 2,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-02T00:00:00Z',
            tags: ['sample']
          }
        ],
        count: 1
      });

      const { results } = await client.searchTickets('test');
      expect(results[0].url).toBe('https://example.zendesk.com/agent/tickets/123');
    });
  });
});
