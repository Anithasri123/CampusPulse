const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/events\/?$/, '');

/**
 * Get stored JWT token from localStorage
 */
export const getToken = () => localStorage.getItem('campuspulse_token');

/**
 * Set stored JWT token in localStorage
 */
export const setToken = (token) => {
  if (token) {
    localStorage.setItem('campuspulse_token', token);
  } else {
    localStorage.removeItem('campuspulse_token');
  }
};

/**
 * Centralized fetch helper for CampusPulse API
 */
export async function apiFetch(endpoint, options = {}) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE}${cleanEndpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // If token expired or invalid, clear local auth state if status is 401
    if (response.status === 401) {
      // Don't auto-clear during login or register requests to allow error display
      if (!endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
        localStorage.removeItem('campuspulse_token');
        localStorage.removeItem('campuspulse_user');
      }
    }
    const errorMsg = data?.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  get: (endpoint, options) => apiFetch(endpoint, { method: 'GET', ...options }),
  post: (endpoint, body, options) =>
    apiFetch(endpoint, { method: 'POST', body: JSON.stringify(body), ...options }),
  put: (endpoint, body, options) =>
    apiFetch(endpoint, { method: 'PUT', body: JSON.stringify(body), ...options }),
  patch: (endpoint, body, options) =>
    apiFetch(endpoint, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined, ...options }),
  delete: (endpoint, options) => apiFetch(endpoint, { method: 'DELETE', ...options }),
};
