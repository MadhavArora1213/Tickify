import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

const AdminDashboard = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        activeEvents: 0,
        pendingApprovals: 0,
        totalRevenue: 0,
        ticketsSold: 0,
        pendingSettlements: 0
    });
    const [adminProfile, setAdminProfile] = useState(null);

    const { currentUser, logout, userRole } = useAuth();
    const navigate = useNavigate();

    // Fetch admin profile from 'admins' collection
    useEffect(() => {
        const fetchAdminProfile = async () => {
            if (currentUser) {
                console.log('Fetching admin profile for:', currentUser.uid);
                try {
                    const adminDocRef = doc(db, 'admins', currentUser.uid);
                    const adminDoc = await getDoc(adminDocRef);
                    console.log('Admin doc exists:', adminDoc.exists());
                    if (adminDoc.exists()) {
                        const data = adminDoc.data();
                        console.log('Admin profile data:', data);
                        setAdminProfile(data);
                    } else {
                        console.log('No admin document found for UID:', currentUser.uid);
                    }
                } catch (error) {
                    console.error('Error fetching admin profile:', error);
                }
            }
        };
        fetchAdminProfile();
    }, [currentUser]);

    // Fetch real data from Firebase
    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                // Fetch users from 'users' collection (only regular users)
                const usersRef = collection(db, 'users');
                const usersSnapshot = await getDocs(usersRef);
                const usersData = usersSnapshot.docs.map(doc => doc.data());

                // Filter only regular users (not admin, organizer, scanner)
                const regularUsers = usersData.filter(user => !user.role || user.role === 'user');
                const activeUserCount = regularUsers.filter(user => user.status === 'active').length;

                // Fetch events (if collection exists)
                let activeEventsCount = 0;
                let pendingApprovalsCount = 0;
                try {
                    const eventsRef = collection(db, 'events');
                    const eventsSnapshot = await getDocs(eventsRef);
                    const eventsData = eventsSnapshot.docs.map(doc => doc.data());
                    activeEventsCount = eventsData.filter(event => event.status === 'active' || event.status === 'published').length;
                    pendingApprovalsCount = eventsData.filter(event => event.status === 'pending').length;
                } catch (e) {
                    // Events collection may not exist yet
                    console.log('Events collection not found');
                }

                // Fetch orders/tickets (if collection exists)
                let ticketCount = 0;
                let totalRevenue = 0;
                try {
                    const ordersRef = collection(db, 'orders');
                    const ordersSnapshot = await getDocs(ordersRef);
                    const ordersData = ordersSnapshot.docs.map(doc => doc.data());
                    ticketCount = ordersData.reduce((sum, order) => sum + (order.ticketCount || 1), 0);
                    totalRevenue = ordersData.reduce((sum, order) => sum + (order.total || 0), 0);
                } catch (e) {
                    console.log('Orders collection not found');
                }

                // Fetch settlements (if collection exists)
                let pendingSettlementsCount = 0;
                try {
                    const settlementsRef = collection(db, 'settlements');
                    const settlementsSnapshot = await getDocs(settlementsRef);
                    const settlementsData = settlementsSnapshot.docs.map(doc => doc.data());
                    pendingSettlementsCount = settlementsData.filter(s => s.status === 'pending').length;
                } catch (e) {
                    console.log('Settlements collection not found');
                }

                setStats({
                    totalUsers: regularUsers.length,
                    activeUsers: activeUserCount,
                    activeEvents: activeEventsCount,
                    pendingApprovals: pendingApprovalsCount,
                    totalRevenue: totalRevenue,
                    ticketsSold: ticketCount,
                    pendingSettlements: pendingSettlementsCount
                });
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/admin/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const quickActions = [
        { icon: '👥', label: 'Manage Users', path: '/admin/users', color: 'bg-blue-500', count: stats.totalUsers },
        { icon: '📅', label: 'Event Approvals', path: '/admin/events', color: 'bg-yellow-500', count: stats.pendingApprovals },
        { icon: '💰', label: 'Settlements', path: '/admin/settlements', color: 'bg-green-500', count: stats.pendingSettlements },
        { icon: '📊', label: 'Analytics', path: '/admin/analytics', color: 'bg-purple-500', count: null },
        { icon: '⚙️', label: 'Settings', path: '/admin/settings', color: 'bg-gray-600', count: null },
    ];

    const recentActivity = [
        { id: 1, type: 'user', message: `Total registered users: ${stats.totalUsers}`, time: 'Live', icon: '👤' },
        { id: 2, type: 'event', message: `Active events: ${stats.activeEvents}`, time: 'Live', icon: '📅' },
        { id: 3, type: 'payment', message: `Total revenue: $${stats.totalRevenue.toLocaleString()}`, time: 'Live', icon: '💳' },
        { id: 4, type: 'ticket', message: `Tickets sold: ${stats.ticketsSold}`, time: 'Live', icon: '🎫' },
        { id: 5, type: 'alert', message: `Pending approvals: ${stats.pendingApprovals}`, time: 'Live', icon: '⏳' },
    ];

    return (
        <div className="min-h-screen bg-gray-100 font-mono text-sm text-black">
            {/* Header */}
            <div className="bg-black text-white p-4 border-b-4 border-red-600 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-red-600 border-2 border-white flex items-center justify-center font-black text-xl">
                            T
                        </div>
                        <div>
                            <span className="font-black uppercase tracking-widest text-lg">Admin Dashboard</span>
                            <p className="text-xs text-gray-400">
                                Welcome back, <span className="text-white font-bold">{adminProfile?.displayName || currentUser?.displayName || 'Administrator'}</span>
                                {adminProfile?.role && <span className="ml-2 px-2 py-0.5 bg-red-600 text-white text-[10px] uppercase rounded">{adminProfile.role}</span>}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        {/* Live Clock */}
                        <div className="hidden md:flex items-center gap-2 bg-gray-800 px-4 py-2 border border-gray-600">
                            <span className="text-green-400 animate-pulse">●</span>
                            <span className="font-bold">{currentTime.toLocaleTimeString()}</span>
                        </div>
                        {/* Notifications */}
                        <button className="relative p-2 hover:bg-gray-800 transition-colors">
                            <span className="text-xl">🔔</span>
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs font-black rounded-full flex items-center justify-center">3</span>
                        </button>
                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-red-600 text-white font-black uppercase text-xs border border-white hover:bg-red-500 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6 space-y-8">
                {/* System Status */}
                <div className="bg-green-100 border-4 border-green-600 p-4 shadow-[4px_4px_0_#166534] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">✅</span>
                        <div>
                            <span className="font-black uppercase text-green-800">All Systems Operational</span>
                            <p className="text-xs text-green-600">Last check: {currentTime.toLocaleTimeString()}</p>
                        </div>
                    </div>
                    <Link to="/admin/settings" className="text-xs font-black uppercase text-green-700 hover:text-green-900 underline">
                        View Status →
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[
                        { label: 'Total Users', value: loading ? '...' : stats.totalUsers.toLocaleString(), icon: '👥', color: 'bg-blue-500' },
                        { label: 'Active Events', value: loading ? '...' : stats.activeEvents, icon: '📅', color: 'bg-purple-500' },
                        { label: 'Pending Approvals', value: loading ? '...' : stats.pendingApprovals, icon: '⏳', color: 'bg-yellow-500' },
                        { label: 'Total Revenue', value: loading ? '...' : `$${stats.totalRevenue.toLocaleString()}`, icon: '💰', color: 'bg-green-500' },
                        { label: 'Tickets Sold', value: loading ? '...' : stats.ticketsSold.toLocaleString(), icon: '🎫', color: 'bg-pink-500' },
                        { label: 'Settlements', value: loading ? '...' : stats.pendingSettlements, icon: '💳', color: 'bg-orange-500' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white border-4 border-black p-4 shadow-[4px_4px_0_black] hover:shadow-[6px_6px_0_black] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
                            <div className={`w-10 h-10 ${stat.color} text-white flex items-center justify-center text-xl mb-3 border-2 border-black`}>
                                {stat.icon}
                            </div>
                            <p className={`text-2xl font-black ${loading ? 'animate-pulse text-gray-400' : ''}`}>{stat.value}</p>
                            <p className="text-xs font-bold uppercase text-gray-500">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div>
                    <h2 className="text-xl font-black uppercase mb-4 border-b-4 border-black pb-2">Quick Actions</h2>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {quickActions.map((action, i) => (
                            <Link
                                key={i}
                                to={action.path}
                                className="bg-white border-4 border-black p-6 shadow-[6px_6px_0_black] hover:shadow-[8px_8px_0_black] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all text-center group"
                            >
                                <div className={`w-14 h-14 ${action.color} text-white flex items-center justify-center text-3xl mx-auto mb-3 border-2 border-black group-hover:scale-110 transition-transform`}>
                                    {action.icon}
                                </div>
                                <span className="font-black uppercase text-sm">{action.label}</span>
                                {action.count !== null && (
                                    <span className="block mt-2 text-xs font-bold text-gray-500">{action.count} items</span>
                                )}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Activity */}
                    <div className="bg-white border-4 border-black shadow-[8px_8px_0_gray]">
                        <div className="bg-black text-white p-4 flex justify-between items-center">
                            <span className="font-black uppercase tracking-wider">Recent Activity</span>
                            <span className="text-xs text-gray-400">Live Feed</span>
                        </div>
                        <div className="divide-y-2 divide-gray-200">
                            {recentActivity.map((activity) => (
                                <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors flex items-start gap-4">
                                    <div className="w-10 h-10 bg-gray-100 border-2 border-black flex items-center justify-center text-xl flex-shrink-0">
                                        {activity.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm truncate">{activity.message}</p>
                                        <p className="text-xs text-gray-500 font-medium">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 bg-gray-50 border-t-2 border-black">
                            <Link to="/admin/analytics" className="text-xs font-black uppercase text-blue-600 hover:underline">
                                View All Activity →
                            </Link>
                        </div>
                    </div>

                    {/* Performance Overview */}
                    <div className="bg-white border-4 border-black shadow-[8px_8px_0_gray]">
                        <div className="bg-black text-white p-4 flex justify-between items-center">
                            <span className="font-black uppercase tracking-wider">Performance</span>
                            <span className="text-xs text-green-400">↑ +12% this week</span>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Chart Placeholder */}
                            <div className="h-40 flex items-end gap-2 border-b-2 border-black pb-2 px-2">
                                {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                                    <div key={i} className="flex-1 bg-blue-500 hover:bg-blue-400 transition-colors border border-black relative group" style={{ height: `${h}%` }}>
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white px-2 py-1 text-[10px] hidden group-hover:block z-10 whitespace-nowrap">
                                            {h}%
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* KPIs */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-blue-50 border-2 border-blue-300">
                                    <span className="text-2xl font-black text-blue-600">98.5%</span>
                                    <p className="text-xs font-bold uppercase text-blue-400">Uptime</p>
                                </div>
                                <div className="p-4 bg-green-50 border-2 border-green-300">
                                    <span className="text-2xl font-black text-green-600">2.4s</span>
                                    <p className="text-xs font-bold uppercase text-green-400">Avg Load Time</p>
                                </div>
                                <div className="p-4 bg-purple-50 border-2 border-purple-300">
                                    <span className="text-2xl font-black text-purple-600">4.8/5</span>
                                    <p className="text-xs font-bold uppercase text-purple-400">User Rating</p>
                                </div>
                                <div className="p-4 bg-orange-50 border-2 border-orange-300">
                                    <span className="text-2xl font-black text-orange-600">12.3%</span>
                                    <p className="text-xs font-bold uppercase text-orange-400">Conversion Rate</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center py-6 border-t-2 border-gray-300">
                    <p className="text-xs text-gray-500 font-bold">
                        Tickify Admin Panel v2.0 | Server: US-East-1 |
                        <span className="text-green-600"> ● Connected</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
