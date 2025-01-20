const { isValidTicketId, validateSearchQuery, formatErrorMessage } = require('../validation');

describe('Validation Utils', () => {
  describe('isValidTicketId', () => {
    test('should return true for valid ticket IDs', () => {
      expect(isValidTicketId('123')).toBe(true);
      expect(isValidTicketId('456789')).toBe(true);
    });

    test('should return false for invalid ticket IDs', () => {
      expect(isValidTicketId('')).toBe(false);
      expect(isValidTicketId('abc')).toBe(false);
      expect(isValidTicketId('123abc')).toBe(false);
      expect(isValidTicketId('12.34')).toBe(false);
    });

    test('should handle whitespace', () => {
      expect(isValidTicketId(' 123 ')).toBe(true);
      expect(isValidTicketId('  ')).toBe(false);
    });
  });

  describe('validateSearchQuery', () => {
    test('should validate and clean search queries', () => {
      expect(validateSearchQuery('test query')).toEqual({
        isValid: true,
        cleaned: 'test query',
        error: null
      });
    });

    test('should handle short queries', () => {
      expect(validateSearchQuery('a')).toEqual({
        isValid: false,
        cleaned: 'a',
        error: 'Search query must be at least 2 characters long'
      });
    });

    test('should handle whitespace', () => {
      expect(validateSearchQuery('  test  ')).toEqual({
        isValid: true,
        cleaned: 'test',
        error: null
      });
    });
  });

  describe('formatErrorMessage', () => {
    test('should format error messages for Slack', () => {
      const result = formatErrorMessage('Test error', 'test-command');
      expect(result).toHaveProperty('blocks');
      expect(result.blocks).toHaveLength(2);
      expect(result.blocks[0].text.text).toContain('Test error');
      expect(result.blocks[1].elements[0].text).toContain('/help test-command');
    });
  });
});
