import { TogglClient } from '../client';
import { UserSchema, UserPreferencesSchema, User, UserPreferences } from '../schemas';
import { validate } from '../../utils/validation';

export class MeEndpoints {
  constructor(private client: TogglClient) {}

  async get(withRelatedData = false): Promise<User> {
    const params: Record<string, unknown> = {};
    if (withRelatedData) {
      params.with_related_data = true;
    }
    const response = await this.client.get<unknown>('/me', params);
    return validate(UserSchema, response);
  }

  async update(data: Partial<User>): Promise<User> {
    const response = await this.client.put<unknown>('/me', data);
    return validate(UserSchema, response);
  }

  async getPreferences(): Promise<UserPreferences> {
    const response = await this.client.get<unknown>('/me/preferences');
    return validate(UserPreferencesSchema, response);
  }

  async updatePreferences(
    data: Partial<UserPreferences>
  ): Promise<UserPreferences> {
    const response = await this.client.post<unknown>('/me/preferences', data);
    return validate(UserPreferencesSchema, response);
  }

  async getQuota(): Promise<unknown> {
    // The quota endpoint returns various rate limit information
    // Response format may vary
    const response = await this.client.get<unknown>('/me/logged');
    return response;
  }
}
