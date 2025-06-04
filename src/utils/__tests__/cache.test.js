const Cache = require('../cache');

jest.useFakeTimers();

describe('Cache', () => {
  test('returns stored value within TTL', () => {
    const cache = new Cache(1000);
    cache.set('key', 'value');
    expect(cache.get('key')).toBe('value');
  });

  test('expires values after TTL', () => {
    const cache = new Cache(1000);
    cache.set('a', 1);
    jest.advanceTimersByTime(1001);
    expect(cache.get('a')).toBeNull();
  });

  test('delete removes entry', () => {
    const cache = new Cache();
    cache.set('x', 5);
    cache.delete('x');
    expect(cache.get('x')).toBeNull();
  });
});
