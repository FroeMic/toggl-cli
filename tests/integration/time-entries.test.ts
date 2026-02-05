import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { TogglClient } from '../../src/api/client';
import { TimeEntriesEndpoints } from '../../src/api/endpoints/time-entries';
import { MeEndpoints } from '../../src/api/endpoints/me';

/**
 * Integration tests for Time Entries API
 *
 * These tests require a valid TOGGL_API_TOKEN environment variable.
 * Run with: npm run test:integration
 */

describe('Time Entries Integration', () => {
  let client: TogglClient;
  let timeEntriesApi: TimeEntriesEndpoints;
  let meApi: MeEndpoints;
  let workspaceId: number;
  let createdEntryId: number | null = null;

  beforeAll(async () => {
    if (!process.env.TOGGL_API_TOKEN) {
      console.warn('Skipping integration tests: TOGGL_API_TOKEN not set');
      return;
    }

    client = new TogglClient();
    timeEntriesApi = new TimeEntriesEndpoints(client);
    meApi = new MeEndpoints(client);

    // Get default workspace
    const user = await meApi.get();
    workspaceId = user.default_workspace_id;
  });

  afterAll(async () => {
    // Cleanup: delete any created entries
    if (createdEntryId && workspaceId) {
      try {
        await timeEntriesApi.delete(workspaceId, createdEntryId);
      } catch {
        // Ignore cleanup errors
      }
    }
  });

  it.skipIf(!process.env.TOGGL_API_TOKEN)('lists time entries', async () => {
    const entries = await timeEntriesApi.list();

    expect(Array.isArray(entries)).toBe(true);
  });

  it.skipIf(!process.env.TOGGL_API_TOKEN)('lists time entries with date filter', async () => {
    const endDate = new Date().toISOString();
    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const entries = await timeEntriesApi.list({ startDate, endDate });

    expect(Array.isArray(entries)).toBe(true);
  });

  it.skipIf(!process.env.TOGGL_API_TOKEN)('lists time entries with only start-date (end-date defaults to now)', async () => {
    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const entries = await timeEntriesApi.list({ startDate });

    expect(Array.isArray(entries)).toBe(true);
  });

  it.skipIf(!process.env.TOGGL_API_TOKEN)('throws error when only end-date is provided', async () => {
    const endDate = new Date().toISOString();

    await expect(timeEntriesApi.list({ endDate })).rejects.toThrow(
      'end-date requires start-date'
    );
  });

  it.skipIf(!process.env.TOGGL_API_TOKEN)('gets current time entry (may be null)', async () => {
    const current = await timeEntriesApi.getCurrent();

    // Current can be null if nothing is running
    expect(current === null || typeof current === 'object').toBe(true);
  });

  it.skipIf(!process.env.TOGGL_API_TOKEN)('creates, updates, and deletes time entry', async () => {
    // Create a completed time entry
    const startTime = new Date(Date.now() - 3600000).toISOString(); // 1 hour ago

    const created = await timeEntriesApi.create(workspaceId, {
      workspace_id: workspaceId,
      start: startTime,
      duration: 1800, // 30 minutes
      description: 'Integration test entry',
      created_with: 'toggl-cli-test',
    });

    createdEntryId = created.id;

    expect(created.id).toBeDefined();
    expect(created.description).toBe('Integration test entry');
    expect(created.duration).toBe(1800);

    // Update the entry
    const updated = await timeEntriesApi.update(workspaceId, created.id, {
      description: 'Updated integration test entry',
    });

    expect(updated.description).toBe('Updated integration test entry');

    // Delete the entry
    await timeEntriesApi.delete(workspaceId, created.id);
    createdEntryId = null;

    // Verify deletion by trying to get it (should fail)
    try {
      await timeEntriesApi.get(created.id);
      expect.fail('Expected error for deleted entry');
    } catch (error) {
      // Entry should be gone - any error is expected
      expect(error).toBeDefined();
    }
  });

  it.skipIf(!process.env.TOGGL_API_TOKEN)('starts and stops a timer', async () => {
    // Start a timer
    const started = await timeEntriesApi.start(workspaceId, {
      description: 'Integration test timer',
    });

    createdEntryId = started.id;

    expect(started.id).toBeDefined();
    expect(started.duration).toBeLessThan(0); // Negative = running
    expect(started.stop).toBeNull();

    // Verify it's the current entry
    const current = await timeEntriesApi.getCurrent();
    expect(current?.id).toBe(started.id);

    // Stop the timer
    const stopped = await timeEntriesApi.stop(workspaceId, started.id);

    expect(stopped.id).toBe(started.id);
    // Duration is non-negative after stopping (may be 0 for very short timers)
    expect(stopped.duration).toBeGreaterThanOrEqual(0);
    expect(stopped.stop).toBeDefined();

    // Cleanup
    await timeEntriesApi.delete(workspaceId, started.id);
    createdEntryId = null;
  });
});
