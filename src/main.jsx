import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from 'next-themes'
import App from './App'
import './index.css'

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
        } catch (error) {
            console.error('[App] Service Worker registration failed:', error);
        }
    }
};

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

// Register service worker in production
registerServiceWorker();

// Hot Module Replacement for development
if (import.meta.hot) {
    import.meta.hot.accept();
}
