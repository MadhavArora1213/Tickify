import React, { Suspense, lazy, memo } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { UserRoute, AdminRoute, PublicRoute, AdminPublicRoute, OrganizerRoute, OrganizerGuestRoute, ScannerRoute, GuestRoute } from './components/ProtectedRoutes';

// ============================================
// CRITICAL COMPONENTS - Load immediately
// ============================================
import Home from './pages/Home';
import ThemeToggle from './components/ThemeToggle';

// ============================================
// LAZY LOADED COMPONENTS - Code Splitting
// ============================================

// Public Pages
const Events = lazy(() => import('./pages/Events'));
const EventDetails = lazy(() => import('./pages/EventDetails'));
const OrganizerPublicProfile = lazy(() => import('./pages/OrganizerPublicProfile'));
const SeatSelection = lazy(() => import('./pages/SeatSelection'));
const ResellMarketplace = lazy(() => import('./pages/ResellMarketplace'));

// Auth Pages
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));

// User Pages
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));
const MyTickets = lazy(() => import('./pages/MyTickets'));
const Profile = lazy(() => import('./pages/Profile'));

// Info Pages
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const FAQ = lazy(() => import('./pages/FAQ'));
const HelpCenter = lazy(() => import('./pages/HelpCenter'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Careers = lazy(() => import('./pages/Careers'));
const CookiePolicy = lazy(() => import('./pages/CookiePolicy'));
const VerifyTicket = lazy(() => import('./pages/VerifyTicket'));

// Error Pages
const NotFound = lazy(() => import('./pages/NotFound'));
const ServerError = lazy(() => import('./pages/ServerError'));
const Maintenance = lazy(() => import('./pages/Maintenance'));

// Organizer Pages - Chunked together
const OrganizerLogin = lazy(() => import(/* webpackChunkName: "organizer" */ './pages/organizer/OrganizerLogin'));
const OrganizerRegister = lazy(() => import(/* webpackChunkName: "organizer" */ './pages/organizer/OrganizerRegister'));
const OrganizerForgotPassword = lazy(() => import(/* webpackChunkName: "organizer" */ './pages/organizer/OrganizerForgotPassword'));
const OrganizerDashboard = lazy(() => import(/* webpackChunkName: "organizer" */ './pages/organizer/OrganizerDashboard'));
const CreateEvent = lazy(() => import(/* webpackChunkName: "organizer" */ './pages/organizer/CreateEvent'));
const ManageEvents = lazy(() => import(/* webpackChunkName: "organizer" */ './pages/organizer/ManageEvents'));
const EventAnalytics = lazy(() => import(/* webpackChunkName: "organizer" */ './pages/organizer/EventAnalytics'));
const Settlements = lazy(() => import(/* webpackChunkName: "organizer" */ './pages/organizer/Settlements'));
const OrganizerProfile = lazy(() => import(/* webpackChunkName: "organizer" */ './pages/organizer/OrganizerProfile'));

// Scanner Pages - Chunked together
const ScannerLogin = lazy(() => import(/* webpackChunkName: "scanner" */ './pages/scanner/ScannerLogin'));
const ScannerEvents = lazy(() => import(/* webpackChunkName: "scanner" */ './pages/scanner/ScannerEvents'));
const ScannerInterface = lazy(() => import(/* webpackChunkName: "scanner" */ './pages/scanner/ScannerInterface'));
const ScanResult = lazy(() => import(/* webpackChunkName: "scanner" */ './pages/scanner/ScanResult'));

// Admin Pages - Chunked together
const AdminLogin = lazy(() => import(/* webpackChunkName: "admin" */ './pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import(/* webpackChunkName: "admin" */ './pages/admin/AdminDashboard'));
const AdminEventApproval = lazy(() => import(/* webpackChunkName: "admin" */ './pages/admin/AdminEventApproval'));
const AdminSettlements = lazy(() => import(/* webpackChunkName: "admin" */ './pages/admin/AdminSettlements'));
const AdminUsers = lazy(() => import(/* webpackChunkName: "admin" */ './pages/admin/AdminUsers'));
const AdminAnalytics = lazy(() => import(/* webpackChunkName: "admin" */ './pages/admin/AdminAnalytics'));
const AdminSettings = lazy(() => import(/* webpackChunkName: "admin" */ './pages/admin/AdminSettings'));

// UI Components - Lazy for non-critical
const Footer = lazy(() => import('./components/Footer'));
const BubbleMenu = lazy(() => import('./components/react-bits/BubbleMenu'));

// ============================================
// LOADING FALLBACK COMPONENT
// ============================================
const LoadingFallback = memo(() => (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)]">
        <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="absolute inset-0 border-4 border-[var(--color-accent-primary)] border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-2 border-4 border-[var(--color-accent-secondary)] border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.6s' }}></div>
            </div>
            <p className="text-[var(--color-text-secondary)] font-bold uppercase text-sm tracking-wider">Loading...</p>
        </div>
    </div>
));

LoadingFallback.displayName = 'LoadingFallback';

// ============================================
// ROUTE WRAPPER WITH SUSPENSE
// ============================================
const SuspenseRoute = memo(({ children }) => (
    <Suspense fallback={<LoadingFallback />}>
        {children}
    </Suspense>
));

SuspenseRoute.displayName = 'SuspenseRoute';

// ============================================
// MAIN APP COMPONENT
// ============================================
function App() {
    const location = useLocation();
    const hideUiElements = location.pathname.startsWith('/organizer') ||
        location.pathname.startsWith('/scanner') ||
        location.pathname.startsWith('/admin') ||
        location.pathname === '/login' ||
        location.pathname === '/register' ||
        location.pathname === '/forgot-password' ||
        location.pathname === '/organizer/forgot-password';

    return (
        <div className="min-h-screen flex flex-col font-sans bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] transition-colors duration-300">
            <main className="flex-grow">
                <Routes>
                    {/* Critical Route - No lazy loading */}
                    <Route path="/" element={<Home />} />

                    {/* Public Routes */}
                    <Route path="/events" element={
                        <SuspenseRoute><Events /></SuspenseRoute>
                    } />
                    <Route path="/events/:id" element={
                        <SuspenseRoute><EventDetails /></SuspenseRoute>
                    } />
                    <Route path="/organizer-public/:id" element={
                        <SuspenseRoute><OrganizerPublicProfile /></SuspenseRoute>
                    } />
                    <Route path="/events/:id/seats" element={
                        <SuspenseRoute><SeatSelection /></SuspenseRoute>
                    } />
                    <Route path="/resell" element={
                        <SuspenseRoute><ResellMarketplace /></SuspenseRoute>
                    } />
                    <Route path="/payment/success" element={
                        <SuspenseRoute><PaymentSuccess /></SuspenseRoute>
                    } />

                    {/* User Auth Routes */}
                    <Route path="/login" element={
                        <GuestRoute>
                            <SuspenseRoute><Login /></SuspenseRoute>
                        </GuestRoute>
                    } />
                    <Route path="/register" element={
                        <GuestRoute>
                            <SuspenseRoute><Register /></SuspenseRoute>
                        </GuestRoute>
                    } />
                    <Route path="/forgot-password" element={
                        <GuestRoute>
                            <SuspenseRoute><ForgotPassword /></SuspenseRoute>
                        </GuestRoute>
                    } />

                    {/* Protected User Routes */}
                    <Route path="/cart" element={
                        <UserRoute>
                            <SuspenseRoute><Cart /></SuspenseRoute>
                        </UserRoute>
                    } />
                    <Route path="/checkout" element={
                        <UserRoute>
                            <SuspenseRoute><Checkout /></SuspenseRoute>
                        </UserRoute>
                    } />
                    <Route path="/my-tickets" element={
                        <UserRoute>
                            <SuspenseRoute><MyTickets /></SuspenseRoute>
                        </UserRoute>
                    } />
                    <Route path="/profile" element={
                        <UserRoute>
                            <SuspenseRoute><Profile /></SuspenseRoute>
                        </UserRoute>
                    } />

                    {/* Organizer Routes */}
                    <Route path="/organizer/login" element={
                        <OrganizerGuestRoute>
                            <SuspenseRoute><OrganizerLogin /></SuspenseRoute>
                        </OrganizerGuestRoute>
                    } />
                    <Route path="/organizer/register" element={
                        <OrganizerGuestRoute>
                            <SuspenseRoute><OrganizerRegister /></SuspenseRoute>
                        </OrganizerGuestRoute>
                    } />
                    <Route path="/organizer/forgot-password" element={
                        <OrganizerGuestRoute>
                            <SuspenseRoute><OrganizerForgotPassword /></SuspenseRoute>
                        </OrganizerGuestRoute>
                    } />
                    <Route path="/organizer/dashboard" element={
                        <OrganizerRoute>
                            <SuspenseRoute><OrganizerDashboard /></SuspenseRoute>
                        </OrganizerRoute>
                    } />
                    <Route path="/organizer/events" element={
                        <OrganizerRoute>
                            <SuspenseRoute><ManageEvents /></SuspenseRoute>
                        </OrganizerRoute>
                    } />
                    <Route path="/organizer/events/create" element={
                        <OrganizerRoute>
                            <SuspenseRoute><CreateEvent /></SuspenseRoute>
                        </OrganizerRoute>
                    } />
                    <Route path="/organizer/events/:eventId/edit" element={
                        <OrganizerRoute>
                            <SuspenseRoute><CreateEvent /></SuspenseRoute>
                        </OrganizerRoute>
                    } />
                    <Route path="/organizer/events/:eventId/analytics" element={
                        <OrganizerRoute>
                            <SuspenseRoute><EventAnalytics /></SuspenseRoute>
                        </OrganizerRoute>
                    } />
                    <Route path="/organizer/settlements" element={
                        <OrganizerRoute>
                            <SuspenseRoute><Settlements /></SuspenseRoute>
                        </OrganizerRoute>
                    } />
                    <Route path="/organizer/profile" element={
                        <OrganizerRoute>
                            <SuspenseRoute><OrganizerProfile /></SuspenseRoute>
                        </OrganizerRoute>
                    } />

                    {/* Scanner Routes */}
                    <Route path="/scanner/login" element={
                        <SuspenseRoute><ScannerLogin /></SuspenseRoute>
                    } />
                    <Route path="/scanner/events" element={
                        <ScannerRoute>
                            <SuspenseRoute><ScannerEvents /></SuspenseRoute>
                        </ScannerRoute>
                    } />
                    <Route path="/scanner/scan" element={
                        <ScannerRoute>
                            <SuspenseRoute><ScannerInterface /></SuspenseRoute>
                        </ScannerRoute>
                    } />
                    <Route path="/scanner/results" element={
                        <ScannerRoute>
                            <SuspenseRoute><ScanResult /></SuspenseRoute>
                        </ScannerRoute>
                    } />

                    {/* Admin Routes */}
                    <Route path="/admin/login" element={
                        <AdminPublicRoute>
                            <SuspenseRoute><AdminLogin /></SuspenseRoute>
                        </AdminPublicRoute>
                    } />
                    <Route path="/admin/dashboard" element={
                        <AdminRoute>
                            <SuspenseRoute><AdminDashboard /></SuspenseRoute>
                        </AdminRoute>
                    } />
                    <Route path="/admin/events" element={
                        <AdminRoute>
                            <SuspenseRoute><AdminEventApproval /></SuspenseRoute>
                        </AdminRoute>
                    } />
                    <Route path="/admin/events/pending" element={
                        <AdminRoute>
                            <SuspenseRoute><AdminEventApproval /></SuspenseRoute>
                        </AdminRoute>
                    } />
                    <Route path="/admin/settlements" element={
                        <AdminRoute>
                            <SuspenseRoute><AdminSettlements /></SuspenseRoute>
                        </AdminRoute>
                    } />
                    <Route path="/admin/users" element={
                        <AdminRoute>
                            <SuspenseRoute><AdminUsers /></SuspenseRoute>
                        </AdminRoute>
                    } />
                    <Route path="/admin/analytics" element={
                        <AdminRoute>
                            <SuspenseRoute><AdminAnalytics /></SuspenseRoute>
                        </AdminRoute>
                    } />
                    <Route path="/admin/settings" element={
                        <AdminRoute>
                            <SuspenseRoute><AdminSettings /></SuspenseRoute>
                        </AdminRoute>
                    } />

                    {/* Verification Route */}
                    <Route path="/verify/:bookingId" element={
                        <SuspenseRoute><VerifyTicket /></SuspenseRoute>
                    } />

                    {/* Public Info Pages */}
                    <Route path="/about" element={
                        <SuspenseRoute><About /></SuspenseRoute>
                    } />
                    <Route path="/contact" element={
                        <SuspenseRoute><Contact /></SuspenseRoute>
                    } />
                    <Route path="/terms" element={
                        <SuspenseRoute><Terms /></SuspenseRoute>
                    } />
                    <Route path="/privacy" element={
                        <SuspenseRoute><Privacy /></SuspenseRoute>
                    } />
                    <Route path="/cookie-policy" element={
                        <SuspenseRoute><CookiePolicy /></SuspenseRoute>
                    } />
                    <Route path="/pricing" element={
                        <SuspenseRoute><Pricing /></SuspenseRoute>
                    } />
                    <Route path="/careers" element={
                        <SuspenseRoute><Careers /></SuspenseRoute>
                    } />
                    <Route path="/faq" element={
                        <SuspenseRoute><FAQ /></SuspenseRoute>
                    } />
                    <Route path="/help" element={
                        <SuspenseRoute><HelpCenter /></SuspenseRoute>
                    } />

                    {/* Error Pages */}
                    <Route path="/404" element={
                        <SuspenseRoute><NotFound /></SuspenseRoute>
                    } />
                    <Route path="/500" element={
                        <SuspenseRoute><ServerError /></SuspenseRoute>
                    } />
                    <Route path="/maintenance" element={
                        <SuspenseRoute><Maintenance /></SuspenseRoute>
                    } />
                    <Route path="*" element={
                        <SuspenseRoute><NotFound /></SuspenseRoute>
                    } />
                </Routes>
            </main>

            {/* Theme Toggle - Always visible */}
            <ThemeToggle />

            {/* Lazy loaded UI elements */}
            {!hideUiElements && (
                <Suspense fallback={null}>
                    <BubbleMenu />
                    <Footer />
                </Suspense>
            )}
        </div>
    );
}

export default memo(App);
