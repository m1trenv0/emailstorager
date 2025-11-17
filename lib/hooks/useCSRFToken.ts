'use client';

import { useEffect, useState } from 'react';

export function useCSRFToken() {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Fetch CSRF token from API
    const fetchToken = async () => {
      try {
        const response = await fetch('/api/auth/csrf-token');
        const data = await response.json();
        setCsrfToken(data.csrfToken);
      } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    fetchToken();
  }, []);

  const getCSRFHeaders = () => {
    if (!isLoaded || !csrfToken) {
      throw new Error('CSRF token not loaded');
    }
    return { 'x-csrf-token': csrfToken };
  };

  return { csrfToken, getCSRFHeaders, isLoaded };
}