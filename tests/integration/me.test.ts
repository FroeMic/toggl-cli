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
    const quota = await meApi.getQuota();

    // Quota can be an object or string depending on API version
    expect(quota).toBeDefined();
  });
});
