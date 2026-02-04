import { describe, it, expect } from 'vitest';
import { formatCsv } from '../../../src/formatters/csv';

describe('formatCsv', () => {
  it('formats array of objects as CSV', () => {
    const data = [
      { id: 1, name: 'Project A' },
      { id: 2, name: 'Project B' },
    ];
    const result = formatCsv(data);

    expect(result).toContain('"id"');
    expect(result).toContain('"name"');
    expect(result).toContain('"1"');
    expect(result).toContain('"Project A"');
    expect(result).toContain('"2"');
    expect(result).toContain('"Project B"');
  });

  it('converts single object to array', () => {
    const data = { id: 1, name: 'Single' };
    const result = formatCsv(data);

    expect(result).toContain('"id"');
    expect(result).toContain('"1"');
    expect(result).toContain('"Single"');
  });

  it('returns empty string for empty array', () => {
    const result = formatCsv([]);

    expect(result).toBe('');
  });

  it('flattens nested objects', () => {
    const data = [
      {
        id: 1,
        user: {
          name: 'Test',
          email: 'test@example.com',
        },
      },
    ];
    const result = formatCsv(data);

    expect(result).toContain('"user.name"');
    expect(result).toContain('"user.email"');
    expect(result).toContain('"Test"');
    expect(result).toContain('"test@example.com"');
  });

  it('joins array values with semicolons', () => {
    const data = [
      {
        id: 1,
        tags: ['work', 'urgent'],
      },
    ];
    const result = formatCsv(data);

    expect(result).toContain('"work; urgent"');
  });

  it('handles null values', () => {
    const data = [
      { id: 1, name: null },
    ];
    const result = formatCsv(data);

    // csv-stringify outputs empty field for null, just verify the structure
    expect(result).toContain('"id"');
    expect(result).toContain('"name"');
    expect(result).toContain('"1"');
  });
});
