import { TogglClient } from '../client';
import { ProjectSchema, Project, ProjectCreate } from '../schemas';
import { validate } from '../../utils/validation';
import { z } from 'zod';

export interface ListProjectsOptions {
  active?: boolean;
  clientIds?: number[];
  onlyTemplates?: boolean;
}

export class ProjectsEndpoints {
  constructor(private client: TogglClient) {}

  async list(
    workspaceId: number,
    options?: ListProjectsOptions
  ): Promise<Project[]> {
    const params: Record<string, unknown> = {};

    if (options?.active !== undefined) {
      params.active = options.active;
    }
    if (options?.clientIds?.length) {
      params.client_ids = options.clientIds.join(',');
    }
    if (options?.onlyTemplates) {
      params.only_templates = true;
    }

    const response = await this.client.get<unknown[]>(
      `/workspaces/${workspaceId}/projects`,
      params
    );
    return validate(z.array(ProjectSchema), response);
  }

  async get(workspaceId: number, projectId: number): Promise<Project> {
    const response = await this.client.get<unknown>(
      `/workspaces/${workspaceId}/projects/${projectId}`
    );
    return validate(ProjectSchema, response);
  }

  async create(workspaceId: number, data: ProjectCreate): Promise<Project> {
    const response = await this.client.post<unknown>(
      `/workspaces/${workspaceId}/projects`,
      data
    );
    return validate(ProjectSchema, response);
  }

  async update(
    workspaceId: number,
    projectId: number,
    data: Partial<Project>
  ): Promise<Project> {
    const response = await this.client.put<unknown>(
      `/workspaces/${workspaceId}/projects/${projectId}`,
      data
    );
    return validate(ProjectSchema, response);
  }

  async delete(workspaceId: number, projectId: number): Promise<void> {
    await this.client.delete(`/workspaces/${workspaceId}/projects/${projectId}`);
  }
}
