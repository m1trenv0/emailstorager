'use client';

import { useEffect, useState } from 'react';

export function useCSRFToken() {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Fetch CSRF token from API
    const fetchToken = async () => {
      try {
        console.log('[useCSRFToken] Fetching CSRF token...');
        const response = await fetch('/api/auth/csrf-token');
        console.log('[useCSRFToken] CSRF token response status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('[useCSRFToken] CSRF token received:', data.csrfToken);
          setCsrfToken(data.csrfToken);
        } else {
          console.error('Failed to fetch CSRF token: HTTP', response.status);
        }
      } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
      } finally {
        console.log('[useCSRFToken] Setting isLoaded to true');
        setIsLoaded(true);
      }
    };

    fetchToken();
  }, []);

  const getCSRFHeaders = () => {
    return { 'x-csrf-token': csrfToken || '' };
  };

  const ensureTokenLoaded = async () => {
    if (isLoaded && csrfToken) return;
    // Wait for the token to be loaded with timeout
    return new Promise<void>((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds
      const checkLoaded = () => {
        if (csrfToken) {
          resolve();
        } else if (isLoaded) {
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
  };

  return { csrfToken, getCSRFHeaders, isLoaded, ensureTokenLoaded };
}