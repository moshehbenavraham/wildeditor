import { Region, Path, Point, ApiResponse } from '@wildeditor/shared/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class ApiClient {
  private baseUrl: string;
  private token?: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers
    };

    try {
      const response = await fetch(url, { ...options, headers });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Region methods
  async getRegions(): Promise<Region[]> {
    const response = await this.request<Region[]>('/regions');
    return response.data;
  }

  async getRegion(id: string): Promise<Region> {
    const response = await this.request<Region>(`/regions/${id}`);
    return response.data;
  }

  async createRegion(region: Omit<Region, 'id'>): Promise<Region> {
    const response = await this.request<Region>('/regions', {
      method: 'POST',
      body: JSON.stringify(region)
    });
    return response.data;
  }

  async updateRegion(id: string, updates: Partial<Region>): Promise<Region> {
    const response = await this.request<Region>(`/regions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    return response.data;
  }

  async deleteRegion(id: string): Promise<void> {
    await this.request<void>(`/regions/${id}`, {
      method: 'DELETE'
    });
  }

  // Path methods
  async getPaths(): Promise<Path[]> {
    const response = await this.request<Path[]>('/paths');
    return response.data;
  }

  async getPath(id: string): Promise<Path> {
    const response = await this.request<Path>(`/paths/${id}`);
    return response.data;
  }

  async createPath(path: Omit<Path, 'id'>): Promise<Path> {
    const response = await this.request<Path>('/paths', {
      method: 'POST',
      body: JSON.stringify(path)
    });
    return response.data;
  }

  async updatePath(id: string, updates: Partial<Path>): Promise<Path> {
    const response = await this.request<Path>(`/paths/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    return response.data;
  }

  async deletePath(id: string): Promise<void> {
    await this.request<void>(`/paths/${id}`, {
      method: 'DELETE'
    });
  }

  // Point methods
  async getPoints(): Promise<Point[]> {
    const response = await this.request<Point[]>('/points');
    return response.data;
  }

  async getPoint(id: string): Promise<Point> {
    const response = await this.request<Point>(`/points/${id}`);
    return response.data;
  }

  async createPoint(point: Omit<Point, 'id'>): Promise<Point> {
    const response = await this.request<Point>('/points', {
      method: 'POST',
      body: JSON.stringify(point)
    });
    return response.data;
  }

  async updatePoint(id: string, updates: Partial<Point>): Promise<Point> {
    const response = await this.request<Point>(`/points/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    return response.data;
  }

  async deletePoint(id: string): Promise<void> {
    await this.request<void>(`/points/${id}`, {
      method: 'DELETE'
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await this.request<{ status: string; timestamp: string }>('/health');
    return response.data;
  }
}

export const apiClient = new ApiClient(API_BASE_URL);