import { useCallback } from 'react';
import { clearCacheEntry } from './useFetch';

export function useCacheInvalidation() {
  const invalidateServices = useCallback(() => {
    clearCacheEntry('/api/services');
  }, []);

  const invalidateFilters = useCallback(() => {
    clearCacheEntry('/api/filters');
  }, []);

  const invalidateFilterCategories = useCallback(() => {
    clearCacheEntry('/api/filter-categories');
  }, []);

  const invalidateAll = useCallback(() => {
    invalidateServices();
    invalidateFilters();
    invalidateFilterCategories();
  }, [invalidateServices, invalidateFilters, invalidateFilterCategories]);

  return {
    invalidateServices,
    invalidateFilters,
    invalidateFilterCategories,
    invalidateAll,
  };
}
