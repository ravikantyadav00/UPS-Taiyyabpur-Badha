const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface ApiFetchOptions extends RequestInit {
  token?: string;
}

export async function apiFetch<T = any>(endpoint: string, options: ApiFetchOptions = {}): Promise<T> {
  const { token, headers: customHeaders, ...customOptions } = options;

  const storedToken = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  const authToken = token || storedToken;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string>),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`, {
    headers,
    credentials: 'include',
    ...customOptions,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined' && window.location.pathname !== '/login') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    const errorMsg = data.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg) as any;
    error.status = response.status;
    error.errorCode = data.errorCode || 'UNKNOWN_ERROR';
    error.data = data;
    throw error;
  }

  return data.data !== undefined ? data.data : data;
}
