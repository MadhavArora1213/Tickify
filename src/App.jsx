import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import PaymentSuccess from './pages/PaymentSuccess';
import MyTickets from './pages/MyTickets';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import OrganizerLogin from './pages/organizer/OrganizerLogin';
import OrganizerDashboard from './pages/organizer/OrganizerDashboard';
import CreateEvent from './pages/organizer/CreateEvent';
import ManageEvents from './pages/organizer/ManageEvents';
import EventAnalytics from './pages/organizer/EventAnalytics';
import Settlements from './pages/organizer/Settlements';
import OrganizerProfile from './pages/organizer/OrganizerProfile';
import ScannerLogin from './pages/scanner/ScannerLogin';
import ScannerEvents from './pages/scanner/ScannerEvents';
import ScannerInterface from './pages/scanner/ScannerInterface';
import ScanResult from './pages/scanner/ScanResult';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEventApproval from './pages/admin/AdminEventApproval';
import AdminSettlements from './pages/admin/AdminSettlements';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminSettings from './pages/admin/AdminSettings';
import About from './pages/About';
import Contact from './pages/Contact';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import FAQ from './pages/FAQ';
import HelpCenter from './pages/HelpCenter';
import NotFound from './pages/NotFound';
import ServerError from './pages/ServerError';
import Maintenance from './pages/Maintenance';
import SeatSelection from './pages/SeatSelection';
import Header from './components/Header';
import Footer from './components/Footer';
import BubbleMenu from './components/react-bits/BubbleMenu';
import ThemeToggle from './components/ThemeToggle';


function App() {
    const location = useLocation();
    const hideUiElements = location.pathname.startsWith('/organizer') || location.pathname.startsWith('/scanner') || location.pathname.startsWith('/admin');

    return (
        <div className="min-h-screen flex flex-col font-sans bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] transition-colors duration-300">
            {/* <Header /> */}
            <main className="flex-grow">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/events" element={<Events />} />
                    <Route path="/events/:id" element={<EventDetails />} />
                    <Route path="/events/:id/seats" element={<SeatSelection />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/payment/success" element={<PaymentSuccess />} />
                    <Route path="/my-tickets" element={<MyTickets />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/organizer/login" element={<OrganizerLogin />} />
                    <Route path="/organizer/dashboard" element={<OrganizerDashboard />} />
                    <Route path="/organizer/events" element={<ManageEvents />} />
                    <Route path="/organizer/events/create" element={<CreateEvent />} />
                    <Route path="/organizer/events/:eventId/analytics" element={<EventAnalytics />} />
                    <Route path="/organizer/settlements" element={<Settlements />} />
                    <Route path="/organizer/profile" element={<OrganizerProfile />} />
                    <Route path="/scanner/login" element={<ScannerLogin />} />
                    <Route path="/scanner/events" element={<ScannerEvents />} />
                    <Route path="/scanner/scan" element={<ScannerInterface />} />
                    <Route path="/scanner/results" element={<ScanResult />} />
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/events/pending" element={<AdminEventApproval />} />
                    <Route path="/admin/settlements" element={<AdminSettlements />} />
                    <Route path="/admin/users" element={<AdminUsers />} />
                    <Route path="/admin/analytics" element={<AdminAnalytics />} />
                    <Route path="/admin/settings" element={<AdminSettings />} />

                    {/* Public Info Pages */}
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/help" element={<HelpCenter />} />

                    {/* Error Pages */}
                    <Route path="/404" element={<NotFound />} />
                    <Route path="/500" element={<ServerError />} />
                    <Route path="/maintenance" element={<Maintenance />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </main>
            <ThemeToggle />
            {!hideUiElements && <BubbleMenu />}
            {!hideUiElements && <Footer />}
        </div>
    );
}

export default App;
