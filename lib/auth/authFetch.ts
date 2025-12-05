'use client';

type FetchOptions = RequestInit & {
  skipAuthRefresh?: boolean;
};

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

/**
 * Attempt to refresh the access token using the refresh token
 */
async function refreshAccessToken(): Promise<boolean> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      return response.ok;
    } catch {
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Enhanced fetch wrapper with automatic token refresh on 401
 *
 * Usage:
 *   import { authFetch } from '@/lib/auth/authFetch';
 *   const response = await authFetch('/api/accounts');
 */
export async function authFetch(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { skipAuthRefresh = false, ...fetchOptions } = options;

  // Ensure credentials are included for cookie-based auth
  const requestOptions: RequestInit = {
    ...fetchOptions,
    credentials: 'include',
  };

  const response = await fetch(url, requestOptions);

  // If unauthorized and not skipping auth refresh, try to refresh token
  if (response.status === 401 && !skipAuthRefresh) {
    const refreshed = await refreshAccessToken();

    if (refreshed) {
      // Retry the original request
      return fetch(url, requestOptions);
    }

    // Refresh failed - redirect to login
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
  }

  return response;
}

/**
 * Check if user is authenticated by calling /api/auth/me
 */
export async function checkAuth(): Promise<boolean> {
  try {
    const response = await authFetch('/api/auth/me', {
      skipAuthRefresh: true,
    });
    return response.ok;
  } catch {
    return false;
  }
}
