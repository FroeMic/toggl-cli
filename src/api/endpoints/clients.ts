import { TogglClient } from '../client';
import { ClientSchema, Client, ClientCreate } from '../schemas';
import { validate } from '../../utils/validation';
import { z } from 'zod';

export interface ListClientsOptions {
  status?: 'active' | 'archived' | 'both';
}

export class ClientsEndpoints {
  constructor(private client: TogglClient) {}

  async list(
    workspaceId: number,
    options?: ListClientsOptions
  ): Promise<Client[]> {
    const params: Record<string, unknown> = {};

    if (options?.status) {
      params.status = options.status;
    }

    const response = await this.client.get<unknown[]>(
      `/workspaces/${workspaceId}/clients`,
      params
    );
    return validate(z.array(ClientSchema), response);
  }

  async get(workspaceId: number, clientId: number): Promise<Client> {
    const response = await this.client.get<unknown>(
      `/workspaces/${workspaceId}/clients/${clientId}`
    );
    return validate(ClientSchema, response);
  }

  async create(workspaceId: number, data: ClientCreate): Promise<Client> {
    const response = await this.client.post<unknown>(
      `/workspaces/${workspaceId}/clients`,
      {
        ...data,
        wid: workspaceId,
      }
    );
    return validate(ClientSchema, response);
  }

  async update(
    workspaceId: number,
    clientId: number,
    data: Partial<Client>
  ): Promise<Client> {
    const response = await this.client.put<unknown>(
      `/workspaces/${workspaceId}/clients/${clientId}`,
      data
    );
    return validate(ClientSchema, response);
  }

  async archive(workspaceId: number, clientId: number): Promise<Client> {
    const response = await this.client.post<unknown>(
      `/workspaces/${workspaceId}/clients/${clientId}/archive`
    );
    return validate(ClientSchema, response);
  }

  async restore(workspaceId: number, clientId: number): Promise<Client> {
    const response = await this.client.post<unknown>(
      `/workspaces/${workspaceId}/clients/${clientId}/restore`
    );
    return validate(ClientSchema, response);
  }

  async delete(workspaceId: number, clientId: number): Promise<void> {
    await this.client.delete(`/workspaces/${workspaceId}/clients/${clientId}`);
  }
}
