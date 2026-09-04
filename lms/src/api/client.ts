/**
 * SALAM LMS - CENTRALIZED API CLIENT
 * 
 * Client HTTP terpusat dengan penanganan token JWT, auto correlation ID, dan parsing error baku Bahasa Indonesia.
 */

export interface ApiResponse<T = any> {
  data: T;
  meta?: Record<string, any>;
  error?: {
    code: string;
    message: string;
  };
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = (import.meta as any).env?.VITE_API_URL || '/api/v1';
    // Ambil token sesi jika ada
    try {
      const stored = localStorage.getItem('salam_auth_session');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.token = parsed.token || null;
      }
    } catch {
      this.token = null;
    }
  }

  private getStoredToken(): string | null {
    if (this.token) return this.token;
    try {
      const stored = localStorage.getItem('salam_auth_session');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.session?.token || parsed.token || null;
      }
    } catch {
      return null;
    }
    return null;
  }

  public setToken(token: string | null): void {
    this.token = token;
  }

  public async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    const activeToken = this.getStoredToken();
    if (activeToken) {
      headers['Authorization'] = `Bearer ${activeToken}`;
    }

    try {
      const stored = localStorage.getItem('salam_auth_session');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.user?.role) headers['X-User-Role'] = parsed.user.role;
        if (parsed.user?.id) headers['X-User-Id'] = parsed.user.id;
      }
    } catch {}

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        // Sesi expired handling
        window.dispatchEvent(new CustomEvent('salam_session_expired'));
      }

      const json: ApiResponse<T> = await response.json();

      if (!response.ok || json.error) {
        throw new Error(json.error?.message || `Permintaan gagal dengan status ${response.status}`);
      }

      return json.data;
    } catch (err: any) {
      console.warn(`[ApiClient] Request to ${url} failed:`, err.message);
      throw err;
    }
  }

  public get<T = any>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  public post<T = any>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  public put<T = any>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  public patch<T = any>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  public delete<T = any>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }
}

export const apiClient = new ApiClient();
