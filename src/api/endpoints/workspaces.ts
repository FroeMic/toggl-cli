import { TogglClient } from '../client';
import {
  WorkspaceSchema,
  WorkspaceUserSchema,
  Workspace,
  WorkspaceUser,
} from '../schemas';
import { validate } from '../../utils/validation';
import { z } from 'zod';

export class WorkspacesEndpoints {
  constructor(private client: TogglClient) {}

  async list(): Promise<Workspace[]> {
    const response = await this.client.get<unknown[]>('/workspaces');
    return validate(z.array(WorkspaceSchema), response);
  }

  async get(workspaceId: number): Promise<Workspace> {
    const response = await this.client.get<unknown>(
      `/workspaces/${workspaceId}`
    );
    return validate(WorkspaceSchema, response);
  }

  async update(
    workspaceId: number,
    data: Partial<Workspace>
  ): Promise<Workspace> {
    const response = await this.client.put<unknown>(
      `/workspaces/${workspaceId}`,
      data
    );
    return validate(WorkspaceSchema, response);
  }

  async listUsers(workspaceId: number): Promise<WorkspaceUser[]> {
    const response = await this.client.get<unknown[]>(
      `/workspaces/${workspaceId}/users`
    );
    return validate(z.array(WorkspaceUserSchema), response);
  }
}
