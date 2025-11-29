const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8055';

export interface ApiError {
  message: string;
  status?: number;
}

class ApiService {
  private getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getAccessToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${DIRECTUS_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        message: errorData.errors?.[0]?.message || errorData.error || 'Une erreur est survenue',
        status: response.status,
      } as ApiError;
    }

    return response.json();
  }

  async requestOTP(phone: string) {
    return this.request<{ success: boolean; message?: string; error?: string }>(
      '/directus-extension-otp-auth/request',
      {
        method: 'POST',
        body: JSON.stringify({ phone }),
      }
    );
  }

  async verifyOTP(phone: string, code: string) {
    return this.request<{
      success: boolean;
      access_token?: string;
      refresh_token?: string;
      expires?: number;
      error?: string;
    }>('/directus-extension-otp-auth/verify', {
      method: 'POST',
      body: JSON.stringify({ phone, code }),
    });
  }

  async getUsers() {
    return this.request<{ data: any[] }>('/items/directus_users?fields[]=*&limit=-1');
  }

  async getPrograms() {
    return this.request<{ data: any[] }>('/items/Program?fields[]=*&limit=-1');
  }

  async getMe() {
    return this.request<{ success: boolean; data?: any; error?: string }>('/directus-extension-otp-auth/me');
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

export const apiService = new ApiService();

