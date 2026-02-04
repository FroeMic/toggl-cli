import { describe, it, expect } from 'vitest';
import { formatJson } from '../../../src/formatters/json';

describe('formatJson', () => {
  it('formats object as pretty JSON', () => {
    const data = { id: 1, name: 'Test' };
    const result = formatJson(data);

    expect(result).toBe(JSON.stringify(data, null, 2));
  });

  it('formats array as pretty JSON', () => {
    const data = [{ id: 1 }, { id: 2 }];
    const result = formatJson(data);

    expect(result).toBe(JSON.stringify(data, null, 2));
  });

  it('handles null', () => {
    const result = formatJson(null);

    expect(result).toBe('null');
  });

  it('handles nested objects', () => {
    const data = {
      user: {
        id: 1,
        profile: {
          name: 'Test',
        },
      },
    };
    const result = formatJson(data);

    expect(result).toContain('"user"');
    expect(result).toContain('"profile"');
  });
});
