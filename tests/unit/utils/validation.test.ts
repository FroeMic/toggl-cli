import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  validate,
  isPositiveInteger,
  parsePositiveInteger,
  isISO8601Date,
  parseISO8601Date,
} from '../../../src/utils/validation';

describe('Validation Utils', () => {
  describe('validate', () => {
    it('returns parsed data for valid input', () => {
      const schema = z.object({
        id: z.number(),
        name: z.string(),
      });

      const result = validate(schema, { id: 1, name: 'Test' });

      expect(result).toEqual({ id: 1, name: 'Test' });
    });

    it('throws error with details for invalid input', () => {
      const schema = z.object({
        id: z.number(),
        name: z.string(),
      });

      expect(() => validate(schema, { id: 'not-a-number', name: 123 })).toThrow(
        'Validation error'
      );
    });

    it('includes path in error message', () => {
      const schema = z.object({
        user: z.object({
          email: z.string().email(),
        }),
      });

      expect(() =>
        validate(schema, { user: { email: 'invalid' } })
      ).toThrow('user.email');
    });
  });

  describe('isPositiveInteger', () => {
    it('returns true for positive integers', () => {
      expect(isPositiveInteger('1')).toBe(true);
      expect(isPositiveInteger('123')).toBe(true);
      expect(isPositiveInteger('999999')).toBe(true);
    });

    it('returns false for non-positive values', () => {
      expect(isPositiveInteger('0')).toBe(false);
      expect(isPositiveInteger('-1')).toBe(false);
      expect(isPositiveInteger('abc')).toBe(false);
      expect(isPositiveInteger('1.5')).toBe(false);
      expect(isPositiveInteger('')).toBe(false);
    });
  });

  describe('parsePositiveInteger', () => {
    it('returns parsed integer for valid input', () => {
      expect(parsePositiveInteger('123', 'id')).toBe(123);
    });

    it('throws error for invalid input', () => {
      expect(() => parsePositiveInteger('abc', 'id')).toThrow(
        'id must be a positive integer'
      );
    });
  });

  describe('isISO8601Date', () => {
    it('returns true for valid ISO 8601 dates', () => {
      expect(isISO8601Date('2023-01-01T00:00:00Z')).toBe(true);
      expect(isISO8601Date('2023-12-31T23:59:59.999Z')).toBe(true);
      expect(isISO8601Date('2023-06-15')).toBe(true);
    });

    it('returns false for invalid dates', () => {
      expect(isISO8601Date('invalid')).toBe(false);
      expect(isISO8601Date('')).toBe(false);
    });
  });

  describe('parseISO8601Date', () => {
    it('returns ISO string for valid date', () => {
      const result = parseISO8601Date('2023-01-01', 'startDate');
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('throws error for invalid date', () => {
      expect(() => parseISO8601Date('not-a-date', 'startDate')).toThrow(
        'startDate must be a valid ISO 8601 date'
      );
    });
  });
});
