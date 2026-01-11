import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from 'next-themes'
import App from './App'
import './index.css'

// ============================================
// PERFORMANCE: Remove initial loader
// ============================================
const removeInitialLoader = () => {
    const loader = document.getElementById('initial-loader');
    if (loader) {
        loader.classList.add('hidden');
        setTimeout(() => loader.remove(), 300);
    }
};

// ============================================
// PERFORMANCE: Register Service Worker
// ============================================
const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/'
            });

            console.log('[App] Service Worker registered:', registration.scope);

            // Handle updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker?.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // New content available
                        console.log('[App] New content available, please refresh');
                    }
                });
            });
        } catch (error) {
            console.error('[App] Service Worker registration failed:', error);
        }
    }
};

// ============================================
// PERFORMANCE: Preload critical resources
// ============================================
const preloadCriticalResources = () => {
    // Preload fonts
    const fontLinks = [
        'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap'
    ];

    fontLinks.forEach(href => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'style';
        link.href = href;
        link.onload = function () { this.rel = 'stylesheet'; };
        document.head.appendChild(link);
    });
};

// ============================================
// PERFORMANCE: Report Web Vitals
// ============================================
const reportWebVitals = (metric) => {
    // Send to analytics
    if (import.meta.env.PROD) {
        console.log('[WebVitals]', metric.name, metric.value);

        // Example: Send to Google Analytics
        // gtag('event', metric.name, {
        //     value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        //     event_category: 'Web Vitals',
        //     non_interaction: true,
        // });
    }
};

// ============================================
// PERFORMANCE: Measure Core Web Vitals
// ============================================
const measureWebVitals = async () => {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
        try {
            // LCP (Largest Contentful Paint)
            const lcpObserver = new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                const lastEntry = entries[entries.length - 1];
                reportWebVitals({ name: 'LCP', value: lastEntry.startTime });
            });
            lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

            // FID (First Input Delay)
            const fidObserver = new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                entries.forEach(entry => {
                    reportWebVitals({ name: 'FID', value: entry.processingStart - entry.startTime });
                });
            });
            fidObserver.observe({ type: 'first-input', buffered: true });

            // CLS (Cumulative Layout Shift)
            let clsValue = 0;
            const clsObserver = new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                entries.forEach(entry => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                });
                reportWebVitals({ name: 'CLS', value: clsValue });
            });
            clsObserver.observe({ type: 'layout-shift', buffered: true });

        } catch (error) {
            console.error('[WebVitals] Error measuring:', error);
        }
    }
};

// ============================================
// PERFORMANCE: Error Boundary Fallback
// ============================================
const ErrorFallback = () => (
    <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-primary, #0f0f1a)',
        color: 'var(--color-text-primary, #ffffff)',
        fontFamily: 'system-ui, sans-serif',
        padding: '20px',
        textAlign: 'center'
    }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Something went wrong</h1>
        <p style={{ marginBottom: '1rem', opacity: 0.7 }}>We're working to fix this issue.</p>
        <button
            onClick={() => window.location.reload()}
            style={{
                padding: '12px 24px',
                backgroundColor: '#8B5CF6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer'
            }}
        >
            Refresh Page
        </button>
    </div>
);

// ============================================
// RENDER APPLICATION
// ============================================
const container = document.getElementById('root');
const root = createRoot(container);

root.render(
    <React.StrictMode>
        <HelmetProvider>
            <BrowserRouter>
                <AuthProvider>
                    <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem>
                        <App />
                    </ThemeProvider>
                </AuthProvider>
            </BrowserRouter>
        </HelmetProvider>
    </React.StrictMode>
);

// ============================================
// POST-RENDER INITIALIZATION
// ============================================
removeInitialLoader();
registerServiceWorker();
preloadCriticalResources();
measureWebVitals();

// ============================================
// HOT MODULE REPLACEMENT (Development)
// ============================================
if (import.meta.hot) {
    import.meta.hot.accept();
}
