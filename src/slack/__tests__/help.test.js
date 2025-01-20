const { generateHelpMessage } = require('../help');

describe('Help Command', () => {
  describe('generateHelpMessage', () => {
    test('should generate general help message when no command specified', () => {
      const result = generateHelpMessage();
      expect(result).toHaveProperty('blocks');
      expect(result.blocks[0].text.text).toContain('Zendesk Bot Commands');
      expect(result.blocks).toHaveLength(6); // Header + intro + 3 commands + footer
    });

    test('should generate specific command help when command specified', () => {
      const result = generateHelpMessage('ticket-details');
      expect(result).toHaveProperty('blocks');
      expect(result.blocks[0].text.text).toContain('ticket-details');
      expect(result.blocks).toHaveLength(4); // Header + description + usage/example + notes
    });

    test('should include usage examples in command-specific help', () => {
      const result = generateHelpMessage('search-tickets');
      const usageBlock = result.blocks.find(block => 
        block.fields && block.fields.some(field => field.text.includes('Usage'))
      );
      expect(usageBlock).toBeTruthy();
      expect(usageBlock.fields[0].text).toContain('/search-tickets');
    });

    test('should handle invalid command gracefully', () => {
      const result = generateHelpMessage('invalid-command');
      expect(result).toHaveProperty('blocks');
      expect(result.blocks[0].text.text).toContain('Zendesk Bot Commands');
    });
  });
});
