import { describe, it, expect, beforeAll } from 'vitest';
import { TogglClient } from '../../src/api/client';
import { MeEndpoints } from '../../src/api/endpoints/me';

/**
 * Integration tests for Me (User Profile) API
 *
 * These tests require a valid TOGGL_API_TOKEN environment variable.
 * Run with: npm run test:integration
 */

describe('Me Integration', () => {
  let client: TogglClient;
  let meApi: MeEndpoints;

  beforeAll(async () => {
    if (!process.env.TOGGL_API_TOKEN) {
      console.warn('Skipping integration tests: TOGGL_API_TOKEN not set');
      return;
    }

    client = new TogglClient();
    meApi = new MeEndpoints(client);
  });

  it.skipIf(!process.env.TOGGL_API_TOKEN)('gets user profile', async () => {
    const user = await meApi.get();

    expect(user.id).toBeDefined();
    expect(typeof user.id).toBe('number');
    expect(user.email).toBeDefined();
    expect(user.fullname).toBeDefined();
    expect(user.default_workspace_id).toBeDefined();
  });

  it.skipIf(!process.env.TOGGL_API_TOKEN)('gets user preferences', async () => {
    const preferences = await meApi.getPreferences();

    expect(preferences).toBeDefined();
    expect(typeof preferences).toBe('object');
  });

  it.skipIf(!process.env.TOGGL_API_TOKEN)('gets quota information', async () => {
    const quotas = await meApi.getQuota();

    expect(Array.isArray(quotas)).toBe(true);
    if (quotas.length > 0) {
      const quota = quotas[0];
      expect(typeof quota.remaining).toBe('number');
      expect(typeof quota.total).toBe('number');
      expect(typeof quota.resets_in_secs).toBe('number');
      expect(typeof quota.organization_id).toBe('number');
    }
  });
});
