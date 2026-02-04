import { TogglClient } from '../client';
import { GroupSchema, Group, GroupCreate } from '../schemas';
import { validate } from '../../utils/validation';
import { z } from 'zod';

export class GroupsEndpoints {
  constructor(private client: TogglClient) {}

  async list(organizationId: number): Promise<Group[]> {
    const response = await this.client.get<unknown[]>(
      `/organizations/${organizationId}/groups`
    );
    return validate(z.array(GroupSchema), response);
  }

  async create(organizationId: number, data: GroupCreate): Promise<Group> {
    const response = await this.client.post<unknown>(
      `/organizations/${organizationId}/groups`,
      data
    );
    return validate(GroupSchema, response);
  }

  async update(
    organizationId: number,
    groupId: number,
    data: Partial<Group>
  ): Promise<Group> {
    const response = await this.client.put<unknown>(
      `/organizations/${organizationId}/groups/${groupId}`,
      data
    );
    return validate(GroupSchema, response);
  }

  async delete(organizationId: number, groupId: number): Promise<void> {
    await this.client.delete(
      `/organizations/${organizationId}/groups/${groupId}`
    );
  }
}
