import { useState, useEffect, useCallback, useRef } from 'react';
import { cacheStorage, debounce } from '../utils/performance';

/**
 * Custom hook for optimized Firebase queries with caching
 * Designed to handle high traffic (100K+ users/day)
 */
export function useOptimizedQuery(queryFn, dependencies = [], options = {}) {
    const {
        cacheKey = null,
        cacheTTL = 300000, // 5 minutes default
        staleWhileRevalidate = true,
        retryCount = 3,
        retryDelay = 1000,
        onSuccess = null,
        onError = null,
        enabled = true
    } = options;

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isStale, setIsStale] = useState(false);
    const abortControllerRef = useRef(null);
    const retryCountRef = useRef(0);

    const executeQuery = useCallback(async (forceRefresh = false) => {
        if (!enabled) {
            setLoading(false);
            return;
        }

        // Check cache first
        if (cacheKey && !forceRefresh) {
            const cached = cacheStorage.get(cacheKey);
            if (cached) {
                setData(cached);
                setLoading(false);
                
                if (staleWhileRevalidate) {
                    setIsStale(true);
                    // Continue to fetch fresh data in background
                } else {
                    return;
                }
            }
        }

        // Create abort controller for this request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        try {
            setLoading(true);
            setError(null);

            const result = await queryFn(abortControllerRef.current.signal);

            if (cacheKey) {
                cacheStorage.set(cacheKey, result, cacheTTL);
            }

            setData(result);
            setIsStale(false);
            retryCountRef.current = 0;
            onSuccess?.(result);
        } catch (err) {
            if (err.name === 'AbortError') {
                return; // Request was cancelled, ignore
            }

            // Retry logic
            if (retryCountRef.current < retryCount) {
                retryCountRef.current++;
                setTimeout(() => executeQuery(forceRefresh), retryDelay * retryCountRef.current);
                return;
            }

            setError(err);
            onError?.(err);
        } finally {
            setLoading(false);
        }
    }, [queryFn, cacheKey, cacheTTL, staleWhileRevalidate, retryCount, retryDelay, onSuccess, onError, enabled]);

    useEffect(() => {
        executeQuery();

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [...dependencies, enabled]);

    const refetch = useCallback(() => executeQuery(true), [executeQuery]);

    return { data, loading, error, isStale, refetch };
}

/**
 * Pagination hook for large datasets
 */
export function usePaginatedQuery(queryFn, options = {}) {
    const {
        pageSize = 20,
        initialPage = 1
    } = options;

    const [items, setItems] = useState([]);
    const [page, setPage] = useState(initialPage);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const lastDocRef = useRef(null);

    const loadMore = useCallback(async () => {
        if (loading || !hasMore) return;

        setLoading(true);
        setError(null);

        try {
            const { data, lastDoc, hasMoreItems } = await queryFn({
                pageSize,
                lastDoc: lastDocRef.current
            });

            lastDocRef.current = lastDoc;
            setItems(prev => [...prev, ...data]);
            setHasMore(hasMoreItems);
            setPage(prev => prev + 1);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [queryFn, pageSize, loading, hasMore]);

    const reset = useCallback(() => {
        setItems([]);
        setPage(initialPage);
        setHasMore(true);
        lastDocRef.current = null;
    }, [initialPage]);

    useEffect(() => {
        loadMore();
    }, []);

    return { items, loading, error, hasMore, loadMore, reset, page };
}

/**
 * Debounced search hook
 */
export function useDebouncedSearch(searchFn, delay = 300) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const debouncedSearch = useCallback(
        debounce(async (searchQuery) => {
            if (!searchQuery.trim()) {
                setResults([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const data = await searchFn(searchQuery);
                setResults(data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        }, delay),
        [searchFn, delay]
    );

    useEffect(() => {
        if (query) {
            setLoading(true);
            debouncedSearch(query);
        } else {
            setResults([]);
        }
    }, [query, debouncedSearch]);

    return { query, setQuery, results, loading, error };
}

/**
 * Real-time subscription with automatic cleanup
 */
export function useRealtimeSubscription(subscribeFn, dependencies = []) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        
        const unsubscribe = subscribeFn(
            (newData) => {
                setData(newData);
                setLoading(false);
                setError(null);
            },
            (err) => {
                setError(err);
                setLoading(false);
            }
        );

        return () => {
            if (typeof unsubscribe === 'function') {
                unsubscribe();
            }
        };
    }, dependencies);

    return { data, loading, error };
}

/**
 * Optimistic update hook for mutations
 */
export function useOptimisticMutation(mutateFn, options = {}) {
    const {
        onSuccess = null,
        onError = null,
        onSettled = null
    } = options;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const mutate = useCallback(async (variables, optimisticData) => {
        setLoading(true);
        setError(null);

        // Return optimistic data immediately
        const rollback = optimisticData;

        try {
            const result = await mutateFn(variables);
            onSuccess?.(result, variables);
            return result;
        } catch (err) {
            setError(err);
            onError?.(err, variables, rollback);
            throw err;
        } finally {
            setLoading(false);
            onSettled?.();
        }
    }, [mutateFn, onSuccess, onError, onSettled]);

    return { mutate, loading, error };
}

export default {
    useOptimizedQuery,
    usePaginatedQuery,
    useDebouncedSearch,
    useRealtimeSubscription,
    useOptimisticMutation
};
