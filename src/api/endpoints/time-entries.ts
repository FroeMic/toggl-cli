import { TogglClient } from '../client';
import { TimeEntrySchema, TimeEntry, TimeEntryCreate } from '../schemas';
import { validate } from '../../utils/validation';
import { z } from 'zod';

export interface ListTimeEntriesOptions {
  startDate?: string;
  endDate?: string;
  meta?: boolean;
}

export class TimeEntriesEndpoints {
  constructor(private client: TogglClient) {}

  async list(options?: ListTimeEntriesOptions): Promise<TimeEntry[]> {
    const params: Record<string, unknown> = {};

    if (options?.startDate) {
      params.start_date = options.startDate;
    }
    if (options?.endDate) {
      params.end_date = options.endDate;
    }
    if (options?.meta) {
      params.meta = true;
    }

    const response = await this.client.get<unknown[]>('/me/time_entries', params);
    return validate(z.array(TimeEntrySchema), response);
  }

  async getCurrent(): Promise<TimeEntry | null> {
    const response = await this.client.get<unknown>('/me/time_entries/current');
    if (!response) {
      return null;
    }
    return validate(TimeEntrySchema, response);
  }

  async get(timeEntryId: number): Promise<TimeEntry> {
    const response = await this.client.get<unknown>(
      `/me/time_entries/${timeEntryId}`
    );
    return validate(TimeEntrySchema, response);
  }

  async create(workspaceId: number, data: TimeEntryCreate): Promise<TimeEntry> {
    const response = await this.client.post<unknown>(
      `/workspaces/${workspaceId}/time_entries`,
      {
        ...data,
        workspace_id: workspaceId,
        created_with: data.created_with || 'toggl-cli',
      }
    );
    return validate(TimeEntrySchema, response);
  }

  async start(
    workspaceId: number,
    options: {
      description?: string;
      projectId?: number;
      taskId?: number;
      tags?: string[];
      tagIds?: number[];
      billable?: boolean;
    }
  ): Promise<TimeEntry> {
    const now = new Date().toISOString();
    const startTimestamp = Math.floor(Date.now() / 1000);

    const data: TimeEntryCreate = {
      workspace_id: workspaceId,
      start: now,
      duration: -startTimestamp, // Negative duration indicates running timer
      created_with: 'toggl-cli',
      description: options.description,
      project_id: options.projectId,
      task_id: options.taskId,
      tags: options.tags,
      tag_ids: options.tagIds,
      billable: options.billable,
    };

    return this.create(workspaceId, data);
  }

  async stop(workspaceId: number, timeEntryId: number): Promise<TimeEntry> {
    const response = await this.client.patch<unknown>(
      `/workspaces/${workspaceId}/time_entries/${timeEntryId}/stop`
    );
    return validate(TimeEntrySchema, response);
  }

  async update(
    workspaceId: number,
    timeEntryId: number,
    data: Partial<TimeEntry>
  ): Promise<TimeEntry> {
    const response = await this.client.put<unknown>(
      `/workspaces/${workspaceId}/time_entries/${timeEntryId}`,
      data
    );
    return validate(TimeEntrySchema, response);
  }

  async delete(workspaceId: number, timeEntryId: number): Promise<void> {
    await this.client.delete(`/workspaces/${workspaceId}/time_entries/${timeEntryId}`);
  }
}
