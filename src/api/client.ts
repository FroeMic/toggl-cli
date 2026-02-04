import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from 'axios';
import { getConfig } from '../utils/config';
import { parseApiError, RateLimitError } from './errors';

export class TogglClient {
  private axiosInstance: AxiosInstance;
  private apiToken: string;

  constructor(apiTokenOverride?: string) {
    const config = getConfig(apiTokenOverride);
    this.apiToken = config.apiToken;

    // Toggl uses Basic Auth with api_token:api_token format
    const basicAuth = Buffer.from(`${this.apiToken}:api_token`).toString(
      'base64'
    );

    this.axiosInstance = axios.create({
      baseURL: config.baseUrl,
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 seconds
    });
  }

  private async request<T>(
    config: AxiosRequestConfig,
    retryCount = 0
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.request(
        config
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return this.handleError<T>(error, config, retryCount);
      }
      throw error;
    }
  }

  private async handleError<T>(
    error: AxiosError,
    config: AxiosRequestConfig,
    retryCount: number
  ): Promise<T> {
    const statusCode = error.response?.status || 500;
    const data = error.response?.data;

    // Log error details for debugging
    if (process.env.DEBUG_API_ERRORS === 'true') {
      console.error(
        'API Error Details:',
        JSON.stringify(
          {
            status: statusCode,
            url: config.url,
            method: config.method,
            data: data,
            requestBody: config.data,
          },
          null,
          2
        )
      );
    }

    // Handle rate limiting with retry
    if (statusCode === 429) {
      const retryAfterHeader = error.response?.headers['retry-after'];
      const retryAfter = retryAfterHeader
        ? parseInt(retryAfterHeader, 10)
        : 1;

      // Retry up to 3 times
      if (retryCount < 3) {
        await this.sleep(retryAfter * 1000);
        return this.request<T>(config, retryCount + 1);
      }

      throw new RateLimitError(retryAfter);
    }

    throw parseApiError(statusCode, data);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async get<T>(path: string, params?: Record<string, unknown>): Promise<T> {
    return this.request<T>({
      method: 'GET',
      url: path,
      params,
    });
  }

  async post<T>(path: string, data?: unknown): Promise<T> {
    return this.request<T>({
      method: 'POST',
      url: path,
      data,
    });
  }

  async patch<T>(path: string, data?: unknown): Promise<T> {
    return this.request<T>({
      method: 'PATCH',
      url: path,
      data,
    });
  }

  async put<T>(path: string, data?: unknown): Promise<T> {
    return this.request<T>({
      method: 'PUT',
      url: path,
      data,
    });
  }

  async delete<T>(path: string): Promise<T> {
    return this.request<T>({
      method: 'DELETE',
      url: path,
    });
  }
}
