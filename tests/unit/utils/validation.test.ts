import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  validate,
  isPositiveInteger,
  parsePositiveInteger,
  isISO8601Date,
  parseISO8601Date,
  validateDateRange,
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

  describe('validateDateRange', () => {
    it('returns null when neither date is provided', () => {
      const result = validateDateRange();
      expect(result).toBeNull();
    });

    it('returns null when both dates are undefined', () => {
      const result = validateDateRange(undefined, undefined);
      expect(result).toBeNull();
    });

    it('returns both dates when both are provided', () => {
      const result = validateDateRange('2024-01-01', '2024-01-31');
      expect(result).not.toBeNull();
      expect(result?.startDate).toMatch(/^2024-01-01/);
      expect(result?.endDate).toMatch(/^2024-01-31/);
    });

    it('defaults end-date to now when only start-date provided', () => {
      const beforeCall = new Date();
      const result = validateDateRange('2024-01-01');
      const afterCall = new Date();

      expect(result).not.toBeNull();
      expect(result?.startDate).toMatch(/^2024-01-01/);

      const endDate = new Date(result!.endDate);
      expect(endDate.getTime()).toBeGreaterThanOrEqual(beforeCall.getTime());
      expect(endDate.getTime()).toBeLessThanOrEqual(afterCall.getTime() + 1000);
    });

    it('throws error when only end-date is provided', () => {
      expect(() => validateDateRange(undefined, '2024-01-31')).toThrow(
        'end-date requires start-date. The Toggl API requires both dates when filtering.'
      );
    });

    it('throws error when start-date is after end-date', () => {
      expect(() => validateDateRange('2024-01-31', '2024-01-01')).toThrow(
        'start-date must be before end-date'
      );
    });

    it('accepts same date for start and end', () => {
      const result = validateDateRange('2024-01-15', '2024-01-15');
      expect(result).not.toBeNull();
    });

    it('throws error for invalid start-date', () => {
      expect(() => validateDateRange('invalid', '2024-01-31')).toThrow(
        'start-date must be a valid ISO 8601 date'
      );
    });

    it('throws error for invalid end-date', () => {
      expect(() => validateDateRange('2024-01-01', 'invalid')).toThrow(
        'end-date must be a valid ISO 8601 date'
      );
    });
  });
});
