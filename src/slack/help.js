const commandHelp = {
  'ticket-details': {
    description: 'Get detailed information about a specific Zendesk ticket',
    usage: '/ticket-details TICKET_ID',
    example: '/ticket-details 12345',
    notes: 'Shows ticket status, priority, description, and other key information'
  },
  'ticket-summary': {
    description: 'Get an AI-generated summary of a Zendesk ticket conversation',
    usage: '/ticket-summary TICKET_ID',
    example: '/ticket-summary 12345',
    notes: 'Summarizes the ticket description and all public comments'
  },
  'search-tickets': {
    description: 'Search for Zendesk tickets using keywords',
    usage: '/search-tickets KEYWORDS',
    example: '/search-tickets login issue',
    notes: 'Searches through ticket subjects and descriptions'
  }
};

const generateHelpMessage = (command = null) => {
  if (command && commandHelp[command]) {
    // Help for specific command
    const help = commandHelp[command];
    return {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `Help: /${command}`,
            emoji: true
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: help.description
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Usage:*\n\`${help.usage}\``
            },
            {
              type: 'mrkdwn',
              text: `*Example:*\n\`${help.example}\``
            }
          ]
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `💡 _${help.notes}_`
            }
          ]
        }
      ]
    };
  }

  // General help message
  const blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '🤖 Zendesk Bot Commands',
        emoji: true
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: 'Here are all the available commands:'
      }
    }
  ];

  // Add each command
  Object.entries(commandHelp).forEach(([cmd, help]) => {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*/${cmd}*\n${help.description}\n\`${help.usage}\``
      }
    });
  });

  blocks.push({
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: '_Type `/help COMMAND` for more details about a specific command_'
      }
    ]
  });

  return { blocks };
};

const helpCommand = async ({ command, ack, respond }) => {
  await ack();
  try {
    const requestedCommand = command.text.trim().toLowerCase();
    await respond(generateHelpMessage(requestedCommand || null));
  } catch (error) {
    console.error('Error in help command:', error);
    await respond({
      text: '❌ Sorry, something went wrong while displaying help information.'
    });
  }
};

module.exports = {
  helpCommand,
  generateHelpMessage
};
