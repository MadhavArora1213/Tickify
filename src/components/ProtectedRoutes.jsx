import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Loading spinner component
const LoadingSpinner = () => (
    <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center">
        <div className="text-center">
            <div className="w-16 h-16 border-4 border-[var(--color-accent-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[var(--color-text-secondary)] font-bold uppercase tracking-wider">Loading...</p>
        </div>
    </div>
);

// Protected Route - Requires authentication
export const ProtectedRoute = ({ children }) => {
    const { currentUser, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!currentUser) {
        // Redirect to login with return URL
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

// Admin Protected Route - Requires admin role
export const AdminRoute = ({ children }) => {
    const { currentUser, userRole, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!currentUser) {
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    if (userRole !== 'admin') {
        // Not an admin, redirect to admin login
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
                <div className="bg-gray-800 border-4 border-red-600 p-8 max-w-md text-center">
                    <div className="text-6xl mb-4">🚫</div>
                    <h1 className="text-2xl font-black text-white uppercase mb-2">Access Denied</h1>
                    <p className="text-gray-400 mb-6">You don't have permission to access this area.</p>
                    <div className="space-y-3">
                        <a
                            href="/admin/login"
                            className="block w-full py-3 bg-red-600 text-white font-black uppercase border-2 border-white hover:bg-red-500 transition-colors"
                        >
                            Admin Login
                        </a>
                        <a
                            href="/"
                            className="block w-full py-3 bg-gray-700 text-white font-bold uppercase border-2 border-gray-500 hover:bg-gray-600 transition-colors"
                        >
                            Back to Home
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return children;
};

// Organizer Protected Route - Requires organizer role
export const OrganizerRoute = ({ children }) => {
    const { currentUser, userRole, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!currentUser) {
        return <Navigate to="/organizer/login" state={{ from: location }} replace />;
    }

    if (userRole !== 'organizer' && userRole !== 'admin') {
        return (
            <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center p-6">
                <div className="bg-[var(--color-bg-surface)] border-4 border-[var(--color-text-primary)] p-8 max-w-md text-center shadow-[8px_8px_0_var(--color-text-primary)]">
                    <div className="text-6xl mb-4">🎫</div>
                    <h1 className="text-2xl font-black text-[var(--color-text-primary)] uppercase mb-2">Organizer Access Required</h1>
                    <p className="text-[var(--color-text-secondary)] mb-6">You need an organizer account to access this area.</p>
                    <div className="space-y-3">
                        <a
                            href="/organizer/login"
                            className="block w-full py-3 bg-[var(--color-accent-secondary)] text-white font-black uppercase border-2 border-[var(--color-text-primary)] hover:opacity-90 transition-opacity"
                        >
                            Organizer Login
                        </a>
                        <a
                            href="/"
                            className="block w-full py-3 bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] font-bold uppercase border-2 border-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] transition-colors"
                        >
                            Back to Home
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return children;
};

// Scanner Protected Route - Requires scanner role
export const ScannerRoute = ({ children }) => {
    const { currentUser, userRole, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!currentUser) {
        return <Navigate to="/scanner/login" state={{ from: location }} replace />;
    }

    if (userRole !== 'scanner' && userRole !== 'organizer' && userRole !== 'admin') {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
                <div className="bg-gray-800 border-4 border-orange-500 p-8 max-w-md text-center">
                    <div className="text-6xl mb-4">📱</div>
                    <h1 className="text-2xl font-black text-white uppercase mb-2">Scanner Access Required</h1>
                    <p className="text-gray-400 mb-6">You need a scanner account to access this area.</p>
                    <div className="space-y-3">
                        <a
                            href="/scanner/login"
                            className="block w-full py-3 bg-orange-500 text-white font-black uppercase border-2 border-white hover:bg-orange-400 transition-colors"
                        >
                            Scanner Login
                        </a>
                        <a
                            href="/"
                            className="block w-full py-3 bg-gray-700 text-white font-bold uppercase border-2 border-gray-500 hover:bg-gray-600 transition-colors"
                        >
                            Back to Home
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return children;
};

// Guest Route - Only accessible when NOT logged in (for login/register pages)
export const GuestRoute = ({ children }) => {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner />;
    }

    if (currentUser) {
        // Already logged in, redirect to home
        return <Navigate to="/" replace />;
    }

    return children;
};

// Public Route - Anyone can access (no auth check)
export const PublicRoute = ({ children }) => {
    return children;
};

// Admin Public Route - Public admin pages (like admin login)
export const AdminPublicRoute = ({ children }) => {
    const { currentUser, userRole, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner />;
    }

    // If already logged in as admin, redirect to dashboard
    if (currentUser && userRole === 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
    }

    return children;
};

// Alias for ProtectedRoute
export const UserRoute = ProtectedRoute;

export default ProtectedRoute;

