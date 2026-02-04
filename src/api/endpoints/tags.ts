import { TogglClient } from '../client';
import { TagSchema, Tag, TagCreate } from '../schemas';
import { validate } from '../../utils/validation';
import { z } from 'zod';

export class TagsEndpoints {
  constructor(private client: TogglClient) {}

  async list(workspaceId: number): Promise<Tag[]> {
    const response = await this.client.get<unknown[]>(
      `/workspaces/${workspaceId}/tags`
    );
    return validate(z.array(TagSchema), response);
  }

  async create(workspaceId: number, data: TagCreate): Promise<Tag> {
    const response = await this.client.post<unknown>(
      `/workspaces/${workspaceId}/tags`,
      {
        ...data,
        workspace_id: workspaceId,
      }
    );
    return validate(TagSchema, response);
  }

  async update(
    workspaceId: number,
    tagId: number,
    data: Partial<Tag>
  ): Promise<Tag> {
    const response = await this.client.put<unknown>(
      `/workspaces/${workspaceId}/tags/${tagId}`,
      data
    );
    return validate(TagSchema, response);
  }

  async delete(workspaceId: number, tagId: number): Promise<void> {
    await this.client.delete(`/workspaces/${workspaceId}/tags/${tagId}`);
  }
}
