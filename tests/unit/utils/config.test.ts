import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getApiToken, getDefaultWorkspaceId, getConfig } from '../../../src/utils/config';

describe('Config Utils', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('getApiToken', () => {
    it('returns override token when provided', () => {
      const result = getApiToken('override-token');
      expect(result).toBe('override-token');
    });

    it('returns environment token when no override', () => {
      process.env.TOGGL_API_TOKEN = 'env-token';
      const result = getApiToken();
      expect(result).toBe('env-token');
    });

    it('throws error when no token available', () => {
      delete process.env.TOGGL_API_TOKEN;
      expect(() => getApiToken()).toThrow('TOGGL_API_TOKEN environment variable is not set');
    });
  });

  describe('getDefaultWorkspaceId', () => {
    it('returns workspace ID from environment', () => {
      process.env.TOGGL_WORKSPACE_ID = '12345';
      const result = getDefaultWorkspaceId();
      expect(result).toBe('12345');
    });

    it('returns undefined when not set', () => {
      delete process.env.TOGGL_WORKSPACE_ID;
      const result = getDefaultWorkspaceId();
      expect(result).toBeUndefined();
    });
  });

  describe('getConfig', () => {
    it('returns full config object', () => {
      process.env.TOGGL_API_TOKEN = 'test-token';
      process.env.TOGGL_WORKSPACE_ID = '12345';

      const config = getConfig();

      expect(config.apiToken).toBe('test-token');
      expect(config.baseUrl).toBe('https://api.track.toggl.com/api/v9');
      expect(config.workspaceId).toBe('12345');
    });

    it('uses override values when provided', () => {
      process.env.TOGGL_API_TOKEN = 'env-token';
      process.env.TOGGL_WORKSPACE_ID = '11111';

      const config = getConfig('override-token', '22222');

      expect(config.apiToken).toBe('override-token');
      expect(config.workspaceId).toBe('22222');
    });
  });
});
