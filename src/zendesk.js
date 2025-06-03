// Zendesk API client wrapper
const fetch = require('node-fetch');

class ZendeskClient {
  constructor(domain, email, apiToken) {
    this.domain = domain;
    this.email = email;
    this.apiToken = apiToken;
    this.auth = Buffer.from(`${email}/token:${apiToken}`).toString('base64');
    this.baseUrl = `https://${domain}/api/v2`;
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Basic ${this.auth}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers: { ...headers, ...options.headers }
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(`Zendesk API Error: ${error.error || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Zendesk API request failed:', error);
      throw error;
    }
  }

  async getTicket(ticketId) {
    try {
      const { ticket } = await this.makeRequest(`/tickets/${ticketId}.json`);
      return this.formatTicketResponse(ticket);
    } catch (error) {
      if (error.message.includes('404')) {
        throw new Error(`Ticket ${ticketId} not found`);
      }
      throw error;
    }
  }

  async searchTickets(query, page = 1, perPage = 5) {
    const searchQuery = encodeURIComponent(query);
    const response = await this.makeRequest(
      `/search.json?query=type:ticket ${searchQuery}&page=${page}&per_page=${perPage}`
    );
    
    return {
      results: response.results.map(ticket => this.formatTicketResponse(ticket)),
      count: response.count
    };
  }

  async getTicketComments(ticketId) {
    const { comments } = await this.makeRequest(`/tickets/${ticketId}/comments.json`);
    return comments.map(comment => ({
      id: comment.id,
      author: comment.author.name,
      body: comment.body,
      createdAt: comment.created_at,
      public: comment.public
    }));
  }

  formatTicketResponse(ticket) {
    return {
      id: ticket.id,
      subject: ticket.subject,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      requester: ticket.requester_id,
      assignee: ticket.assignee_id,
      createdAt: ticket.created_at,
      updatedAt: ticket.updated_at,
      tags: ticket.tags,
      url: `https://${this.domain}/agent/tickets/${ticket.id}`
    };
  }

  formatTicketForSlack(ticket) {
    const statusEmoji = {
      new: '🆕',
      open: '📖',
      pending: '⏳',
      solved: '✅',
      closed: '🔒'
    };

    const priorityLabel = {
      urgent: '🔴 Urgent',
      high: '🟠 High',
      normal: '🟡 Normal',
      low: '🟢 Low'
    };

    return {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `Ticket #${ticket.id}: ${ticket.subject}`,
            emoji: true
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Status:*\n${statusEmoji[ticket.status] || '❓'} ${ticket.status}`
            },
            {
              type: 'mrkdwn',
              text: `*Priority:*\n${priorityLabel[ticket.priority] || '⚪️ Not set'}`
            }
          ]
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Created:*\n<!date^${Math.floor(new Date(ticket.createdAt).getTime()/1000)}^{date_short_pretty} at {time}|${ticket.createdAt}>`
            },
            {
              type: 'mrkdwn',
              text: `*Updated:*\n<!date^${Math.floor(new Date(ticket.updatedAt).getTime()/1000)}^{date_short_pretty} at {time}|${ticket.updatedAt}>`
            }
          ]
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Description:*\n${ticket.description ? ticket.description.substring(0, 500) + (ticket.description.length > 500 ? '...' : '') : '_No description provided_'}`
          }
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `🏷️ Tags: ${ticket.tags.length > 0 ? ticket.tags.join(', ') : 'No tags'}`
            }
          ]
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View in Zendesk',
                emoji: true
              },
              url: ticket.url,
              action_id: 'view_ticket'
            }
          ]
        }
      ]
    };
  }
}

module.exports = ZendeskClient;
