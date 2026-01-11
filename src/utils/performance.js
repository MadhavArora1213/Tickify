/**
 * Performance Utilities for Tickify
 * Designed to handle 100,000+ users per day
 */

// ============================================
// DEBOUNCING - Prevents excessive function calls
// ============================================
export function debounce(func, wait = 300, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
        const context = this;
        const later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

// ============================================
// THROTTLING - Limits function execution rate
// ============================================
export function throttle(func, limit = 100) {
    let inThrottle;
    return function executedFunction(...args) {
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}

// ============================================
// MEMOIZATION - Cache expensive computations
// ============================================
export function memoize(fn, options = {}) {
    const { maxSize = 100, ttl = 60000 } = options;
    const cache = new Map();

    return function memoized(...args) {
        const key = JSON.stringify(args);

        if (cache.has(key)) {
            const { value, timestamp } = cache.get(key);
            if (Date.now() - timestamp < ttl) {
                return value;
            }
            cache.delete(key);
        }

        const result = fn.apply(this, args);

        if (cache.size >= maxSize) {
            const firstKey = cache.keys().next().value;
            cache.delete(firstKey);
        }

        cache.set(key, { value: result, timestamp: Date.now() });
        return result;
    };
}

// ============================================
// REQUEST DEDUPLICATION - Prevent duplicate API calls
// ============================================
const pendingRequests = new Map();

export async function deduplicatedFetch(url, options = {}) {
    const key = `${url}-${JSON.stringify(options)}`;

    if (pendingRequests.has(key)) {
        return pendingRequests.get(key);
    }

    const promise = fetch(url, options)
        .then(response => {
            pendingRequests.delete(key);
            return response;
        })
        .catch(error => {
            pendingRequests.delete(key);
            throw error;
        });

    pendingRequests.set(key, promise);
    return promise;
}

// ============================================
// VIRTUAL SCROLL HELPER - For large lists
// ============================================
export function calculateVisibleItems(
    scrollTop,
    containerHeight,
    itemHeight,
    totalItems,
    overscan = 3
) {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
        totalItems - 1,
        Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return {
        startIndex,
        endIndex,
        offsetY: startIndex * itemHeight,
        visibleCount: endIndex - startIndex + 1
    };
}

// ============================================
// INTERSECTION OBSERVER FACTORY - For lazy loading
// ============================================
export function createIntersectionObserver(callback, options = {}) {
    const defaultOptions = {
        root: null,
        rootMargin: '50px',
        threshold: 0.1,
        ...options
    };

    if (typeof IntersectionObserver === 'undefined') {
        // Fallback for unsupported browsers
        return {
            observe: () => callback([{ isIntersecting: true }]),
            unobserve: () => {},
            disconnect: () => {}
        };
    }

    return new IntersectionObserver(callback, defaultOptions);
}

// ============================================
// BATCH PROCESSOR - For handling bulk operations
// ============================================
export async function processBatch(items, processor, batchSize = 10, delay = 50) {
    const results = [];

    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const batchResults = await Promise.all(batch.map(processor));
        results.push(...batchResults);

        if (i + batchSize < items.length) {
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    return results;
}

// ============================================
// IDLE CALLBACK SCHEDULER - Run non-critical tasks
// ============================================
export function scheduleIdleTask(callback, timeout = 2000) {
    if (typeof requestIdleCallback !== 'undefined') {
        return requestIdleCallback(callback, { timeout });
    }
    // Fallback for Safari
    return setTimeout(callback, 1);
}

// ============================================
// PERFORMANCE METRICS TRACKER
// ============================================
export const performanceTracker = {
    marks: new Map(),

    start(name) {
        if (typeof performance !== 'undefined') {
            this.marks.set(name, performance.now());
        }
    },

    end(name) {
        if (typeof performance !== 'undefined' && this.marks.has(name)) {
            const duration = performance.now() - this.marks.get(name);
            this.marks.delete(name);
            return duration;
        }
        return 0;
    },

    measure(name, callback) {
        this.start(name);
        const result = callback();
        const duration = this.end(name);
        if (process.env.NODE_ENV === 'development') {
            console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
        }
        return result;
    },

    async measureAsync(name, asyncCallback) {
        this.start(name);
        const result = await asyncCallback();
        const duration = this.end(name);
        if (process.env.NODE_ENV === 'development') {
            console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
        }
        return result;
    }
};

// ============================================
// RESOURCE PRELOADER
// ============================================
export const resourcePreloader = {
    preloadedImages: new Set(),
    preloadedScripts: new Set(),

    preloadImage(src) {
        if (this.preloadedImages.has(src)) return Promise.resolve();

        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.preloadedImages.add(src);
                resolve();
            };
            img.onerror = reject;
            img.src = src;
        });
    },

    preloadImages(sources) {
        return Promise.allSettled(sources.map(src => this.preloadImage(src)));
    },

    prefetchRoute(path) {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = path;
        document.head.appendChild(link);
    }
};

// ============================================
// LOCAL STORAGE WITH EXPIRY
// ============================================
export const cacheStorage = {
    set(key, value, ttlMs = 3600000) { // Default 1 hour
        const item = {
            value,
            expiry: Date.now() + ttlMs
        };
        try {
            localStorage.setItem(`cache_${key}`, JSON.stringify(item));
        } catch (e) {
            // Handle quota exceeded
            this.clearExpired();
        }
    },

    get(key) {
        try {
            const itemStr = localStorage.getItem(`cache_${key}`);
            if (!itemStr) return null;

            const item = JSON.parse(itemStr);
            if (Date.now() > item.expiry) {
                localStorage.removeItem(`cache_${key}`);
                return null;
            }
            return item.value;
        } catch (e) {
            return null;
        }
    },

    remove(key) {
        localStorage.removeItem(`cache_${key}`);
    },

    clearExpired() {
        const now = Date.now();
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith('cache_')) {
                try {
                    const item = JSON.parse(localStorage.getItem(key));
                    if (now > item.expiry) {
                        localStorage.removeItem(key);
                    }
                } catch (e) {
                    localStorage.removeItem(key);
                }
            }
        }
    }
};

// ============================================
// CONNECTION QUALITY DETECTOR
// ============================================
export function getConnectionQuality() {
    if (typeof navigator !== 'undefined' && navigator.connection) {
        const { effectiveType, downlink, rtt } = navigator.connection;
        return {
            effectiveType, // '4g', '3g', '2g', 'slow-2g'
            downlink, // Mbps
            rtt, // ms
            isSlowConnection: effectiveType === '2g' || effectiveType === 'slow-2g' || rtt > 500
        };
    }
    return { effectiveType: '4g', isSlowConnection: false };
}

// ============================================
// MEMORY USAGE MONITOR
// ============================================
export function getMemoryUsage() {
    if (typeof performance !== 'undefined' && performance.memory) {
        const { usedJSHeapSize, totalJSHeapSize, jsHeapSizeLimit } = performance.memory;
        return {
            usedMB: Math.round(usedJSHeapSize / 1048576),
            totalMB: Math.round(totalJSHeapSize / 1048576),
            limitMB: Math.round(jsHeapSizeLimit / 1048576),
            percentUsed: Math.round((usedJSHeapSize / jsHeapSizeLimit) * 100)
        };
    }
    return null;
}

export default {
    debounce,
    throttle,
    memoize,
    deduplicatedFetch,
    calculateVisibleItems,
    createIntersectionObserver,
    processBatch,
    scheduleIdleTask,
    performanceTracker,
    resourcePreloader,
    cacheStorage,
    getConnectionQuality,
    getMemoryUsage
};
