import { TogglClient } from '../client';
import { TaskSchema, Task, TaskCreate } from '../schemas';
import { validate } from '../../utils/validation';
import { z } from 'zod';

export interface ListTasksOptions {
  active?: boolean;
}

export class TasksEndpoints {
  constructor(private client: TogglClient) {}

  async list(
    workspaceId: number,
    projectId: number,
    options?: ListTasksOptions
  ): Promise<Task[]> {
    const params: Record<string, unknown> = {};

    if (options?.active !== undefined) {
      params.active = options.active;
    }

    const response = await this.client.get<unknown[]>(
      `/workspaces/${workspaceId}/projects/${projectId}/tasks`,
      params
    );
    return validate(z.array(TaskSchema), response);
  }

  async get(
    workspaceId: number,
    projectId: number,
    taskId: number
  ): Promise<Task> {
    const response = await this.client.get<unknown>(
      `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`
    );
    return validate(TaskSchema, response);
  }

  async create(
    workspaceId: number,
    projectId: number,
    data: TaskCreate
  ): Promise<Task> {
    const response = await this.client.post<unknown>(
      `/workspaces/${workspaceId}/projects/${projectId}/tasks`,
      {
        ...data,
        workspace_id: workspaceId,
        project_id: projectId,
      }
    );
    return validate(TaskSchema, response);
  }

  async update(
    workspaceId: number,
    projectId: number,
    taskId: number,
    data: Partial<Task>
  ): Promise<Task> {
    const response = await this.client.put<unknown>(
      `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`,
      data
    );
    return validate(TaskSchema, response);
  }

  async delete(
    workspaceId: number,
    projectId: number,
    taskId: number
  ): Promise<void> {
    await this.client.delete(
      `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`
    );
  }
}
