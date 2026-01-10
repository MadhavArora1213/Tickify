import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { collection, getDocs, doc, getDoc, onSnapshot, query, where, orderBy, limit, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import toast from 'react-hot-toast';

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
    const [pendingEventsList, setPendingEventsList] = useState([]);
    const [activeEventsList, setActiveEventsList] = useState([]);
    const [adminProfile, setAdminProfile] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    // Fetch admin profile
    useEffect(() => {
        const fetchAdminProfile = async () => {
            if (currentUser) {
                try {
                    const adminDocRef = doc(db, 'admins', currentUser.uid);
                    const adminDoc = await getDoc(adminDocRef);
                    if (adminDoc.exists()) {
                        setAdminProfile(adminDoc.data());
                    }
                } catch (error) {
                    toast.error('Error fetching admin profile');
                }
            }
        };

        fetchAdminProfile();
    }, [currentUser]);

    // Real-time notifications listener
    useEffect(() => {
        if (!currentUser) return;

        const q = query(
            collection(db, 'notifications'),
            where('recipient', 'in', ['admin', currentUser.uid]),
            orderBy('createdAt', 'desc'),
            limit(20)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notifs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setNotifications(notifs);
            setUnreadCount(notifs.filter(n => !n.read).length);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const markAllAsRead = async () => {
        const unreadNotifs = notifications.filter(n => !n.read);
        for (const notif of unreadNotifs) {
            await updateDoc(doc(db, 'notifications', notif.id), { read: true });
        }
    };

    const markAsRead = async (id) => {
        await updateDoc(doc(db, 'notifications', id), { read: true });
    };

    // Fetch stats and lists from Firebase
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Users
                const usersRef = collection(db, 'users');
                const usersSnapshot = await getDocs(usersRef);
                const regularUsers = usersSnapshot.docs.map(doc => doc.data());
                const activeUserCount = regularUsers.filter(user => user.status === 'active').length;

                // 2. Fetch Events
                let activeCount = 0;
                let pendingCount = 0;
                let activeList = [];
                let pendingList = [];
                try {
                    const eventsRef = collection(db, 'events');
                    const eventsSnapshot = await getDocs(eventsRef);
                    const allEvents = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                    const activeEvents = allEvents.filter(e => e.status === 'active' || e.status === 'published');
                    const pendingEvents = allEvents.filter(e => e.status === 'pending');

                    activeCount = activeEvents.length;
                    pendingCount = pendingEvents.length;

                    activeList = activeEvents.slice(0, 5); // Show top 5
                    pendingList = pendingEvents.slice(0, 5); // Show top 5
                } catch (e) { console.log('Events collection not found'); }

                // 3. Fetch Bookings (Financials)
                let ticketCount = 0;
                let totalRevenue = 0;
                try {
                    const bookingsRef = collection(db, 'bookings');
                    const bookingsSnapshot = await getDocs(bookingsRef);
                    const bookingsData = bookingsSnapshot.docs.map(doc => doc.data());

                    ticketCount = bookingsData.reduce((sum, b) => {
                        return sum + (b.items?.reduce((total, item) => total + (item.quantity || 1), 0) || 0);
                    }, 0);
                    totalRevenue = bookingsData.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
                } catch (e) { console.log('Bookings collection not found'); }

                // 4. Fetch Settlements (Withdrawals)
                let pendingSettlementsCount = 0;
                try {
                    const settlementsRef = collection(db, 'withdrawals');
                    const settlementsSnapshot = await getDocs(settlementsRef);
                    pendingSettlementsCount = settlementsSnapshot.docs.filter(s => s.data().status === 'pending').length;
                } catch (e) { console.log('Withdrawals collection not found'); }

                setStats({
                    totalUsers: regularUsers.length,
                    activeUsers: activeUserCount,
                    activeEvents: activeCount,
                    pendingApprovals: pendingCount,
                    totalRevenue: totalRevenue,
                    ticketsSold: ticketCount,
                    pendingSettlements: pendingSettlementsCount
                });
                setActiveEventsList(activeList);
                setPendingEventsList(pendingList);
            } catch (error) {
                toast.error('Error fetching admin data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
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
            toast.error('Logout error');
        }
    };

    const quickActions = [
        { icon: '👥', label: 'Manage Users', path: '/admin/users', color: 'bg-blue-500', count: stats.totalUsers },
        { icon: '📅', label: 'Event Approvals', path: '/admin/events', color: 'bg-yellow-500', count: stats.pendingApprovals },
        { icon: '💰', label: 'Settlements', path: '/admin/settlements', color: 'bg-green-500', count: stats.pendingSettlements },
        { icon: '📊', label: 'Analytics', path: '/admin/analytics', color: 'bg-purple-500' },
        { icon: '⚙️', label: 'Settings', path: '/admin/settings', color: 'bg-gray-600', count: null },
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
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setShowNotifications(!showNotifications);
                                    if (!showNotifications) markAllAsRead();
                                }}
                                className={`relative p-2 hover:bg-gray-800 transition-colors ${showNotifications ? 'bg-gray-800' : ''}`}
                            >
                                <span className="text-xl">🔔</span>
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-bounce">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 bg-white border-4 border-black shadow-[8px_8px_0_black] z-[100] text-black">
                                    <div className="bg-black text-white p-3 flex justify-between items-center">
                                        <span className="font-black uppercase text-xs tracking-widest">System Alerts</span>
                                        <button onClick={() => setShowNotifications(false)} className="hover:text-red-500">✕</button>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-8 text-center text-gray-400 italic">
                                                Zero alerts. All clear! 🌈
                                            </div>
                                        ) : (
                                            notifications.map(notif => (
                                                <div
                                                    key={notif.id}
                                                    onClick={() => markAsRead(notif.id)}
                                                    className={`p-4 border-b-2 border-dashed border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer transition-colors ${!notif.read ? 'bg-yellow-50' : ''}`}
                                                >
                                                    <div className="flex gap-3">
                                                        <span className="text-xl">
                                                            {notif.type === 'event_pending' ? '📑' :
                                                                notif.type === 'payment' ? '💰' :
                                                                    notif.type === 'user_new' ? '👤' : '🔔'}
                                                        </span>
                                                        <div>
                                                            <p className={`text-xs ${!notif.read ? 'font-black' : 'font-bold'}`}>{notif.message}</p>
                                                            <p className="text-[10px] text-gray-500 mt-1 uppercase">
                                                                {notif.createdAt?.toDate ? notif.createdAt.toDate().toLocaleString() : 'Just now'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <Link
                                        to="/admin/events/pending"
                                        className="block p-3 text-center bg-gray-50 text-[10px] font-black uppercase hover:bg-red-50 transition-colors"
                                        onClick={() => setShowNotifications(false)}
                                    >
                                        View All Pending Approvals →
                                    </Link>
                                </div>
                            )}
                        </div>
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
                        { label: 'Total Revenue', value: loading ? '...' : `₹${stats.totalRevenue.toLocaleString()}`, icon: '💰', color: 'bg-green-500' },
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

                {/* Two Column Layout: Real Event Lists */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Pending Approvals List */}
                    <div className="bg-white border-4 border-black shadow-[8px_8px_0_gray]">
                        <div className="bg-yellow-500 text-black p-4 flex justify-between items-center border-b-4 border-black">
                            <span className="font-black uppercase tracking-wider">Moderation Queue (Pending)</span>
                            <span className="bg-black text-white px-2 py-0.5 text-xs font-black">{pendingEventsList.length}</span>
                        </div>
                        <div className="divide-y-2 divide-gray-200 min-h-[300px]">
                            {loading ? (
                                <div className="p-10 text-center animate-pulse uppercase font-black">Loading queue...</div>
                            ) : pendingEventsList.length === 0 ? (
                                <div className="p-10 text-center text-gray-400 uppercase font-black">Queue is clear! 🎯</div>
                            ) : (
                                pendingEventsList.map((event) => (
                                    <div key={event.id} className="p-4 hover:bg-yellow-50 transition-colors flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gray-100 border-2 border-black overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                {event.bannerUrl ? (
                                                    <img src={event.bannerUrl} alt="" className="w-full h-full object-cover" />
                                                ) : <span className="text-xl">📅</span>}
                                            </div>
                                            <div>
                                                <p className="font-black uppercase text-xs truncate max-w-[200px]">{event.eventTitle || event.title}</p>
                                                <p className="text-[10px] text-gray-500 font-bold">{event.organizerName || 'New Submission'}</p>
                                            </div>
                                        </div>
                                        <Link to="/admin/events" className="px-3 py-1 bg-black text-white text-[10px] font-black uppercase border-2 border-black hover:bg-yellow-500 hover:text-black transition-colors">
                                            Review
                                        </Link>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="p-4 bg-gray-50 border-t-2 border-black">
                            <Link to="/admin/events" className="text-xs font-black uppercase text-black hover:underline">
                                Full Moderation Panel →
                            </Link>
                        </div>
                    </div>

                    {/* Active Events List */}
                    <div className="bg-white border-4 border-black shadow-[8px_8px_0_gray]">
                        <div className="bg-blue-600 text-white p-4 flex justify-between items-center border-b-4 border-black">
                            <span className="font-black uppercase tracking-wider">Live Platform Content</span>
                            <span className="bg-white text-black px-2 py-0.5 text-xs font-black">{stats.activeEvents}</span>
                        </div>
                        <div className="divide-y-2 divide-gray-200 min-h-[300px]">
                            {loading ? (
                                <div className="p-10 text-center animate-pulse uppercase font-black">Loading live data...</div>
                            ) : activeEventsList.length === 0 ? (
                                <div className="p-10 text-center text-gray-400 uppercase font-black">No active events found</div>
                            ) : (
                                activeEventsList.map((event) => (
                                    <div key={event.id} className="p-4 hover:bg-blue-50 transition-colors flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gray-100 border-2 border-black overflow-hidden flex-shrink-0 text-2xl flex items-center justify-center">
                                                {event.bannerUrl ? <img src={event.bannerUrl} alt="" className="w-full h-full object-cover" /> : '🎫'}
                                            </div>
                                            <div>
                                                <p className="font-black uppercase text-xs truncate max-w-[200px]">{event.eventTitle || event.title}</p>
                                                <p className="text-[10px] text-blue-600 font-bold">{event.startDate || 'Upcoming'}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            {(() => {
                                                const now = new Date();
                                                const endDate = new Date(`${event.registrationEndDate}T${event.registrationEndTime || '23:59'}`);
                                                if (event.registrationEndDate && now > endDate) {
                                                    return <span className="text-[8px] font-black uppercase px-2 py-0.5 border border-black bg-red-100 text-red-800 mb-1">Closed</span>;
                                                }
                                                return <span className="text-[10px] font-black text-green-600 uppercase">Live</span>;
                                            })()}
                                            <span className="text-[10px] text-gray-400">{event.city || 'Tickify'}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="p-4 bg-gray-50 border-t-2 border-black">
                            <Link to="/events" className="text-xs font-black uppercase text-blue-600 hover:underline">
                                View Public Listing →
                            </Link>
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
