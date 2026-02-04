import { describe, it, expect } from 'vitest';
import {
  formatUserTable,
  formatTimeEntriesTable,
  formatProjectsTable,
  formatGenericTable,
} from '../../../src/formatters/table';
import { User, TimeEntry, Project } from '../../../src/api/types';

describe('Table Formatters', () => {
  describe('formatUserTable', () => {
    it('formats user as table', () => {
      const user: User = {
        id: 12345,
        email: 'test@example.com',
        fullname: 'Test User',
        timezone: 'Europe/Berlin',
        default_workspace_id: 67890,
        beginning_of_week: 1,
        image_url: null,
        created_at: '2023-01-01T00:00:00Z',
      };

      const result = formatUserTable(user);

      expect(result).toContain('ID');
      expect(result).toContain('12345');
      expect(result).toContain('Email');
      expect(result).toContain('test@example.com');
      expect(result).toContain('Full Name');
      expect(result).toContain('Test User');
    });
  });

  describe('formatTimeEntriesTable', () => {
    it('formats time entries as table', () => {
      const entries: TimeEntry[] = [
        {
          id: 1,
          workspace_id: 100,
          project_id: 200,
          billable: true,
          start: '2023-01-01T10:00:00Z',
          stop: '2023-01-01T11:00:00Z',
          duration: 3600,
          description: 'Working on feature',
          at: '2023-01-01T11:00:00Z',
          user_id: 300,
        },
      ];

      const result = formatTimeEntriesTable(entries);

      expect(result).toContain('ID');
      expect(result).toContain('Description');
      expect(result).toContain('Working on feature');
      expect(result).toContain('Project ID');
    });

    it('shows Running for negative duration', () => {
      const entries: TimeEntry[] = [
        {
          id: 1,
          workspace_id: 100,
          project_id: null,
          billable: false,
          start: '2023-01-01T10:00:00Z',
          stop: null,
          duration: -1704103200,
          description: 'Currently running',
          at: '2023-01-01T10:00:00Z',
          user_id: 300,
        },
      ];

      const result = formatTimeEntriesTable(entries);

      expect(result).toContain('Running');
      expect(result).toContain('Yes');
    });
  });

  describe('formatProjectsTable', () => {
    it('formats projects as table', () => {
      const projects: Project[] = [
        {
          id: 1,
          workspace_id: 100,
          client_id: null,
          name: 'Project Alpha',
          is_private: false,
          active: true,
          at: '2023-01-01T00:00:00Z',
          color: '#FF0000',
        },
        {
          id: 2,
          workspace_id: 100,
          client_id: 50,
          name: 'Project Beta',
          is_private: true,
          active: false,
          at: '2023-01-01T00:00:00Z',
          color: '#00FF00',
          billable: true,
        },
      ];

      const result = formatProjectsTable(projects);

      expect(result).toContain('Project Alpha');
      expect(result).toContain('Project Beta');
      expect(result).toContain('Active');
      expect(result).toContain('Billable');
    });
  });

  describe('formatGenericTable', () => {
    it('formats generic data as table', () => {
      const data = [
        { Field: 'Name', Value: 'Test' },
        { Field: 'Status', Value: 'Active' },
      ];

      const result = formatGenericTable(data);

      expect(result).toContain('Field');
      expect(result).toContain('Value');
      expect(result).toContain('Name');
      expect(result).toContain('Test');
    });

    it('returns message for empty data', () => {
      const result = formatGenericTable([]);

      expect(result).toBe('No data to display');
    });

    it('handles nested objects', () => {
      const data = [
        { id: 1, nested: { key: 'value' } },
      ];

      const result = formatGenericTable(data);

      expect(result).toContain('{"key":"value"}');
    });
  });
});
