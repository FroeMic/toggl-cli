import { TogglClient } from '../client';
import {
  OrganizationSchema,
  OrganizationUserSchema,
  Organization,
  OrganizationUser,
} from '../schemas';
import { validate } from '../../utils/validation';
import { z } from 'zod';

export class OrganizationsEndpoints {
  constructor(private client: TogglClient) {}

  async get(organizationId: number): Promise<Organization> {
    const response = await this.client.get<unknown>(
      `/organizations/${organizationId}`
    );
    return validate(OrganizationSchema, response);
  }

  async update(
    organizationId: number,
    data: Partial<Organization>
  ): Promise<Organization> {
    const response = await this.client.put<unknown>(
      `/organizations/${organizationId}`,
      data
    );
    return validate(OrganizationSchema, response);
  }

  async listUsers(organizationId: number): Promise<OrganizationUser[]> {
    const response = await this.client.get<unknown[]>(
      `/organizations/${organizationId}/users`
    );
    return validate(z.array(OrganizationUserSchema), response);
  }
}
