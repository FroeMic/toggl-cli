import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { TogglClient } from '../../../src/api/client';

vi.mock('axios');
vi.mock('../../../src/utils/config', () => ({
  getConfig: vi.fn(() => ({
    apiToken: 'test-token',
    baseUrl: 'https://api.track.toggl.com/api/v9',
  })),
}));

describe('TogglClient', () => {
  let mockAxiosInstance: {
    request: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockAxiosInstance = {
      request: vi.fn(),
    };
    vi.mocked(axios.create).mockReturnValue(mockAxiosInstance as unknown as ReturnType<typeof axios.create>);
  });

  describe('constructor', () => {
    it('creates axios instance with correct config', () => {
      new TogglClient();

      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'https://api.track.toggl.com/api/v9',
          timeout: 30000,
        })
      );
    });

    it('uses Basic Auth with api_token:api_token format', () => {
      new TogglClient();

      const callArgs = vi.mocked(axios.create).mock.calls[0][0];
      const expectedAuth = Buffer.from('test-token:api_token').toString('base64');
      expect(callArgs?.headers?.Authorization).toBe(`Basic ${expectedAuth}`);
    });
  });

  describe('get', () => {
    it('makes GET request with correct path', async () => {
      const mockResponse = { data: { id: 1, name: 'Test' } };
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      const client = new TogglClient();
      const result = await client.get('/test-path');

      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        method: 'GET',
        url: '/test-path',
        params: undefined,
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('passes query parameters', async () => {
      const mockResponse = { data: [] };
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      const client = new TogglClient();
      await client.get('/test-path', { limit: 10, offset: 0 });

      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        method: 'GET',
        url: '/test-path',
        params: { limit: 10, offset: 0 },
      });
    });
  });

  describe('post', () => {
    it('makes POST request with data', async () => {
      const mockResponse = { data: { id: 1 } };
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      const client = new TogglClient();
      const result = await client.post('/test-path', { name: 'Test' });

      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        method: 'POST',
        url: '/test-path',
        data: { name: 'Test' },
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('put', () => {
    it('makes PUT request with data', async () => {
      const mockResponse = { data: { id: 1, name: 'Updated' } };
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      const client = new TogglClient();
      const result = await client.put('/test-path/1', { name: 'Updated' });

      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        method: 'PUT',
        url: '/test-path/1',
        data: { name: 'Updated' },
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('patch', () => {
    it('makes PATCH request with data', async () => {
      const mockResponse = { data: { id: 1 } };
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      const client = new TogglClient();
      const result = await client.patch('/test-path/1', { status: 'active' });

      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        method: 'PATCH',
        url: '/test-path/1',
        data: { status: 'active' },
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('delete', () => {
    it('makes DELETE request', async () => {
      const mockResponse = { data: null };
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      const client = new TogglClient();
      await client.delete('/test-path/1');

      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        method: 'DELETE',
        url: '/test-path/1',
      });
    });
  });

  describe('error handling', () => {
    it('throws AuthenticationError for 401', async () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 401,
          data: { error: 'Invalid API token' },
        },
      };
      mockAxiosInstance.request.mockRejectedValue(axiosError);
      vi.mocked(axios.isAxiosError).mockReturnValue(true);

      const client = new TogglClient();

      await expect(client.get('/test')).rejects.toThrow('Invalid API token');
    });

    it('throws NotFoundError for 404', async () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 404,
          data: { error: 'Resource not found' },
        },
      };
      mockAxiosInstance.request.mockRejectedValue(axiosError);
      vi.mocked(axios.isAxiosError).mockReturnValue(true);

      const client = new TogglClient();

      await expect(client.get('/test')).rejects.toThrow('Resource not found');
    });

    it('throws ValidationError for 400', async () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 400,
          data: { error: 'Invalid request' },
        },
      };
      mockAxiosInstance.request.mockRejectedValue(axiosError);
      vi.mocked(axios.isAxiosError).mockReturnValue(true);

      const client = new TogglClient();

      await expect(client.get('/test')).rejects.toThrow('Invalid request');
    });
  });
});
