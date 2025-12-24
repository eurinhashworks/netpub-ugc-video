import { useState, useEffect } from 'react';

interface CacheOptions {
    key: string;
    ttl?: number; // Time to live in milliseconds (default: 1 hour)
}

/**
 * Hook pour mettre en cache les données dans localStorage
 * Évite de recharger les données à chaque visite
 */
export function useLocalStorageCache<T>(
    fetchFn: () => Promise<T>,
    options: CacheOptions
): { data: T | null; loading: boolean; error: Error | null; refetch: () => void } {
    const { key, ttl = 3600000 } = options; // 1 hour default
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = async (forceRefresh = false) => {
        try {
            setLoading(true);
            setError(null);

            // Check cache first
            if (!forceRefresh) {
                const cached = localStorage.getItem(key);
                if (cached) {
                    const { data: cachedData, timestamp } = JSON.parse(cached);
                    const age = Date.now() - timestamp;

                    // Use cache if still valid
                    if (age < ttl) {
                        setData(cachedData);
                        setLoading(false);
                        return;
                    }
                }
            }

            // Fetch fresh data
            const freshData = await fetchFn();

            // Save to cache
            localStorage.setItem(
                key,
                JSON.stringify({
                    data: freshData,
                    timestamp: Date.now(),
                })
            );

            setData(freshData);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [key]);

    return {
        data,
        loading,
        error,
        refetch: () => fetchData(true),
    };
}

/**
 * Clear cache for a specific key
 */
export function clearCache(key: string) {
    localStorage.removeItem(key);
}

/**
 * Clear all cache
 */
export function clearAllCache() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
        if (key.startsWith('cache_')) {
            localStorage.removeItem(key);
        }
    });
}
