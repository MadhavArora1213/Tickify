import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs, doc, getDoc, setDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import { uploadToS3 } from '../../services/s3Service';
import { Map, MapControls, MapMarker, MarkerContent, MarkerPopup, MarkerLabel } from '@/components/ui/map';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const CITY_COORDS = {
    'Mumbai': [72.8777, 19.0760], 'Delhi': [77.1025, 28.7041], 'Bangalore': [77.5946, 12.9716],
    'Hyderabad': [78.4867, 17.3850], 'Ahmedabad': [72.5714, 23.0225], 'Chennai': [80.2707, 13.0827],
    'Kolkata': [88.3639, 22.5726], 'Pune': [73.8567, 18.5204], 'Jaipur': [75.7873, 26.9124],
    'Lucknow': [80.9462, 26.8467], 'Surat': [72.8311, 21.1702], 'Indore': [75.8577, 22.7196],
    'Nagpur': [79.0882, 21.1458], 'Thane': [72.9781, 19.2183], 'Bhopal': [77.4126, 23.2599],
    'Visakhapatnam': [83.2185, 17.6868], 'Patna': [85.1376, 25.5941], 'Vadodara': [73.1812, 22.3072],
    'Ghaziabad': [77.4229, 28.6692], 'Ludhiana': [75.8573, 30.9010], 'Coimbatore': [76.9558, 11.0168],
    'Agra': [78.0081, 27.1767], 'Madurai': [78.1198, 9.9252], 'Nashik': [73.7898, 19.9975],
    'Faridabad': [77.3178, 28.4089], 'Meerut': [77.7064, 28.9845], 'Rajkot': [70.8022, 22.3039],
    'Varanasi': [82.9739, 25.3176], 'Srinagar': [74.7973, 34.0837], 'Aurangabad': [75.3433, 19.8762],
    'Amritsar': [74.8723, 31.6340], 'Allahabad': [81.8463, 25.4358], 'Ranchi': [85.3090, 23.3441],
    'Jabalpur': [79.9339, 23.1667], 'Gwalior': [78.1772, 26.2124], 'Jodhpur': [73.0243, 26.2389],
    'Raipur': [81.6296, 21.2514], 'Dubai': [55.2708, 25.2048], 'Abu Dhabi': [54.3773, 24.4539],
    'Sharjah': [55.4121, 25.3463], 'Hoshiarpur': [75.9115, 31.5262]
};

const OrganizerDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [geocodedCoords, setGeocodedCoords] = useState({});

    const { currentUser } = useAuth();
    const [events, setEvents] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [settingsSaving, setSettingsSaving] = useState(false);
    const [imageUploading, setImageUploading] = useState(false);
    const [settingsSuccess, setSettingsSuccess] = useState(false);
    const [activityPage, setActivityPage] = useState(0);
    const ITEMS_PER_PAGE = 10;

    // --- Dynamic Geocoding Effect (Venue Precision) ---
    useEffect(() => {
        const geocodeLocations = async () => {
            const locationsToGeocode = events.map(e => {
                const fullAddress = [e.venueAddress, e.city, e.state].filter(Boolean).join(', ');
                const fallbackCity = e.city || e.location || 'Mumbai';
                return { id: e.id, address: fullAddress || fallbackCity, city: fallbackCity };
            });

            for (const loc of locationsToGeocode) {
                if (CITY_COORDS[loc.city] || geocodedCoords[loc.address]) continue;

                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(loc.address)}`);
                    const data = await res.json();
                    if (data && data[0]) {
                        setGeocodedCoords(prev => ({ ...prev, [loc.address]: [parseFloat(data[0].lon), parseFloat(data[0].lat)] }));
                    } else if (loc.address !== loc.city) {
                        // Fallback to city only if full address fails
                        const resCity = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(loc.city)}`);
                        const dataCity = await resCity.json();
                        if (dataCity && dataCity[0]) {
                            setGeocodedCoords(prev => ({ ...prev, [loc.city]: [parseFloat(dataCity[0].lon), parseFloat(dataCity[0].lat)] }));
                        }
                    }
                } catch (error) {
                    console.error("Geocoding error:", error);
                }
            }
        };
        if (events.length > 0) geocodeLocations();
    }, [events]);

    // Withdrawal State
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [withdrawLoading, setWithdrawLoading] = useState(false);
    const [withdrawalRequests, setWithdrawalRequests] = useState([]);

    // CSV Export Helper
    const downloadCSV = (data, filename) => {
        if (!data || data.length === 0) {
            alert("No data available to download.");
            return;
        }

        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => {
                const val = (row[header] === null || row[header] === undefined) ? '' : row[header];
                return `"${val.toString().replace(/"/g, '""')}"`;
            }).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Settings Form State
    const [settingsForm, setSettingsForm] = useState({
        organizerName: '',
        organizerType: 'Individual',
        organizationName: '',
        supportEmail: '',
        phone: '',
        website: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        gstNumber: '',
        panNumber: '',
        bankAccountName: '',
        bankAccountNumber: '',
        bankIfsc: '',
        upiId: '',
        bio: '',
        profileImage: '',
        profileImageFile: null // For upload
    });

    // --- Fetch Real Data ---
    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!currentUser) return;
            try {
                setLoading(true);
                // 1. Fetch Organizer's Events
                const eventsRef = collection(db, 'events');
                const q = query(eventsRef, where('organizerId', '==', currentUser.uid));
                const querySnapshot = await getDocs(q);

                const fetchedEvents = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setEvents(fetchedEvents);

                // 2. Fetch Organizer Profile
                const profileRef = doc(db, 'organizers', currentUser.uid);
                const profileSnap = await getDoc(profileRef);

                if (profileSnap.exists()) {
                    const profileData = profileSnap.data();
                    const details = profileData.organizerDetails || {};

                    setSettingsForm(prev => ({
                        ...prev,
                        organizerName: profileData.displayName || profileData.organizerName || '',
                        organizerType: details.organizerType || 'Individual',
                        organizationName: details.organizationName || '',
                        supportEmail: profileData.email || profileData.supportEmail || '',
                        phone: profileData.phoneNumber || profileData.phone || '',
                        website: profileData.website || '',
                        address: profileData.address || '',
                        city: details.city || profileData.city || '',
                        state: details.state || profileData.state || '',
                        pincode: profileData.pincode || '',
                        gstNumber: profileData.gstNumber || '',
                        panNumber: profileData.panNumber || '',
                        bankAccountName: profileData.bankAccountName || '',
                        bankAccountNumber: profileData.bankAccountNumber || '',
                        bankIfsc: profileData.bankIfsc || '',
                        upiId: profileData.upiId || '',
                        bio: profileData.bio || '',
                        profileImage: profileData.profileImage || '',
                    }));
                }

                // 3. Fetch Bookings for all events
                if (fetchedEvents.length > 0) {
                    const eventIds = fetchedEvents.map(e => e.id);
                    // Fetch bookings in chunks of 10 due to Firestore 'in' limit
                    const bookingsRef = collection(db, 'bookings');
                    let allBookings = [];

                    for (let i = 0; i < eventIds.length; i += 10) {
                        const chunk = eventIds.slice(i, i + 10);
                        const bq = query(bookingsRef, where('eventId', 'in', chunk));
                        const bSnapshot = await getDocs(bq);
                        const chunkBookings = bSnapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data()
                        }));
                        allBookings = [...allBookings, ...chunkBookings];
                    }

                    // Sort bookings by date descending
                    allBookings.sort((a, b) => (b.bookingDate?.seconds || 0) - (a.bookingDate?.seconds || 0));
                    setBookings(allBookings);

                    // 4. Fetch Withdrawal Requests
                    const withdrawRef = collection(db, 'withdrawals');
                    const wq = query(withdrawRef, where('organizerId', '==', currentUser.uid));
                    const wSnapshot = await getDocs(wq);
                    setWithdrawalRequests(wSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                }

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [currentUser]);

    // Use real event count, mock others for now until Orders system is live
    // Calculate Dynamic Stats
    const totalSales = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const ticketsSold = bookings.reduce((sum, b) => {
        return sum + (b.items?.reduce((total, item) => total + (item.quantity || 1), 0) || 0);
    }, 0);
    const activeEventsCount = events.filter(e =>
        e.approvalStatus === 'approved' ||
        e.status === 'active' ||
        e.status === 'published'
    ).length;
    const pendingEventsCount = events.filter(e =>
        e.approvalStatus === 'pending' ||
        e.status === 'pending' ||
        e.status === 'pending_approval'
    ).length;

    const stats = [
        {
            label: 'Total Sales',
            value: `₹${totalSales.toLocaleString()}`,
            change: 'Gross Revenue',
            color: 'bg-green-400',
            textColor: 'text-black'
        },
        {
            label: 'Tickets Sold',
            value: ticketsSold.toString(),
            change: `${bookings.length} Bookings`,
            color: 'bg-purple-400',
            textColor: 'text-white'
        },
        {
            label: 'Active Events',
            value: activeEventsCount.toString(),
            change: `${pendingEventsCount} Pending Approval`,
            color: 'bg-yellow-400',
            textColor: 'text-black'
        },
        {
            label: 'Total Events',
            value: events.length.toString(),
            change: 'Created by you',
            color: 'bg-blue-400',
            textColor: 'text-white'
        },
    ];

    // --- Tab Content Renderers ---

    // Generate activities from events
    const generateActivities = () => {
        const activities = [];

        events.forEach(event => {
            // Event Created / Pending
            if (event.approvalStatus === 'pending') {
                activities.push({
                    id: `${event.id}-pending`,
                    type: 'event_pending',
                    icon: '📝',
                    iconBg: 'bg-yellow-400',
                    title: 'Event Submitted for Approval',
                    description: `${event.eventTitle} is pending admin review`,
                    timestamp: event.createdAt?.toDate?.() || new Date(),
                    badge: null,
                });
            }

            // Event Approved
            if (event.approvalStatus === 'approved') {
                activities.push({
                    id: `${event.id}-approved`,
                    type: 'event_approved',
                    icon: '✅',
                    iconBg: 'bg-green-400',
                    title: 'Event Approved!',
                    description: `${event.eventTitle} is now live and accepting bookings`,
                    timestamp: event.updatedAt?.toDate?.() || new Date(),
                    badge: <span className="text-green-500 font-black">LIVE</span>,
                });
            }

            // Event Rejected
            if (event.approvalStatus === 'rejected') {
                activities.push({
                    id: `${event.id}-rejected`,
                    type: 'event_rejected',
                    icon: '❌',
                    iconBg: 'bg-red-400',
                    title: 'Event Rejected',
                    description: `${event.eventTitle} was not approved. Please review and resubmit.`,
                    timestamp: event.updatedAt?.toDate?.() || new Date(),
                    badge: <span className="text-red-500 font-black">ACTION NEEDED</span>,
                });
            }
        });

        // Add Booking Activities
        bookings.forEach(booking => {
            const event = events.find(e => e.id === booking.eventId);
            activities.push({
                id: booking.id,
                type: 'new_booking',
                icon: '🎟️',
                iconBg: 'bg-blue-400',
                title: 'New Booking',
                description: `${booking.userName} bought tickets for ${event?.eventTitle || 'Event'}`,
                timestamp: booking.bookingDate?.toDate?.() || new Date(),
                badge: <span className="text-blue-500 font-black">₹{booking.totalAmount}</span>,
            });
        });

        // Sort by timestamp (newest first)
        activities.sort((a, b) => b.timestamp - a.timestamp);

        return activities;
    };

    const allActivities = generateActivities();
    const totalPages = Math.ceil(allActivities.length / ITEMS_PER_PAGE);
    const recentActivities = allActivities.slice(
        activityPage * ITEMS_PER_PAGE,
        (activityPage + 1) * ITEMS_PER_PAGE
    );

    const formatTimeAgo = (date) => {
        if (!date) return '';
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    const renderOverview = () => (
        <div className="space-y-8 animate-fade-in-up">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className={`p-6 border-4 border-black shadow-[8px_8px_0_black] transition-transform hover:-translate-y-1 ${stat.color} relative overflow-hidden group`}>
                        <h3 className={`text-4xl font-black mb-1 ${stat.textColor}`}>{stat.value}</h3>
                        <p className={`font-black uppercase text-xs ${stat.textColor} opacity-90`}>{stat.label}</p>
                        <div className={`mt-4 pt-2 border-t-2 border-black/10 font-bold text-[10px] uppercase ${stat.textColor} opacity-70`}>
                            {stat.change}
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-[var(--color-bg-surface)] p-6 border-4 border-[var(--color-text-primary)] shadow-[8px_8px_0_var(--color-text-primary)]">
                <h3 className="text-xl font-black uppercase mb-6 text-[var(--color-text-primary)]">Recent Activity</h3>
                <div className="space-y-4">
                    {loading ? (
                        <p className="text-center text-gray-500 py-4">Loading activity...</p>
                    ) : recentActivities.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p className="text-4xl mb-2">📭</p>
                            <p className="font-bold">No recent activity</p>
                            <p className="text-sm">Create your first event to get started!</p>
                        </div>
                    ) : (
                        recentActivities.map(activity => (
                            <div key={activity.id} className="flex justify-between items-center p-3 border-2 border-[var(--color-text-secondary)]/20 hover:bg-[var(--color-bg-secondary)]/30 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 ${activity.iconBg} border-2 border-black rounded-full flex items-center justify-center text-lg`}>
                                        {activity.icon}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-[var(--color-text-primary)]">{activity.title}</p>
                                        <p className="text-xs text-[var(--color-text-secondary)]">{activity.description}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    {activity.badge}
                                    <p className="text-[10px] text-gray-500 mt-1">{formatTimeAgo(activity.timestamp)}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination Controls */}
                {!loading && allActivities.length > ITEMS_PER_PAGE && (
                    <div className="flex justify-between items-center mt-6 pt-4 border-t-2 border-dashed border-[var(--color-text-secondary)]/20">
                        <p className="text-[10px] font-black uppercase text-[var(--color-text-secondary)]">
                            Page {activityPage + 1} of {totalPages} ({allActivities.length} items)
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setActivityPage(prev => Math.max(0, prev - 1))}
                                disabled={activityPage === 0}
                                className={`px-3 py-1 text-xs font-black uppercase border-2 border-black shadow-[2px_2px_0_black] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0_black] transition-all disabled:opacity-50 disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-[2px_2px_0_black]
                                ${activityPage === 0 ? 'bg-gray-200 text-gray-400' : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]'}`}
                            >
                                &larr; Previous
                            </button>
                            <button
                                onClick={() => setActivityPage(prev => Math.min(totalPages - 1, prev + 1))}
                                disabled={activityPage >= totalPages - 1}
                                className={`px-3 py-1 text-xs font-black uppercase border-2 border-black shadow-[2px_2px_0_black] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0_black] transition-all disabled:opacity-50 disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-[2px_2px_0_black]
                                ${activityPage >= totalPages - 1 ? 'bg-gray-200 text-gray-400' : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]'}`}
                            >
                                Next &rarr;
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    const renderEvents = () => (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-black uppercase text-[var(--color-text-primary)]">My Events</h2>
                <Link to="/organizer/events/create" className="neo-btn bg-[var(--color-accent-primary)] text-white px-4 py-2 shadow-[4px_4px_0_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_black] transition-all">Create New +</Link>
            </div>

            {loading ? (
                <p className="font-bold text-center p-8">Loading events...</p>
            ) : events.length === 0 ? (
                <div className="neo-card p-10 text-center bg-gray-100 border-2 border-dashed border-gray-400">
                    <p className="font-black text-xl text-gray-500 mb-4">No events found.</p>
                    <Link to="/organizer/events/create" className="underline font-bold text-blue-600">Create your first event!</Link>
                </div>
            ) : (
                events.map((event) => (
                    <div key={event.id} className="neo-card bg-[var(--color-bg-surface)] p-6 border-4 border-[var(--color-text-primary)] shadow-[6px_6px_0_var(--color-text-primary)] flex flex-col md:flex-row gap-6 relative">
                        <div className="w-full md:w-48 h-32 bg-gray-300 border-2 border-black relative overflow-hidden group">
                            <img
                                src={event.bannerUrl || `https://picsum.photos/seed/${event.id}/300/200`}
                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                                alt={event.eventTitle}
                                onError={(e) => {
                                    console.error(`Failed to load image for event ${event.id}:`, e.target.src);
                                    e.target.src = 'https://via.placeholder.com/300x200?text=Image+Load+Error';
                                }}
                            />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h3 className="text-2xl font-black uppercase text-[var(--color-text-primary)]">{event.eventTitle}</h3>
                                <div className="flex flex-col items-end gap-1">
                                    <span className={`text-xs font-black uppercase px-2 py-1 border border-black ${event.approvalStatus === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {event.approvalStatus || 'Pending'}
                                    </span>
                                    {(() => {
                                        const now = new Date();
                                        const endDate = new Date(`${event.registrationEndDate}T${event.registrationEndTime || '23:59'}`);
                                        if (event.registrationEndDate && now > endDate) {
                                            return (
                                                <span className="text-[10px] font-black uppercase px-2 py-0.5 border border-black bg-red-100 text-red-800 mt-1 animate-pulse">
                                                    REGISTRATION CLOSED
                                                </span>
                                            );
                                        }
                                        return null;
                                    })()}
                                    <span className="text-[10px] font-bold text-gray-500">{event.id}</span>
                                </div>
                            </div>
                            <p className="text-sm font-bold text-[var(--color-text-secondary)] mt-1">
                                {event.startDate} • {event.venueName || 'Online'}, {event.city}
                            </p>

                            {/* Real Sales Progress */}
                            {(() => {
                                const eventBookings = bookings.filter(b => b.eventId === event.id);
                                const sold = eventBookings.reduce((sum, b) => {
                                    return sum + (b.items?.reduce((total, item) => total + (item.quantity || 1), 0) || 0);
                                }, 0);
                                const total = event.totalCapacity || 100;
                                const percent = Math.min(Math.round((sold / total) * 100), 100);

                                return (
                                    <div className="mt-4">
                                        <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                                            <span>{sold} / {total} Sold</span>
                                            <span>{percent}%</span>
                                        </div>
                                        <div className="w-full bg-[var(--color-bg-secondary)] h-4 border-2 border-black rounded-full overflow-hidden relative">
                                            <div
                                                className="bg-[var(--color-accent-primary)] h-full transition-all duration-1000"
                                                style={{ width: `${percent}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })()}

                            <div className="flex gap-2 mt-4">
                                <Link to={`/organizer/events/${event.id}/edit`} className="text-xs font-black uppercase bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] border-2 border-[var(--color-text-primary)] px-3 py-1 hover:bg-[var(--color-text-primary)] hover:text-[var(--color-bg-primary)] transition-colors">Edit</Link>
                                <Link to={`/organizer/events/${event.id}/analytics`} className="text-xs font-black uppercase bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] border-2 border-[var(--color-text-primary)] px-3 py-1 hover:bg-[var(--color-text-primary)] hover:text-[var(--color-bg-primary)] transition-colors">Analytics</Link>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );

    const renderAttendees = () => (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-black uppercase text-[var(--color-text-primary)]">Attendees</h2>
                <button
                    onClick={() => {
                        const csvData = bookings.map(b => ({
                            Attendee: b.userName,
                            Email: b.userEmail,
                            Event: events.find(e => e.id === b.eventId)?.eventTitle || 'Unknown',
                            TicketType: b.items?.[0]?.name || 'General',
                            Quantity: b.items?.reduce((sum, i) => sum + (i.quantity || 1), 0) || 1,
                            Amount: b.totalAmount,
                            Status: b.status || 'PAID',
                            Date: b.bookingDate?.toDate?.()?.toLocaleString() || 'N/A'
                        }));
                        downloadCSV(csvData, 'tickify_attendees');
                    }}
                    className="text-xs font-black uppercase bg-black text-white px-4 py-2 shadow-[4px_4px_0_var(--color-accent-primary)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_var(--color-accent-primary)] transition-all"
                >
                    💾 Download CSV
                </button>
            </div>
            <div className="flex gap-4 mb-6">
                <input type="text" placeholder="Search by name or ticket ID..." className="flex-1 neo-input bg-[var(--color-bg-surface)] border-2 border-[var(--color-text-primary)] px-4 py-2 font-bold" />
                <button className="neo-btn bg-[var(--color-bg-surface)] border-2 border-[var(--color-text-primary)] px-6 font-black uppercase">Filter</button>
            </div>

            <div className="neo-card bg-[var(--color-bg-surface)] border-4 border-[var(--color-text-primary)] overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-[var(--color-bg-secondary)] border-b-4 border-[var(--color-text-primary)]">
                        <tr>
                            <th className="p-4 font-black uppercase">Name</th>
                            <th className="p-4 font-black uppercase">Ticket Type</th>
                            <th className="p-4 font-black uppercase">Status</th>
                            <th className="p-4 font-black uppercase text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-[var(--color-text-secondary)]/20">
                        {loading ? (
                            <tr><td colSpan="4" className="p-8 text-center font-bold">Loading attendees...</td></tr>
                        ) : bookings.length === 0 ? (
                            <tr><td colSpan="4" className="p-8 text-center font-bold text-gray-500">No attendees found yet.</td></tr>
                        ) : (
                            bookings.map(booking => {
                                const event = events.find(e => e.id === booking.eventId);
                                const ticketType = booking.items?.[0]?.name || booking.items?.[0]?.ticketName || 'General';
                                const qty = booking.items?.reduce((sum, i) => sum + (i.quantity || 1), 0) || 1;

                                return (
                                    <tr key={booking.id} className="hover:bg-[var(--color-bg-secondary)]/50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-bold text-[var(--color-text-primary)]">{booking.userName}</div>
                                            <div className="text-[10px] text-gray-400">{booking.userEmail}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium text-[var(--color-text-primary)]">{ticketType}</div>
                                            <div className="text-[10px] text-gray-400">{event?.eventTitle} ({qty} tickets)</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`text-xs font-black border px-2 py-1 ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800 border-green-800' : 'bg-gray-100 text-gray-800 border-gray-800'}`}>
                                                {booking.status?.toUpperCase() || 'PAID'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className="text-xs font-black text-gray-500">{booking.id.slice(0, 8)}...</span>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderAnalytics = () => {
        // Logic for Ticket Type Breakdown
        const ticketDistribution = {};
        bookings.forEach(b => {
            b.items?.forEach(item => {
                const name = item.name || item.ticketName || 'General';
                ticketDistribution[name] = (ticketDistribution[name] || 0) + (item.quantity || 1);
            });
        });

        const ticketLabels = Object.keys(ticketDistribution);

        // Logic for Booking Volume Timeline (Last 7 days)
        const ticketsByDate = {};
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        last7Days.forEach(date => ticketsByDate[date] = 0);
        bookings.forEach(b => {
            const date = b.bookingDate?.toDate?.()?.toISOString().split('T')[0];
            if (ticketsByDate[date] !== undefined) {
                const dayTickets = b.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 1;
                ticketsByDate[date] += dayTickets;
            }
        });

        const maxTicketVol = Math.max(...Object.values(ticketsByDate), 1);

        // Refined coordinate system: 
        // SVG ViewBox will be 0 0 100 100
        // Data area: X from 10 to 90, Y from 10 to 80
        const getX = (i) => 10 + (i / 6) * 80;
        const getY = (count) => 80 - (count / maxTicketVol * 70);

        const timelinePoints = last7Days.map((date, i) => `${getX(i)},${getY(ticketsByDate[date])}`).join(' ');
        const areaPoints = `10,80 ${timelinePoints} 90,80`;

        return (
            <div className="space-y-8 animate-fade-in-up">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-black uppercase text-[var(--color-text-primary)]">Analytics & Reports</h2>
                    <button
                        onClick={() => {
                            const csvData = last7Days.map(date => ({
                                Date: date,
                                TicketsSold: ticketsByDate[date],
                                Bookings: bookings.filter(b => b.bookingDate?.toDate?.()?.toISOString().split('T')[0] === date).length,
                                Revenue: bookings.filter(b => b.bookingDate?.toDate?.()?.toISOString().split('T')[0] === date).reduce((s, b) => s + (b.totalAmount || 0), 0)
                            }));
                            downloadCSV(csvData, 'tickify_ticket_sales_report');
                        }}
                        className="text-xs font-black uppercase bg-white text-black border-2 border-black px-4 py-2 shadow-[4px_4px_0_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_black] transition-all"
                    >
                        📊 Export Sales CSV
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Ticket Distribution Chart */}
                    <div className="neo-card bg-[var(--color-bg-surface)] border-4 border-[var(--color-text-primary)] p-6 shadow-[8px_8px_0_var(--color-text-primary)]">
                        <h3 className="uppercase font-black text-[var(--color-text-secondary)] mb-6 border-b-2 border-black pb-2">Ticket Sales by Type</h3>
                        {ticketLabels.length === 0 ? (
                            <div className="h-48 flex items-center justify-center text-gray-400 font-bold italic">No sales data yet</div>
                        ) : (
                            <div className="space-y-4">
                                {ticketLabels.map((label, i) => {
                                    const count = ticketDistribution[label];
                                    const percentage = (count / (ticketsSold || 1) * 100).toFixed(0);
                                    const colors = ['bg-green-400', 'bg-blue-400', 'bg-purple-400', 'bg-yellow-400', 'bg-red-400'];
                                    return (
                                        <div key={label}>
                                            <div className="flex justify-between text-xs font-black uppercase mb-1">
                                                <span>{label}</span>
                                                <span>{count} ({percentage}%)</span>
                                            </div>
                                            <div className="w-full h-6 bg-gray-100 border-2 border-black overflow-hidden relative">
                                                <div
                                                    className={`h-full ${colors[i % colors.length]} border-r-2 border-black transition-all duration-1000`}
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Booking Volume Chart */}
                    <div className="neo-card bg-[var(--color-bg-surface)] border-4 border-[var(--color-text-primary)] p-6 shadow-[8px_8px_0_var(--color-text-primary)] flex flex-col">
                        <h3 className="uppercase font-black text-[var(--color-text-secondary)] mb-6 border-b-2 border-black pb-2">Daily Ticket Sales Volume</h3>

                        <div className="relative flex-1 min-h-[250px] mt-2 flex">
                            {/* Y-Axis Labels - Perfectly aligned to current data area */}
                            <div className="flex flex-col justify-between text-[10px] font-black text-gray-400 w-10 text-right pr-2 pt-[10%] pb-[20%] h-full">
                                <span>{maxTicketVol}</span>
                                <span>{Math.round(maxTicketVol / 2)}</span>
                                <span>0</span>
                            </div>

                            <div className="flex-1 relative flex flex-col">
                                <div className="flex-1 relative overflow-visible">
                                    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                                        <defs>
                                            <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#2563eb" stopOpacity="0.2" />
                                                <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                                            </linearGradient>
                                        </defs>

                                        {/* Grid Lines */}
                                        <line x1="10" y1="10" x2="90" y2="10" stroke="rgba(0,0,0,0.05)" strokeWidth="0.5" />
                                        <line x1="10" y1="45" x2="90" y2="45" stroke="rgba(0,0,0,0.05)" strokeWidth="0.5" strokeDasharray="2,2" />
                                        <line x1="10" y1="80" x2="90" y2="80" stroke="black" strokeWidth="1.5" />
                                        <line x1="10" y1="10" x2="10" y2="80" stroke="black" strokeWidth="1.5" />

                                        {/* Area Fill */}
                                        <polygon points={areaPoints} fill="url(#lineGradient)" />

                                        {/* Main Line */}
                                        <polyline
                                            points={timelinePoints}
                                            fill="none"
                                            stroke="#2563eb"
                                            strokeWidth="3"
                                            strokeLinejoin="round"
                                            strokeLinecap="round"
                                        />

                                        {/* Dots */}
                                        {last7Days.map((date, i) => {
                                            const cx = getX(i);
                                            const cy = getY(ticketsByDate[date]);
                                            const count = ticketsByDate[date];
                                            return (
                                                <g key={i} className="group/dot">
                                                    <circle
                                                        cx={cx} cy={cy} r="3.5"
                                                        fill="white" stroke="black" strokeWidth="2"
                                                        className="hover:r-5 transition-all cursor-pointer"
                                                    />
                                                    <g className="opacity-0 group-hover/dot:opacity-100 transition-opacity pointer-events-none">
                                                        <rect x={cx - 15} y={cy - 22} width="30" height="15" fill="black" rx="2" />
                                                        <text x={cx} y={cy - 12} fontSize="8" fill="white" fontWeight="900" textAnchor="middle">{count}</text>
                                                    </g>
                                                </g>
                                            )
                                        })}
                                    </svg>
                                </div>

                                {/* X-Axis Labels - Absolute aligned to data points */}
                                <div className="h-6 mt-1 relative w-full">
                                    {last7Days.map((d, i) => {
                                        const dateLabel = d.split('-')[2] + '/' + d.split('-')[1];
                                        return (
                                            <span
                                                key={d}
                                                className="absolute text-[9px] font-black text-gray-500 -translate-x-1/2"
                                                style={{ left: `${getX(i)}%` }}
                                            >
                                                {dateLabel}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Summary Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 border-2 border-black bg-white">
                        <span className="text-[10px] font-black text-gray-400 uppercase">Avg. Tickets Per Order</span>
                        <p className="text-2xl font-black">{(ticketsSold / Math.max(bookings.length, 1)).toFixed(1)}</p>
                    </div>
                    <div className="p-4 border-2 border-black bg-white">
                        <span className="text-[10px] font-black text-gray-400 uppercase">Avg. Order Value</span>
                        <p className="text-2xl font-black">₹{(totalSales / Math.max(bookings.length, 1)).toFixed(0)}</p>
                    </div>
                    <div className="p-4 border-2 border-black bg-white">
                        <span className="text-[10px] font-black text-gray-400 uppercase">Top Performing Event</span>
                        <p className="text-sm font-black truncate">{events.length > 0 ? events[0].eventTitle : 'N/A'}</p>
                    </div>
                </div>
            </div>
        );
    };

    const renderGeography = () => {
        // Prepare map data
        const eventMarkers = events.map(event => {
            const fullAddress = [event.venueAddress, event.city, event.state].filter(Boolean).join(', ');
            const cityName = event.city || event.location || 'Mumbai';
            const baseCoords = geocodedCoords[fullAddress] || geocodedCoords[cityName] || CITY_COORDS[cityName] || [78.9629, 20.5937];

            // Add jitter to avoid perfect overlap
            const jitterX = (Math.random() - 0.5) * 0.08;
            const jitterY = (Math.random() - 0.5) * 0.08;

            return {
                id: event.id,
                title: event.eventTitle,
                city: cityName,
                address: fullAddress,
                longitude: baseCoords[0] + jitterX,
                latitude: baseCoords[1] + jitterY,
                venue: event.venueName || 'Main Arena',
                date: event.startDate || 'Upcoming',
                category: event.category || 'Event',
                status: event.status || 'pending'
            };
        });

        const mapStyles = {
            light: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
            dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        };

        return (
            <div className="space-y-8 animate-fade-in-up">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h2 className="text-3xl font-black uppercase text-[var(--color-text-primary)] tracking-tighter">Event Footprint</h2>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="flex h-2.5 w-2.5 rounded-full bg-[var(--color-accent-primary)] animate-[pulse_1.5s_infinite] shadow-[0_0_8px_var(--color-accent-primary)]"></span>
                            <p className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest">Global Live Distribution</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-[var(--color-bg-surface)] border-4 border-black px-4 py-2 text-xs font-black uppercase shadow-[4px_4px_0_black]">
                            Cities: {new Set(eventMarkers.map(m => m.city)).size}
                        </div>
                        <div className="bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] border-4 border-black px-4 py-2 text-xs font-black uppercase shadow-[4px_4px_0_gray]">
                            Total Events: {eventMarkers.length}
                        </div>
                    </div>
                </div>

                <div className="neo-card bg-[var(--color-bg-secondary)] border-4 border-black shadow-[15px_15px_0_black] p-1 overflow-hidden relative min-h-[550px] h-[700px] group transition-all hover:shadow-[20px_20px_0_black]">
                    <Map
                        styles={mapStyles}
                        initialViewState={{
                            longitude: 78.9629,
                            latitude: 22.5937,
                            zoom: 4.8,
                            pitch: 45
                        }}
                    >
                        <MapControls showLocate showFullscreen showZoom position="bottom-right" />

                        {eventMarkers.map((marker) => (
                            <MapMarker
                                key={marker.id}
                                longitude={marker.longitude}
                                latitude={marker.latitude}
                            >
                                <MarkerContent>
                                    <div className="relative group/marker">
                                        {/* Premium Glowing Pulse */}
                                        <div className="absolute -inset-6 bg-[var(--color-accent-primary)]/20 rounded-full animate-[ping_2s_infinite] pointer-events-none origin-center" />
                                        <div className="absolute -inset-3 bg-[var(--color-accent-secondary)]/10 rounded-full animate-[pulse_1.5s_infinite] pointer-events-none origin-center" />

                                        <div className="size-14 bg-white border-[4px] border-black rounded-full flex items-center justify-center shadow-[8px_8px_0_black] group-hover/marker:scale-125 group-hover/marker:bg-black group-hover/marker:border-white group-hover/marker:shadow-none transition-all duration-500 cursor-pointer overflow-hidden z-10">
                                            <span className="text-3xl filter group-hover:invert transition-all">🎯</span>
                                        </div>
                                    </div>
                                </MarkerContent>
                                <MarkerPopup closeButton>
                                    <div className="w-72 bg-white rounded-none border-[6px] border-black shadow-[10px_10px_0_black] overflow-hidden">
                                        <div className="bg-black p-4 border-b-2 border-black">
                                            <div className="flex justify-between items-start">
                                                <p className="font-black text-white text-base uppercase leading-none pr-4">{marker.title}</p>
                                                <span className="bg-yellow-400 text-black border-2 border-white px-2 py-0.5 text-[8px] font-black uppercase">LIVE</span>
                                            </div>
                                        </div>
                                        <div className="p-4 space-y-3">
                                            <div className="flex items-start gap-3">
                                                <span className="mt-1 text-xl">🏠</span>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase text-gray-400">Venue</p>
                                                    <p className="text-xs font-black uppercase tracking-tight">{marker.venue}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-4">
                                                <div className="flex flex-col">
                                                    <p className="text-[10px] font-black uppercase text-gray-400">City</p>
                                                    <p className="text-xs font-black uppercase tracking-tight">{marker.city}</p>
                                                </div>
                                                <div className="flex flex-col border-l-2 border-dashed border-gray-200 pl-4">
                                                    <p className="text-[10px] font-black uppercase text-gray-400">Category</p>
                                                    <p className="text-xs font-black uppercase tracking-tight text-[var(--color-accent-primary)]">{marker.category}</p>
                                                </div>
                                            </div>
                                            <div className="mt-4 pt-4 border-t-2 border-black flex justify-between items-center bg-gray-50 -mx-4 -mb-4 px-4 py-3">
                                                <div className="flex flex-col">
                                                    <p className="text-[8px] font-black uppercase text-gray-500">Scheduled For</p>
                                                    <p className="text-[11px] font-black uppercase">{marker.date}</p>
                                                </div>
                                                <button className="bg-black text-white text-[9px] font-black uppercase px-3 py-1.5 hover:bg-red-500 transition-colors">
                                                    DETAILS →
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </MarkerPopup>
                                <MarkerLabel className="bg-black text-white px-4 py-2 border-2 border-white shadow-[6px_6px_0_black] text-[11px] font-black uppercase tracking-widest -translate-y-4 pointer-events-none group-hover/marker:opacity-0 transition-opacity">
                                    {marker.city}
                                </MarkerLabel>
                            </MapMarker>
                        ))}
                    </Map>

                    {/* Dashboard Sidebar on Map */}
                    <div className="absolute top-4 left-4 z-10 w-48 hidden lg:block">
                        <div className="bg-white/80 backdrop-blur-md border-4 border-black p-4 shadow-[6px_6px_0_black] space-y-4">
                            <h4 className="text-xs font-black uppercase border-b-2 border-black pb-1">Quick Insights</h4>
                            <div className="space-y-3 font-black uppercase text-[9px]">
                                <div className="flex justify-between">
                                    <span>Live Regions</span>
                                    <span className="text-blue-600">{new Set(eventMarkers.map(m => m.city)).size}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Active Markers</span>
                                    <span className="text-green-600">{eventMarkers.length}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {eventMarkers.length > 0 ? (
                        eventMarkers.slice(0, 8).map(marker => (
                            <div key={marker.id} className="neo-card bg-[var(--color-bg-surface)] p-5 border-4 border-black hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[12px_12px_0_var(--color-accent-primary)] transition-all cursor-pointer group flex flex-col justify-between h-40">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="font-black text-xs uppercase group-hover:text-[var(--color-accent-primary)] transition-colors line-clamp-2">{marker.title}</p>
                                        <span className="text-2xl filter group-hover:drop-shadow-[0_0_8px_rgba(37,99,235,0.5)]">📍</span>
                                    </div>
                                    <p className="text-[10px] text-[var(--color-text-secondary)] font-black mt-1 uppercase tracking-tight flex items-center gap-1">
                                        {marker.city} <span className="text-gray-300">•</span> {marker.venue}
                                    </p>
                                </div>
                                <div className="mt-4 flex justify-between items-center">
                                    <span className="text-[9px] font-black text-[var(--color-accent-secondary)] uppercase bg-gray-100 px-2 py-1 border border-black">{marker.date}</span>
                                    <span className="text-[8px] font-black uppercase text-gray-400">View Map &rarr;</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-4 p-12 text-center bg-gray-50 border-4 border-dashed border-black rounded-xl">
                            <p className="font-black text-gray-400 uppercase tracking-widest text-lg">No active event geography found</p>
                            <p className="text-sm font-bold text-gray-400 mt-2">Publish an event to see it on the map</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const handleWithdraw = async (amount) => {
        if (!settingsForm.bankAccountNumber || !settingsForm.bankIfsc) {
            alert("Please complete your bank details in 'Settings' first!");
            setActiveTab('settings');
            return;
        }

        if (amount <= 0) {
            alert("Invalid withdrawal amount.");
            return;
        }

        setWithdrawLoading(true);
        try {
            const withdrawRef = collection(db, 'withdrawals');
            await addDoc(withdrawRef, {
                organizerId: currentUser.uid,
                organizerName: settingsForm.organizerName || currentUser.displayName,
                amount: amount,
                bankDetails: {
                    accountName: settingsForm.bankAccountName,
                    accountNumber: settingsForm.bankAccountNumber,
                    ifsc: settingsForm.bankIfsc,
                    upiId: settingsForm.upiId || ''
                },
                status: 'pending',
                requestedAt: serverTimestamp(),
            });

            alert("Withdrawal request submitted! Admin will process it within 2-3 business days.");
            setIsWithdrawModalOpen(false);

            // Refresh requests
            const wSnapshot = await getDocs(query(collection(db, 'withdrawals'), where('organizerId', '==', currentUser.uid)));
            setWithdrawalRequests(wSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        } catch (error) {
            console.error("Withdrawal error:", error);
            alert("Failed to submit request.");
        } finally {
            setWithdrawLoading(false);
        }
    };

    const renderFinances = () => {
        const pendingWithdrawalAmount = withdrawalRequests
            .filter(r => r.status === 'pending')
            .reduce((sum, r) => sum + r.amount, 0);

        const processedWithdrawalAmount = withdrawalRequests
            .filter(r => r.status === 'completed')
            .reduce((sum, r) => sum + r.amount, 0);

        const availableToWithdraw = totalSales - pendingWithdrawalAmount - processedWithdrawalAmount;

        return (
            <div className="space-y-6 animate-fade-in-up">
                <h2 className="text-3xl font-black uppercase text-[var(--color-text-primary)] mb-6">Finances</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="p-6 bg-white border-4 border-black shadow-[6px_6px_0_black]">
                        <p className="text-sm font-black uppercase text-gray-500">Total Revenue</p>
                        <h3 className="text-4xl font-black text-black">₹{totalSales.toLocaleString()}</h3>
                        <p className="text-[10px] font-bold text-gray-400 mt-2">* Gross earnings from all events</p>
                    </div>
                    <div className="p-6 bg-yellow-400 border-4 border-black shadow-[6px_6px_0_black]">
                        <p className="text-sm font-black uppercase text-black">Available to Withdraw</p>
                        <h3 className="text-4xl font-black text-black">₹{availableToWithdraw.toLocaleString()}</h3>
                        <button
                            onClick={() => setIsWithdrawModalOpen(true)}
                            disabled={availableToWithdraw <= 0}
                            className={`mt-4 text-xs font-black uppercase bg-black text-white px-4 py-2 shadow-[3px_3px_0_white] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0_white] transition-all disabled:opacity-50 disabled:translate-x-0 disabled:translate-y-0`}
                        >
                            Request Payout
                        </button>
                    </div>
                    <div className="p-6 bg-blue-500 border-4 border-black shadow-[6px_6px_0_black] text-white">
                        <p className="text-sm font-black uppercase opacity-80">Pending Payouts</p>
                        <h3 className="text-4xl font-black">₹{pendingWithdrawalAmount.toLocaleString()}</h3>
                        <p className="text-[10px] font-bold mt-2">Currently being processed by admin</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Payouts */}
                    <div className="neo-card p-6 bg-[var(--color-bg-surface)] border-4 border-[var(--color-text-primary)] shadow-[8px_8px_0_var(--color-text-primary)]">
                        <h3 className="text-xl font-black uppercase mb-6 border-b-2 border-black pb-2">Payout History</h3>
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                            {withdrawalRequests.length === 0 ? (
                                <p className="text-center font-bold text-gray-500 py-8 italic">No payouts requested yet.</p>
                            ) : (
                                withdrawalRequests.sort((a, b) => (b.requestedAt?.seconds || 0) - (a.requestedAt?.seconds || 0)).map((w) => (
                                    <div key={w.id} className="flex justify-between items-center p-4 border-2 border-black hover:bg-[var(--color-bg-secondary)] transition-colors">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-black text-lg">₹{w.amount.toLocaleString()}</span>
                                                <span className={`px-2 py-0.5 text-[8px] font-black uppercase border-2 ${w.status === 'completed' ? 'bg-green-400 border-black' :
                                                    w.status === 'rejected' ? 'bg-red-400 border-black' :
                                                        'bg-yellow-300 border-black'
                                                    }`}>
                                                    {w.status}
                                                </span>
                                            </div>
                                            <p className="text-[10px] font-bold text-gray-500">
                                                {w.requestedAt?.toDate?.()?.toLocaleDateString() || 'Recently'} • {w.bankDetails?.accountNumber?.slice(-4)}
                                            </p>
                                        </div>
                                        {w.status === 'pending' && <div className="text-[10px] font-black animate-pulse text-yellow-600">IN REVIEW</div>}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Bank Summary */}
                    <div className="space-y-6">
                        <div className="neo-card p-6 bg-white border-4 border-black shadow-[8px_8px_0_black]">
                            <h3 className="text-lg font-black uppercase mb-4">Linked Bank Account</h3>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-gray-100 border-2 border-black flex items-center justify-center text-2xl">🏦</div>
                                <div>
                                    <p className="font-black uppercase">{settingsForm.bankAccountName || 'No Name'}</p>
                                    <p className="text-xs font-bold text-gray-500">{settingsForm.bankAccountNumber ? `•••• •••• ${settingsForm.bankAccountNumber.slice(-4)}` : 'Bank not linked'}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-xs">
                                <div className="bg-gray-50 p-2 border border-black">
                                    <span className="block text-gray-400 uppercase font-black">IFSC</span>
                                    <span className="font-bold">{settingsForm.bankIfsc || 'N/A'}</span>
                                </div>
                                <div className="bg-gray-50 p-2 border border-black">
                                    <span className="block text-gray-400 uppercase font-black">UPI ID</span>
                                    <span className="font-bold truncate">{settingsForm.upiId || 'N/A'}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setActiveTab('settings')}
                                className="w-full mt-6 py-2 border-2 border-dashed border-black font-black uppercase text-xs hover:bg-black hover:text-white transition-colors"
                            >
                                Edit Details in Settings
                            </button>
                        </div>
                    </div>
                </div>

                {/* Withdrawal Modal */}
                {isWithdrawModalOpen && (
                    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                        <div className="neo-card bg-white border-4 border-black shadow-[12px_12px_0_black] w-full max-w-md p-8 animate-fade-in-up">
                            <h3 className="text-2xl font-black uppercase mb-2">Request Payout</h3>
                            <p className="text-xs font-bold text-gray-500 mb-6">Funds will be sent to your linked bank account.</p>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Account Holder</label>
                                    <p className="font-bold border-b-2 border-black pb-2">{settingsForm.bankAccountName}</p>
                                </div>

                                <div className="bg-[var(--color-bg-secondary)] p-4 border-2 border-black">
                                    <label className="block text-[10px] font-black uppercase text-gray-500 mb-2">Withdraw Amount</label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-3xl font-black">₹</span>
                                        <input
                                            type="number"
                                            defaultValue={availableToWithdraw}
                                            max={availableToWithdraw}
                                            id="withdrawInput"
                                            className="bg-transparent text-3xl font-black w-full focus:outline-none"
                                        />
                                    </div>
                                    <p className="text-[10px] font-bold text-gray-400 mt-2">Max available: ₹{availableToWithdraw.toLocaleString()}</p>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setIsWithdrawModalOpen(false)}
                                        className="flex-1 py-3 border-2 border-black font-black uppercase hover:bg-gray-100 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => {
                                            const amt = parseFloat(document.getElementById('withdrawInput').value);
                                            handleWithdraw(amt);
                                        }}
                                        disabled={withdrawLoading}
                                        className="flex-1 py-3 bg-[var(--color-accent-primary)] text-white border-2 border-black font-black uppercase shadow-[4px_4px_0_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_black] disabled:opacity-50"
                                    >
                                        {withdrawLoading ? 'Wait...' : 'Confirm'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const handleSettingsChange = (e) => {
        const { name, value } = e.target;
        setSettingsForm(prev => ({ ...prev, [name]: value }));
        setSettingsSuccess(false);
    };

    const handleSaveSettings = async () => {
        if (!currentUser) return;
        setSettingsSaving(true);
        setSettingsSuccess(false);

        try {
            let profileImageUrl = settingsForm.profileImage;

            // Upload new image if selected
            if (settingsForm.profileImageFile) {
                setImageUploading(true);
                try {
                    profileImageUrl = await uploadToS3(settingsForm.profileImageFile, 'organizers/profiles');
                } finally {
                    setImageUploading(false);
                }
            }

            // Create a clean data object for Firestore (no File objects)
            const { profileImageFile, ...savableData } = settingsForm;

            const profileRef = doc(db, 'organizers', currentUser.uid);
            await setDoc(profileRef, {
                ...savableData,
                profileImage: profileImageUrl,
                uid: currentUser.uid,
                email: currentUser.email,
                updatedAt: serverTimestamp(),
            }, { merge: true });

            setSettingsForm(prev => ({
                ...prev,
                profileImage: profileImageUrl,
                profileImageFile: null
            }));
            setSettingsSuccess(true);
            setTimeout(() => setSettingsSuccess(false), 3000);
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Failed to save settings: ' + error.message);
        } finally {
            setSettingsSaving(false);
        }
    };

    const renderSettings = () => (
        <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-3xl font-black uppercase text-[var(--color-text-primary)] mb-6">Organizer Settings</h2>

            {settingsSuccess && (
                <div className="p-4 bg-green-100 border-2 border-green-500 text-green-700 font-bold mb-4">
                    ✅ Settings saved successfully!
                </div>
            )}

            {/* Profile Info */}
            <div className="neo-card bg-[var(--color-bg-surface)] p-6 border-4 border-[var(--color-text-primary)] shadow-[6px_6px_0_var(--color-text-primary)]">
                <h3 className="text-lg font-black uppercase mb-4 border-b-2 border-dashed pb-2">Profile Information</h3>

                <div className="mb-10 flex flex-col md:flex-row items-center gap-8 bg-[var(--color-bg-secondary)] p-6 border-4 border-black shadow-[8px_8px_0_black]">
                    <div className="relative group flex-shrink-0">
                        <div className="absolute -inset-2 bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] rounded-full blur opacity-40 group-hover:opacity-100 transition duration-700"></div>
                        <div className="relative w-36 h-36 bg-white rounded-full border-[6px] border-black overflow-hidden shadow-[12px_12px_0_black] transition-all duration-500">
                            {imageUploading && (
                                <div className="absolute inset-0 bg-black/40 z-20 flex items-center justify-center">
                                    <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                            <img
                                src={settingsForm.profileImageFile ? URL.createObjectURL(settingsForm.profileImageFile) : (settingsForm.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=Organizer`)}
                                alt="Profile"
                                className={`w-full h-full object-cover scale-110 ${imageUploading ? 'blur-sm' : ''}`}
                            />
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-black text-white p-2 rounded-full border-4 border-white shadow-[4px_4px_0_black]">
                            <span className="text-sm">🔒</span>
                        </div>
                    </div>

                    <div className="flex-1 space-y-4 text-center md:text-left">
                        <div>
                            <h4 className="text-xl font-black uppercase text-black tracking-tight">Verified Organizer Identity</h4>
                            <p className="text-[10px] font-black uppercase text-gray-500 mt-1">This avatar represents your public brand across the Tickify network.</p>
                        </div>
                        <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                            <label className="neo-btn bg-black text-white px-6 py-2.5 text-[10px] font-black uppercase cursor-pointer hover:bg-[var(--color-accent-primary)] hover:shadow-[4px_4px_0_black] transition-all flex items-center gap-2 border-2 border-black">
                                <span>⬆️ Upload New Photo</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        if (e.target.files[0]) {
                                            setSettingsForm({ ...settingsForm, profileImageFile: e.target.files[0] });
                                        }
                                    }}
                                />
                            </label>
                            <button
                                onClick={() => setSettingsForm({ ...settingsForm, profileImageFile: null, profileImage: '' })}
                                className="neo-btn bg-white text-black px-6 py-2.5 text-[10px] font-black uppercase border-2 border-black hover:bg-red-50 transition-all"
                            >
                                Reset to Default
                            </button>
                        </div>
                        <p className="text-[9px] font-bold text-gray-400 italic">Recommended: Square JPG or PNG, max 2MB</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">Contact Person Name *</label>
                        <input
                            type="text"
                            name="organizerName"
                            value={settingsForm.organizerName}
                            onChange={handleSettingsChange}
                            className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] px-4 py-2 font-bold"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">Organizer Type</label>
                        <select
                            name="organizerType"
                            value={settingsForm.organizerType}
                            onChange={handleSettingsChange}
                            className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] px-4 py-2 font-bold"
                        >
                            <option value="Individual">Individual</option>
                            <option value="Company">Company</option>
                            <option value="Organization">Organization</option>
                        </select>
                    </div>
                    {settingsForm.organizerType !== 'Individual' && (
                        <div className="md:col-span-2">
                            <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">Organization / Brand Name</label>
                            <input
                                type="text"
                                name="organizationName"
                                value={settingsForm.organizationName}
                                onChange={handleSettingsChange}
                                placeholder="Your Company or Brand Name"
                                className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] px-4 py-2 font-bold"
                            />
                        </div>
                    )}
                    <div>
                        <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">Support Email *</label>
                        <input
                            type="email"
                            name="supportEmail"
                            value={settingsForm.supportEmail}
                            onChange={handleSettingsChange}
                            className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] px-4 py-2 font-bold"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">Phone Number</label>
                        <input
                            type="tel"
                            name="phone"
                            value={settingsForm.phone}
                            onChange={handleSettingsChange}
                            placeholder="+91 9876543210"
                            className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] px-4 py-2 font-bold"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">Website</label>
                        <input
                            type="url"
                            name="website"
                            value={settingsForm.website}
                            onChange={handleSettingsChange}
                            placeholder="https://yourwebsite.com"
                            className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] px-4 py-2 font-bold"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">Bio / About Description</label>
                        <textarea
                            name="bio"
                            value={settingsForm.bio}
                            onChange={handleSettingsChange}
                            placeholder="Tell us about yourself or your organization..."
                            rows="4"
                            className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] px-4 py-2 font-bold"
                        />
                    </div>
                </div>
            </div>

            {/* Address */}
            <div className="neo-card bg-[var(--color-bg-surface)] p-6 border-4 border-[var(--color-text-primary)] shadow-[6px_6px_0_var(--color-text-primary)]">
                <h3 className="text-lg font-black uppercase mb-4 border-b-2 border-dashed pb-2">Business Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">Address</label>
                        <input
                            type="text"
                            name="address"
                            value={settingsForm.address}
                            onChange={handleSettingsChange}
                            placeholder="Street Address"
                            className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] px-4 py-2 font-bold"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">City</label>
                        <input
                            type="text"
                            name="city"
                            value={settingsForm.city}
                            onChange={handleSettingsChange}
                            className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] px-4 py-2 font-bold"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">State</label>
                        <input
                            type="text"
                            name="state"
                            value={settingsForm.state}
                            onChange={handleSettingsChange}
                            className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] px-4 py-2 font-bold"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">Pincode</label>
                        <input
                            type="text"
                            name="pincode"
                            value={settingsForm.pincode}
                            onChange={handleSettingsChange}
                            maxLength={6}
                            className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] px-4 py-2 font-bold"
                        />
                    </div>
                </div>
            </div>

            {/* Tax Info */}
            <div className="neo-card bg-[var(--color-bg-surface)] p-6 border-4 border-[var(--color-text-primary)] shadow-[6px_6px_0_var(--color-text-primary)]">
                <h3 className="text-lg font-black uppercase mb-4 border-b-2 border-dashed pb-2">Tax Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">PAN Number</label>
                        <input
                            type="text"
                            name="panNumber"
                            value={settingsForm.panNumber}
                            onChange={handleSettingsChange}
                            placeholder="ABCDE1234F"
                            maxLength={10}
                            className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] px-4 py-2 font-bold uppercase"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">GST Number</label>
                        <input
                            type="text"
                            name="gstNumber"
                            value={settingsForm.gstNumber}
                            onChange={handleSettingsChange}
                            placeholder="22AAAAA0000A1Z5"
                            maxLength={15}
                            className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] px-4 py-2 font-bold uppercase"
                        />
                    </div>
                </div>
            </div>

            {/* Bank Details */}
            <div className="neo-card bg-[var(--color-bg-surface)] p-6 border-4 border-[var(--color-text-primary)] shadow-[6px_6px_0_var(--color-text-primary)]">
                <h3 className="text-lg font-black uppercase mb-4 border-b-2 border-dashed pb-2">💰 Payout Details</h3>
                <p className="text-xs text-gray-500 mb-4">This is where your earnings will be transferred.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">Account Holder Name</label>
                        <input
                            type="text"
                            name="bankAccountName"
                            value={settingsForm.bankAccountName}
                            onChange={handleSettingsChange}
                            className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] px-4 py-2 font-bold"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">Bank Account Number</label>
                        <input
                            type="text"
                            name="bankAccountNumber"
                            value={settingsForm.bankAccountNumber}
                            onChange={handleSettingsChange}
                            className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] px-4 py-2 font-bold"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">IFSC Code</label>
                        <input
                            type="text"
                            name="bankIfsc"
                            value={settingsForm.bankIfsc}
                            onChange={handleSettingsChange}
                            placeholder="SBIN0001234"
                            className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] px-4 py-2 font-bold uppercase"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">UPI ID (Optional)</label>
                        <input
                            type="text"
                            name="upiId"
                            value={settingsForm.upiId}
                            onChange={handleSettingsChange}
                            placeholder="yourname@upi"
                            className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] px-4 py-2 font-bold"
                        />
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="pt-4">
                <button
                    onClick={handleSaveSettings}
                    disabled={settingsSaving}
                    className="neo-btn bg-[var(--color-accent-primary)] text-white px-8 py-3 uppercase shadow-[4px_4px_0_black] hover:shadow-[6px_6px_0_black] hover:translate-x-[-2px] hover:translate-y-[-2px] disabled:opacity-50"
                >
                    {settingsSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'events': return renderEvents();
            case 'attendees': return renderAttendees();
            case 'analytics': return renderAnalytics();
            case 'geography': return renderGeography();
            case 'finances': return renderFinances();
            case 'settings': return renderSettings();
            default: return renderOverview();
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] pt-24 pb-12 transition-colors duration-300">
            {/* Top Bar */}
            <nav className="fixed top-0 left-0 right-0 h-20 bg-[var(--color-bg-surface)] border-b-4 border-[var(--color-text-primary)] z-40 px-8 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-black text-white flex items-center justify-center font-black text-2xl border-4 border-[var(--color-accent-primary)] shadow-[4px_4px_0_var(--color-accent-primary)] rotate-[-3deg] hover:rotate-0 transition-transform cursor-pointer">
                        TK
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-xl uppercase tracking-tighter leading-none hidden md:block">Tickify</span>
                        <span className="text-[10px] font-black uppercase text-[var(--color-accent-primary)] tracking-[0.2em] hidden md:block">Organizer Hub</span>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <Link to="/contact" className="text-xs font-black uppercase hover:text-[var(--color-accent-primary)] transition-colors border-b-2 border-dashed border-black hidden sm:block">Support</Link>
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className="relative w-12 h-12 rounded-full bg-white border-4 border-black overflow-hidden hover:scale-110 transition-all active:scale-95 flex items-center justify-center shadow-[4px_4px_0_black]"
                        >
                            <img
                                src={settingsForm.profileImageFile ? URL.createObjectURL(settingsForm.profileImageFile) : (settingsForm.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=Organizer`)}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        </button>
                        <span className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                    </div>
                </div>
            </nav>

            <div className="container mx-auto px-4 mt-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="w-full lg:w-64 flex-shrink-0">
                        <div className="bg-[var(--color-bg-surface)] border-4 border-[var(--color-text-primary)] shadow-[8px_8px_0_var(--color-text-primary)] p-4 sticky top-28">
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="lg:hidden w-full flex justify-between items-center font-black uppercase mb-2"
                            >
                                <span>Menu</span>
                                <span>{mobileMenuOpen ? '▲' : '▼'}</span>
                            </button>

                            <div className={`${mobileMenuOpen ? 'block' : 'hidden'} lg:block`}>
                                <nav className="space-y-2">
                                    {['Overview', 'Events', 'Attendees', 'Geography', 'Analytics', 'Finances', 'Settings'].map((item) => (
                                        <button
                                            key={item}
                                            onClick={() => { setActiveTab(item.toLowerCase()); setMobileMenuOpen(false); }}
                                            className={`w-full text-left px-4 py-3 font-black uppercase border-2 border-transparent hover:border-[var(--color-text-primary)] hover:bg-[var(--color-accent-secondary)] hover:text-white transition-all flex justify-between items-center group
                                            ${activeTab === item.toLowerCase() ? 'bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] border-[var(--color-text-primary)] shadow-[4px_4px_0_gray]' : 'text-[var(--color-text-secondary)]'}`}
                                        >
                                            {item}
                                            <span className={`opacity-0 group-hover:opacity-100 ${activeTab === item.toLowerCase() ? 'opacity-100' : ''}`}>&rarr;</span>
                                        </button>
                                    ))}
                                </nav>

                                <div className="mt-8 pt-8 border-t-4 border-[var(--color-text-primary)]">
                                    <Link to="/organizer/events/create" className="block text-center w-full py-3 bg-red-500 text-white font-black uppercase border-2 border-[var(--color-text-primary)] shadow-[4px_4px_0_var(--color-text-primary)] hover:shadow-[6px_6px_0_var(--color-text-primary)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
                                        Create Event +
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1">
                        {renderContent()}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default OrganizerDashboard;
