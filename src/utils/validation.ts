import { z } from 'zod';

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join(', ');
      throw new Error(`Validation error: ${issues}`);
    }
    throw error;
  }
}

export function isPositiveInteger(value: string): boolean {
  return /^\d+$/.test(value) && parseInt(value, 10) > 0;
}

export function parsePositiveInteger(value: string, fieldName: string): number {
  if (!isPositiveInteger(value)) {
    throw new Error(`${fieldName} must be a positive integer`);
  }
  return parseInt(value, 10);
}

export function isISO8601Date(value: string): boolean {
  const date = new Date(value);
  return !isNaN(date.getTime());
}

export function parseISO8601Date(value: string, fieldName: string): string {
  if (!isISO8601Date(value)) {
    throw new Error(`${fieldName} must be a valid ISO 8601 date`);
  }
  return new Date(value).toISOString();
}

export interface DateRangeResult {
  startDate: string;
  endDate: string;
}

export function validateDateRange(
  startDate?: string,
  endDate?: string
): DateRangeResult | null {
  if (!startDate && !endDate) return null;

  if (startDate && endDate) {
    const parsedStart = parseISO8601Date(startDate, 'start-date');
    const parsedEnd = parseISO8601Date(endDate, 'end-date');
    if (new Date(parsedStart) > new Date(parsedEnd)) {
      throw new Error('start-date must be before end-date');
    }
    return { startDate: parsedStart, endDate: parsedEnd };
  }

  if (startDate && !endDate) {
    return {
      startDate: parseISO8601Date(startDate, 'start-date'),
      endDate: new Date().toISOString(),
    };
  }

  throw new Error(
    'end-date requires start-date. The Toggl API requires both dates when filtering.'
  );
}
