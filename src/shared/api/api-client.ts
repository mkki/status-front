import { authenticateUser, refreshAccessToken } from '@/features/auth/api/auth';

const BASE_URL = import.meta.env.VITE_API_URL || '';

export interface ApiResponse<T> {
  status: number;
  data: T;
  code?: string;
  message?: string;
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
  _retry?: boolean;
}

const request = async <T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> => {
  const headers: HeadersInit = {
    ...(!(options.body instanceof FormData) && {
      'Content-Type': 'application/json',
    }),
    ...options.headers,
  };

  let queryString = '';

  if (options.params) {
    const params = new URLSearchParams(options.params);
    queryString = `?${params.toString()}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}${queryString}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (response.status === 401) {
    if (!options._retry) {
      const isAuthenticated = await authenticateUser();

      if (isAuthenticated) {
        await refreshAccessToken();
        return request(endpoint, {
          ...options,
          _retry: true,
        });
      }
    }

    const currentPath = window.location.pathname;
    window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
  }

  if (!response.ok) {
    throw response;
  }

  try {
    return await response.json();
  } catch {
    return undefined as T;
  }
};

export const api = {
  get: <T = unknown>(endpoint: string, options?: RequestOptions): Promise<T> =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = unknown>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T = unknown>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T = unknown>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> =>
    request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T = unknown>(
    endpoint: string,
    options?: RequestOptions
  ): Promise<T> => request<T>(endpoint, { ...options, method: 'DELETE' }),
} as const;
