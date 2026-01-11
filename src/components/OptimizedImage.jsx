import React, { useState, useRef, useEffect, memo } from 'react';
import { createIntersectionObserver } from '../utils/performance';

/**
 * Optimized Image Component with Lazy Loading
 * Improves LCP and reduces bandwidth usage
 */
const OptimizedImage = memo(({
    src,
    alt,
    className = '',
    width,
    height,
    placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PC9zdmc+',
    priority = false,
    onLoad,
    onError,
    objectFit = 'cover',
    ...props
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(priority);
    const [hasError, setHasError] = useState(false);
    const imgRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        if (priority) {
            setIsInView(true);
            return;
        }

        const observer = createIntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsInView(true);
                        observer.unobserve(entry.target);
                    }
                });
            },
            { rootMargin: '100px' }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => {
            if (containerRef.current) {
                observer.unobserve(containerRef.current);
            }
            observer.disconnect();
        };
    }, [priority]);

    const handleLoad = (e) => {
        setIsLoaded(true);
        onLoad?.(e);
    };

    const handleError = (e) => {
        setHasError(true);
        setIsLoaded(true);
        onError?.(e);
    };

    // Generate srcset for responsive images
    const generateSrcSet = (baseSrc) => {
        if (!baseSrc || baseSrc.startsWith('data:')) return undefined;
        // For external images, we can't generate srcset
        // This would work with a proper image CDN
        return undefined;
    };

    const containerStyle = {
        position: 'relative',
        width: width || '100%',
        height: height || 'auto',
        overflow: 'hidden',
        backgroundColor: '#f0f0f0'
    };

    const imageStyle = {
        width: '100%',
        height: '100%',
        objectFit,
        transition: 'opacity 0.3s ease-in-out',
        opacity: isLoaded ? 1 : 0
    };

    const placeholderStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit,
        filter: 'blur(5px)',
        transform: 'scale(1.1)',
        transition: 'opacity 0.3s ease-in-out',
        opacity: isLoaded ? 0 : 1
    };

    return (
        <div ref={containerRef} style={containerStyle} className={className} {...props}>
            {/* Placeholder/Blur */}
            {!isLoaded && (
                <img
                    src={placeholder}
                    alt=""
                    style={placeholderStyle}
                    aria-hidden="true"
                />
            )}

            {/* Actual Image */}
            {isInView && !hasError && (
                <img
                    ref={imgRef}
                    src={src}
                    alt={alt}
                    style={imageStyle}
                    loading={priority ? 'eager' : 'lazy'}
                    decoding="async"
                    fetchpriority={priority ? 'high' : 'auto'}
                    onLoad={handleLoad}
                    onError={handleError}
                    srcSet={generateSrcSet(src)}
                />
            )}

            {/* Error State */}
            {hasError && (
                <div
                    style={{
                        ...imageStyle,
                        opacity: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f0f0f0',
                        color: '#888'
                    }}
                >
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21,15 16,10 5,21" />
                    </svg>
                </div>
            )}
        </div>
    );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;

/**
 * Background Image Component with Lazy Loading
 */
export const LazyBackgroundImage = memo(({
    src,
    children,
    className = '',
    style = {},
    ...props
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const observer = createIntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsInView(true);
                        observer.unobserve(entry.target);
                    }
                });
            },
            { rootMargin: '200px' }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => {
            if (containerRef.current) {
                observer.unobserve(containerRef.current);
            }
            observer.disconnect();
        };
    }, []);

    useEffect(() => {
        if (!isInView) return;

        const img = new Image();
        img.onload = () => setIsLoaded(true);
        img.src = src;
    }, [isInView, src]);

    const containerStyle = {
        ...style,
        backgroundImage: isLoaded ? `url(${src})` : 'none',
        backgroundColor: !isLoaded ? '#f0f0f0' : undefined,
        transition: 'background-image 0.3s ease-in-out'
    };

    return (
        <div ref={containerRef} className={className} style={containerStyle} {...props}>
            {children}
        </div>
    );
});

LazyBackgroundImage.displayName = 'LazyBackgroundImage';
