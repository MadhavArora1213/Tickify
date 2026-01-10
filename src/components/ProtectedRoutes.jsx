import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
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

// User Protected Route - Requires user role
export const UserRoute = ({ children }) => {
    const { currentUser, userRole, userStatus, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!currentUser) {
        // Show a "Login Required" prompt instead of a direct redirect
        return (
            <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center p-6 text-center transition-colors duration-300">
                <div className="neo-card bg-[var(--color-bg-surface)] p-12 border-4 border-black shadow-[12px_12px_0_black] max-w-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-[var(--color-accent-primary)]/10 -rotate-45 translate-x-10 -translate-y-10"></div>
                    <div className="text-7xl mb-6">🔑</div>
                    <h1 className="text-4xl font-black text-[var(--color-text-primary)] uppercase tracking-tighter mb-4">Login Required</h1>
                    <div className="w-20 h-2 bg-[var(--color-accent-primary)] mx-auto mb-6"></div>
                    <p className="text-[var(--color-text-secondary)] font-bold mb-8 text-lg">
                        You need to be logged in to access this page. Please sign in to your Tickify account to continue.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/login"
                            state={{ from: location }}
                            className="neo-btn bg-[var(--color-accent-primary)] text-white font-black py-4 px-8 border-2 border-black shadow-[4px_4px_0_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0_black] transition-all uppercase"
                        >
                            Log In Now
                        </Link>
                        <Link
                            to="/"
                            className="neo-btn bg-white text-black font-black py-4 px-8 border-2 border-black shadow-[4px_4px_0_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0_black] transition-all uppercase"
                        >
                            Back Home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (userStatus === 'suspended') {
        return (
            <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center p-6 text-center transition-colors duration-300">
                <div className="neo-card bg-[var(--color-bg-surface)] p-12 border-4 border-red-500 shadow-[12px_12px_0_red] max-w-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 -rotate-45 translate-x-10 -translate-y-10"></div>
                    <div className="text-7xl mb-6">🚫</div>
                    <h1 className="text-4xl font-black text-red-600 uppercase tracking-tighter mb-4">Account Blocked</h1>
                    <div className="w-20 h-2 bg-red-600 mx-auto mb-6"></div>
                    <p className="text-[var(--color-text-secondary)] font-bold mb-8 text-lg">
                        Your account has been suspended due to a violation of our terms of service.
                    </p>
                    <a
                        href="/contact"
                        className="neo-btn inline-block bg-red-600 text-white font-black py-4 px-8 border-2 border-black shadow-[6px_6px_0_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0_black] transition-all uppercase"
                    >
                        Contact Support
                    </a>
                </div>
            </div>
        );
    }

    if (userRole !== 'user') {
        return (
            <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center p-6 text-center">
                <div className="neo-card bg-[var(--color-bg-surface)] p-12 border-4 border-orange-500 shadow-[12px_12px_0_orange] max-w-lg">
                    <div className="text-7xl mb-6">👤</div>
                    <h1 className="text-4xl font-black text-orange-600 uppercase tracking-tighter mb-4">User Access Required</h1>
                    <p className="text-[var(--color-text-secondary)] font-bold mb-8 text-lg">
                        This area is reserved for customer accounts. Please log in as a regular user to continue.
                    </p>
                    <div className="flex flex-col gap-4">
                        <a href="/login" className="neo-btn bg-orange-600 text-white font-black py-4 border-2 border-black shadow-[4px_4px_0_black] uppercase">
                            Go to User Login
                        </a>
                        <a href="/" className="text-[var(--color-text-secondary)] font-bold hover:underline">
                            Back to Home
                        </a>
                    </div>
                </div>
            </div>
        );
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
    const { currentUser, userRole, userStatus, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!currentUser) {
        return <Navigate to="/organizer/login" state={{ from: location }} replace />;
    }

    if (userRole !== 'organizer') {
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

    if (userRole === 'organizer' && userStatus === 'pending') {
        return (
            <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center p-6 text-center">
                <div className="neo-card bg-[var(--color-bg-surface)] p-12 border-4 border-[var(--color-text-primary)] shadow-[12px_12px_0_var(--color-text-primary)] max-w-lg">
                    <div className="text-7xl mb-6 animate-bounce">⏳</div>
                    <h1 className="text-4xl font-black text-[var(--color-text-primary)] uppercase tracking-tighter mb-4">Approval Pending</h1>
                    <div className="w-20 h-2 bg-yellow-500 mx-auto mb-6"></div>
                    <p className="text-[var(--color-text-secondary)] font-bold mb-8 text-lg leading-relaxed">
                        Your account is currently being reviewed by our team. You'll be notified via email once you're cleared to host events!
                    </p>
                    <a
                        href="/organizer/login"
                        className="neo-btn inline-block bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] font-black py-4 px-8 border-2 border-[var(--color-text-primary)] shadow-[6px_6px_0_var(--color-accent-secondary)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0_var(--color-text-primary)] transition-all uppercase"
                    >
                        Back to Login
                    </a>
                </div>
            </div>
        );
    }

    if (userRole === 'organizer' && userStatus === 'suspended') {
        return (
            <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center p-6 text-center">
                <div className="neo-card bg-[var(--color-bg-surface)] p-12 border-4 border-red-500 shadow-[12px_12px_0_red] max-w-lg">
                    <div className="text-7xl mb-6">🚫</div>
                    <h1 className="text-4xl font-black text-red-600 uppercase tracking-tighter mb-4">Account Suspended</h1>
                    <div className="w-20 h-2 bg-red-600 mx-auto mb-6"></div>
                    <p className="text-[var(--color-text-secondary)] font-bold mb-8 text-lg">
                        Your organizer account has been suspended. Please contact our support team for more information.
                    </p>
                    <a
                        href="/contact"
                        className="neo-btn inline-block bg-red-600 text-white font-black py-4 px-8 border-2 border-black shadow-[6px_6px_0_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0_black] transition-all uppercase"
                    >
                        Contact Support
                    </a>
                </div>
            </div>
        );
    }

    return children;
};

// Organizer Guest Route - Redirects already logged-in organizers to their dashboard
export const OrganizerGuestRoute = ({ children }) => {
    const { currentUser, userRole, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner />;
    }

    if (currentUser && userRole === 'organizer') {
        return <Navigate to="/organizer/dashboard" replace />;
    }

    return children;
};

// Scanner Protected Route - Requires scanner role
export const ScannerRoute = ({ children }) => {
    const { currentUser, userRole, userStatus, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!currentUser) {
        return <Navigate to="/scanner/login" state={{ from: location }} replace />;
    }

    if (userRole === 'scanner' && userStatus === 'suspended') {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6 text-center">
                <div className="bg-gray-800 border-4 border-red-500 p-12 max-w-lg shadow-[12px_12px_0_red]">
                    <div className="text-7xl mb-6">🚫</div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">Access Revoked</h1>
                    <p className="text-gray-400 font-bold mb-8 text-lg">
                        This scanner account has been disabled. Please contact your organizer.
                    </p>
                </div>
            </div>
        );
    }

    if (userRole !== 'scanner') {
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

// Export UserRoute (already defined above)
export const ProtectedRoute = UserRoute;

export default ProtectedRoute;

