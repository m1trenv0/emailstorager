import { useState, useEffect, useCallback, useRef } from 'react';

interface UseFetchOptions {
  cache?: boolean;
  cacheTTL?: number;
  enabled?: boolean;
}

interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

const fetchCache = new Map<
  string,
  { data: unknown; timestamp: number; ttl: number }
>();

export function useFetch<T>(
  url: string | null,
  options: UseFetchOptions = {}
): UseFetchResult<T> {
  const {
    cache = true,
    cacheTTL = 5000, // 5 seconds default
    enabled = true,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    if (!url || !enabled) return;

    // Check cache first
    if (cache) {
      const cached = fetchCache.get(url);
      if (cached && Date.now() - cached.timestamp < cached.ttl) {
        setData(cached.data as T);
        setLoading(false);
        return;
      }
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (isMountedRef.current) {
        setData(result);
        setLoading(false);

        // Update cache
        if (cache) {
          fetchCache.set(url, {
            data: result,
            timestamp: Date.now(),
            ttl: cacheTTL,
          });
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Request was cancelled
      }

      if (isMountedRef.current) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setLoading(false);
      }
    }
  }, [url, cache, cacheTTL, enabled]);

  useEffect((): (() => void) => {
    isMountedRef.current = true;
    fetchData();

    return (): void => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

// Clear all cache
export function clearFetchCache(): void {
  fetchCache.clear();
}

// Clear specific cache entry
export function clearCacheEntry(url: string): void {
  fetchCache.delete(url);
}

// Invalidate cache by pattern (e.g., '/api/services' will clear '/api/services' and related)
export function invalidateCacheByPattern(pattern: string): void {
  const keysToDelete: string[] = [];
  fetchCache.forEach((_, key) => {
    if (key.includes(pattern)) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach(key => fetchCache.delete(key));
}
