import { describe, it, expect } from 'vitest';
import {
  UserSchema,
  WorkspaceSchema,
  TimeEntrySchema,
  ProjectSchema,
  ClientSchema,
  TagSchema,
  TaskSchema,
  OrganizationQuotaSchema,
  QuotaResponseSchema,
} from '../../../src/api/schemas';

describe('Schemas', () => {
  describe('UserSchema', () => {
    it('validates complete user object', () => {
      const user = {
        id: 12345,
        email: 'test@example.com',
        fullname: 'Test User',
        timezone: 'Europe/Berlin',
        default_workspace_id: 67890,
        beginning_of_week: 1,
        image_url: 'https://example.com/avatar.png',
        created_at: '2023-01-01T00:00:00Z',
      };

      const result = UserSchema.parse(user);
      expect(result.id).toBe(12345);
      expect(result.email).toBe('test@example.com');
    });

    it('allows null image_url', () => {
      const user = {
        id: 12345,
        email: 'test@example.com',
        fullname: 'Test User',
        timezone: 'Europe/Berlin',
        default_workspace_id: 67890,
        beginning_of_week: 1,
        image_url: null,
        created_at: '2023-01-01T00:00:00Z',
      };

      const result = UserSchema.parse(user);
      expect(result.image_url).toBeNull();
    });
  });

  describe('WorkspaceSchema', () => {
    it('validates workspace object', () => {
      const workspace = {
        id: 12345,
        name: 'My Workspace',
        premium: true,
      };

      const result = WorkspaceSchema.parse(workspace);
      expect(result.id).toBe(12345);
      expect(result.name).toBe('My Workspace');
      expect(result.premium).toBe(true);
    });
  });

  describe('TimeEntrySchema', () => {
    it('validates running time entry (negative duration)', () => {
      const entry = {
        id: 12345,
        workspace_id: 67890,
        project_id: null,
        billable: false,
        start: '2023-01-01T10:00:00Z',
        stop: null,
        duration: -1704103200,
        description: 'Working on task',
        at: '2023-01-01T10:00:00Z',
        user_id: 11111,
      };

      const result = TimeEntrySchema.parse(entry);
      expect(result.duration).toBeLessThan(0);
      expect(result.stop).toBeNull();
    });

    it('validates completed time entry', () => {
      const entry = {
        id: 12345,
        workspace_id: 67890,
        project_id: 11111,
        billable: true,
        start: '2023-01-01T10:00:00Z',
        stop: '2023-01-01T11:30:00Z',
        duration: 5400,
        description: 'Completed task',
        tags: ['work', 'important'],
        at: '2023-01-01T11:30:00Z',
        user_id: 22222,
      };

      const result = TimeEntrySchema.parse(entry);
      expect(result.duration).toBe(5400);
      expect(result.stop).toBe('2023-01-01T11:30:00Z');
      expect(result.tags).toEqual(['work', 'important']);
    });
  });

  describe('ProjectSchema', () => {
    it('validates project object', () => {
      const project = {
        id: 12345,
        workspace_id: 67890,
        client_id: null,
        name: 'My Project',
        is_private: false,
        active: true,
        at: '2023-01-01T00:00:00Z',
        color: '#FF0000',
      };

      const result = ProjectSchema.parse(project);
      expect(result.id).toBe(12345);
      expect(result.name).toBe('My Project');
      expect(result.active).toBe(true);
    });

    it('validates project with client', () => {
      const project = {
        id: 12345,
        workspace_id: 67890,
        client_id: 11111,
        name: 'Client Project',
        is_private: true,
        active: true,
        at: '2023-01-01T00:00:00Z',
        color: '#00FF00',
        billable: true,
      };

      const result = ProjectSchema.parse(project);
      expect(result.client_id).toBe(11111);
      expect(result.billable).toBe(true);
    });
  });

  describe('ClientSchema', () => {
    it('validates client object', () => {
      const client = {
        id: 12345,
        wid: 67890,
        name: 'Acme Corp',
        at: '2023-01-01T00:00:00Z',
      };

      const result = ClientSchema.parse(client);
      expect(result.id).toBe(12345);
      expect(result.name).toBe('Acme Corp');
    });

    it('validates client with optional fields', () => {
      const client = {
        id: 12345,
        wid: 67890,
        name: 'Acme Corp',
        at: '2023-01-01T00:00:00Z',
        archived: true,
        notes: 'Important client',
      };

      const result = ClientSchema.parse(client);
      expect(result.archived).toBe(true);
      expect(result.notes).toBe('Important client');
    });
  });

  describe('TagSchema', () => {
    it('validates tag object', () => {
      const tag = {
        id: 12345,
        workspace_id: 67890,
        name: 'urgent',
        at: '2023-01-01T00:00:00Z',
      };

      const result = TagSchema.parse(tag);
      expect(result.id).toBe(12345);
      expect(result.name).toBe('urgent');
    });
  });

  describe('TaskSchema', () => {
    it('validates task object', () => {
      const task = {
        id: 12345,
        name: 'Implement feature',
        workspace_id: 67890,
        project_id: 11111,
        active: true,
        at: '2023-01-01T00:00:00Z',
      };

      const result = TaskSchema.parse(task);
      expect(result.id).toBe(12345);
      expect(result.name).toBe('Implement feature');
      expect(result.active).toBe(true);
    });

    it('validates task with time tracking', () => {
      const task = {
        id: 12345,
        name: 'Implement feature',
        workspace_id: 67890,
        project_id: 11111,
        active: true,
        at: '2023-01-01T00:00:00Z',
        estimated_seconds: 3600,
        tracked_seconds: 1800,
      };

      const result = TaskSchema.parse(task);
      expect(result.estimated_seconds).toBe(3600);
      expect(result.tracked_seconds).toBe(1800);
    });
  });

  describe('OrganizationQuotaSchema', () => {
    it('validates quota object', () => {
      const quota = {
        remaining: 100,
        total: 600,
        resets_in_secs: 3600,
        organization_id: 12345,
      };

      const result = OrganizationQuotaSchema.parse(quota);
      expect(result.remaining).toBe(100);
      expect(result.total).toBe(600);
      expect(result.resets_in_secs).toBe(3600);
      expect(result.organization_id).toBe(12345);
    });

    it('allows null organization_id', () => {
      const quota = {
        remaining: 100,
        total: 600,
        resets_in_secs: 3600,
        organization_id: null,
      };

      const result = OrganizationQuotaSchema.parse(quota);
      expect(result.organization_id).toBeNull();
    });

    it('rejects quota with missing fields', () => {
      const quota = {
        remaining: 100,
        // missing total, resets_in_secs, organization_id
      };

      expect(() => OrganizationQuotaSchema.parse(quota)).toThrow();
    });
  });

  describe('QuotaResponseSchema', () => {
    it('validates array of quota objects', () => {
      const quotas = [
        {
          remaining: 100,
          total: 600,
          resets_in_secs: 3600,
          organization_id: 12345,
        },
        {
          remaining: 50,
          total: 300,
          resets_in_secs: 1800,
          organization_id: 67890,
        },
      ];

      const result = QuotaResponseSchema.parse(quotas);
      expect(result).toHaveLength(2);
      expect(result[0].organization_id).toBe(12345);
      expect(result[1].organization_id).toBe(67890);
    });

    it('validates empty array', () => {
      const result = QuotaResponseSchema.parse([]);
      expect(result).toHaveLength(0);
    });
  });
});
