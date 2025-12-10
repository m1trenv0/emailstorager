'use client';

import { useEffect, useState, useCallback } from 'react';

// Global module-level storage to persist across Hot Reload and component instances
let globalCsrfToken: string | null = null;
let globalIsLoaded = false;
let globalFetchPromise: Promise<void> | null = null;

export function useCSRFToken() {
  const [csrfToken, setCsrfToken] = useState<string | null>(globalCsrfToken);
  const [isLoaded, setIsLoaded] = useState(globalIsLoaded);

  useEffect(() => {
    // If already loaded globally, just sync state
    if (globalIsLoaded && globalCsrfToken) {
      setCsrfToken(globalCsrfToken);
      setIsLoaded(true);
      return;
    }

    // If fetch is already in progress, wait for it
    if (globalFetchPromise) {
      globalFetchPromise.then(() => {
        setCsrfToken(globalCsrfToken);
        setIsLoaded(globalIsLoaded);
      });
      return;
    }

    // Fetch CSRF token from API
    const fetchToken = async () => {
      try {
        const response = await fetch('/api/auth/csrf-token');
        if (response.ok) {
          const data = await response.json();
          globalCsrfToken = data.csrfToken;
          setCsrfToken(data.csrfToken);
        } else {
          console.error('Failed to fetch CSRF token: HTTP', response.status);
        }
      } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
      } finally {
        globalIsLoaded = true;
        setIsLoaded(true);
        globalFetchPromise = null;
      }
    };

    globalFetchPromise = fetchToken();
  }, []);

  const getCSRFHeaders = useCallback(() => {
    return { 'x-csrf-token': globalCsrfToken || '' };
  }, []);

  const ensureTokenLoaded = useCallback(async () => {
    if (globalIsLoaded && globalCsrfToken) return;

    // If fetch is in progress, wait for it
    if (globalFetchPromise) {
      await globalFetchPromise;
      if (globalCsrfToken) return;
    }

    // Wait for the token to be loaded with timeout
    return new Promise<void>((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds
      const checkLoaded = () => {
        if (globalCsrfToken) {
          resolve();
        } else if (globalIsLoaded) {
          reject(new Error('Failed to load CSRF token'));
        } else if (attempts >= maxAttempts) {
          reject(new Error('Timeout waiting for CSRF token'));
        } else {
          attempts++;
          setTimeout(checkLoaded, 100);
        }
      };
      checkLoaded();
    });
  }, []);

  // Function to refresh token (useful after errors)
  const refreshToken = useCallback(async () => {
    globalIsLoaded = false;
    globalCsrfToken = null;

    try {
      const response = await fetch('/api/auth/csrf-token');
      if (response.ok) {
        const data = await response.json();
        globalCsrfToken = data.csrfToken;
        setCsrfToken(data.csrfToken);
      }
    } catch (error) {
      console.error('Failed to refresh CSRF token:', error);
    } finally {
      globalIsLoaded = true;
      setIsLoaded(true);
    }
  }, []);

  return {
    csrfToken,
    getCSRFHeaders,
    isLoaded,
    ensureTokenLoaded,
    refreshToken,
  };
}
