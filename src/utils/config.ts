import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const BASE_URL = 'https://api.track.toggl.com/api/v9';

export function getApiToken(override?: string): string {
  const token = override || process.env.TOGGL_API_TOKEN || '';
  if (!token) {
    throw new Error(
      'TOGGL_API_TOKEN environment variable is not set. ' +
        'Please set it in your .env file, export it, or use --api-token option.'
    );
  }
  return token;
}

export function getDefaultWorkspaceId(): string | undefined {
  return process.env.TOGGL_WORKSPACE_ID || undefined;
}

export interface Config {
  apiToken: string;
  baseUrl: string;
  workspaceId?: string;
}

export function getConfig(
  apiTokenOverride?: string,
  workspaceIdOverride?: string
): Config {
  return {
    apiToken: getApiToken(apiTokenOverride),
    baseUrl: BASE_URL,
    workspaceId: workspaceIdOverride || getDefaultWorkspaceId(),
  };
}
