import { extractTelegramInitData } from './helpers';

describe('extractTelegramInitData', () => {
  it('returns initData from tma authorization header', () => {
    expect(
      extractTelegramInitData('tma query_id=1&user=%7B%7D&hash=abc', undefined),
    ).toBe('query_id=1&user=%7B%7D&hash=abc');
  });

  it('falls back to request body for legacy clients', () => {
    expect(
      extractTelegramInitData(undefined, 'query_id=1&user=%7B%7D&hash=abc'),
    ).toBe('query_id=1&user=%7B%7D&hash=abc');
  });

  it('rejects unsupported authorization formats', () => {
    expect(
      extractTelegramInitData(
        'Bearer query_id=1&user=%7B%7D&hash=abc',
        undefined,
      ),
    ).toBe('');
  });
});
