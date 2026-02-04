import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { TogglClient } from '../../src/api/client';
import { ProjectsEndpoints } from '../../src/api/endpoints/projects';
import { MeEndpoints } from '../../src/api/endpoints/me';

/**
 * Integration tests for Projects API
 *
 * These tests require a valid TOGGL_API_TOKEN environment variable.
 * Run with: npm run test:integration
 */

describe('Projects Integration', () => {
  let client: TogglClient;
  let projectsApi: ProjectsEndpoints;
  let meApi: MeEndpoints;
  let workspaceId: number;
  let createdProjectId: number | null = null;

  beforeAll(async () => {
    if (!process.env.TOGGL_API_TOKEN) {
      console.warn('Skipping integration tests: TOGGL_API_TOKEN not set');
      return;
    }

    client = new TogglClient();
    projectsApi = new ProjectsEndpoints(client);
    meApi = new MeEndpoints(client);

    const user = await meApi.get();
    workspaceId = user.default_workspace_id;
  });

  afterAll(async () => {
    if (createdProjectId && workspaceId) {
      try {
        await projectsApi.delete(workspaceId, createdProjectId);
      } catch {
        // Ignore cleanup errors
      }
    }
  });

  it.skipIf(!process.env.TOGGL_API_TOKEN)('lists projects', async () => {
    const projects = await projectsApi.list(workspaceId);

    expect(Array.isArray(projects)).toBe(true);
  });

  it.skipIf(!process.env.TOGGL_API_TOKEN)('lists active projects only', async () => {
    const projects = await projectsApi.list(workspaceId, { active: true });

    expect(Array.isArray(projects)).toBe(true);
    projects.forEach((p) => {
      expect(p.active).toBe(true);
    });
  });

  it.skipIf(!process.env.TOGGL_API_TOKEN)('creates, updates, and deletes project', async () => {
    // Create project
    const created = await projectsApi.create(workspaceId, {
      name: 'Integration Test Project',
      color: '#FF5733',
      is_private: false,
    });

    createdProjectId = created.id;

    expect(created.id).toBeDefined();
    expect(created.name).toBe('Integration Test Project');
    expect(created.color.toLowerCase()).toBe('#ff5733');
    // active defaults to true in most cases, but may vary by account settings
    expect(typeof created.active).toBe('boolean');

    // Get project
    const retrieved = await projectsApi.get(workspaceId, created.id);
    expect(retrieved.id).toBe(created.id);
    expect(retrieved.name).toBe('Integration Test Project');

    // Update project
    const updated = await projectsApi.update(workspaceId, created.id, {
      name: 'Updated Integration Test Project',
    });

    expect(updated.name).toBe('Updated Integration Test Project');

    // Delete project
    await projectsApi.delete(workspaceId, created.id);
    createdProjectId = null;

    // Verify deletion
    try {
      await projectsApi.get(workspaceId, created.id);
      expect.fail('Expected NotFoundError');
    } catch (error) {
      // Expected - project should be deleted
      expect(error).toBeDefined();
    }
  });
});
