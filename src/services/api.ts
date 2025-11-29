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

  // Méthodes pour l'authentification OTP
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

  // Méthodes pour récupérer les données
  async getUsers() {
    // Note: Ces endpoints nécessitent des permissions dans Directus
    // Pour l'instant, on utilise les endpoints publics
    return this.request<{ data: any[] }>('/items/directus_users?fields[]=*&limit=-1');
  }

  async getPrograms() {
    return this.request<{ data: any[] }>('/items/Program?fields[]=*&limit=-1');
  }

  // Méthode pour récupérer les informations de l'utilisateur connecté
  // Utiliser notre endpoint personnalisé qui valide nos tokens OTP
  async getMe() {
    return this.request<{ success: boolean; data?: any; error?: string }>('/directus-extension-otp-auth/me');
  }

  // Méthode pour se déconnecter
  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  // Vérifier si l'utilisateur est authentifié
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

export const apiService = new ApiService();

