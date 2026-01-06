import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { uploadToS3 } from '../../services/s3Service';

const OrganizerDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const { currentUser } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [settingsSaving, setSettingsSaving] = useState(false);
    const [settingsSuccess, setSettingsSuccess] = useState(false);

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
                // Fetch Organizer's Events
                const eventsRef = collection(db, 'events');
                const q = query(eventsRef, where('organizerId', '==', currentUser.uid));
                const querySnapshot = await getDocs(q);

                const fetchedEvents = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setEvents(fetchedEvents);

                // Fetch Organizer Profile
                const profileRef = doc(db, 'organizers', currentUser.uid);
                const profileSnap = await getDoc(profileRef);

                if (profileSnap.exists()) {
                    const profileData = profileSnap.data();
                    const details = profileData.organizerDetails || {};

                    setSettingsForm(prev => ({
                        ...prev,
                        // Map from Firestore field names to form field names
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
                } else {
                    // Set default from user data
                    setSettingsForm(prev => ({
                        ...prev,
                        organizerName: currentUser.displayName || '',
                        supportEmail: currentUser.email || '',
                    }));
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
    const stats = [
        { label: 'Total Sales', value: '₹0', change: '0%', color: 'bg-green-400', textColor: 'text-black' },
        { label: 'Tickets Sold', value: '0', change: '0%', color: 'bg-purple-400', textColor: 'text-white' },
        { label: 'Active Events', value: events.length.toString(), change: '0', color: 'bg-yellow-400', textColor: 'text-black' },
        { label: 'Page Views', value: '0', change: '0%', color: 'bg-blue-400', textColor: 'text-white' },
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

        // Sort by timestamp (newest first)
        activities.sort((a, b) => b.timestamp - a.timestamp);

        return activities.slice(0, 10); // Limit to 10 most recent
    };

    const recentActivities = generateActivities();

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
                        <h3 className={`text-4xl font-black mb-2 ${stat.textColor}`}>{stat.value}</h3>
                        <p className={`font-black uppercase text-sm ${stat.textColor} opacity-80`}>{stat.label}</p>
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
                                <span className={`text-xs font-black uppercase px-2 py-1 border border-black ${event.approvalStatus === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {event.approvalStatus || 'Pending'}
                                </span>
                            </div>
                            <p className="text-sm font-bold text-[var(--color-text-secondary)] mt-1">
                                {event.startDate} • {event.venueName || 'Online'}, {event.city}
                            </p>

                            <div className="mt-4 w-full bg-[var(--color-bg-secondary)] h-4 border-2 border-black rounded-full overflow-hidden relative">
                                <div className="bg-[var(--color-accent-primary)] h-full w-[0%] absolute top-0 left-0"></div>
                                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white mix-blend-difference">0% SOLD OUT</div>
                            </div>

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
            <h2 className="text-3xl font-black uppercase text-[var(--color-text-primary)] mb-6">Attendees</h2>
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
                        {[1, 2, 3, 4, 5].map(i => (
                            <tr key={i} className="hover:bg-[var(--color-bg-secondary)]/50 transition-colors">
                                <td className="p-4 font-bold text-[var(--color-text-primary)]">User {i}</td>
                                <td className="p-4 font-medium text-[var(--color-text-secondary)]">VIP Pass</td>
                                <td className="p-4"><span className="text-xs font-black bg-green-200 text-green-900 border border-green-900 px-2 py-1">Checked In</span></td>
                                <td className="p-4 text-right"><button className="text-xs font-black uppercase underline">View</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderAnalytics = () => (
        <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-3xl font-black uppercase text-[var(--color-text-primary)] mb-6">Analytics & Reports</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-64">
                <div className="neo-card bg-[var(--color-bg-surface)] border-4 border-[var(--color-text-primary)] p-6 flex flex-col items-center justify-center shadow-[6px_6px_0_var(--color-text-primary)]">
                    <h3 className="uppercase font-black text-[var(--color-text-secondary)] mb-4">Traffic Source</h3>
                    <div className="flex gap-2 items-end h-32 w-full justify-center">
                        <div className="w-8 bg-blue-500 h-[40%] border-2 border-black" title="Social"></div>
                        <div className="w-8 bg-yellow-500 h-[80%] border-2 border-black" title="Direct"></div>
                        <div className="w-8 bg-green-500 h-[60%] border-2 border-black" title="Email"></div>
                    </div>
                    <div className="flex gap-6 mt-2 text-xs font-bold uppercase">
                        <span>Social</span><span>Direct</span><span>Email</span>
                    </div>
                </div>
                <div className="neo-card bg-[var(--color-bg-surface)] border-4 border-[var(--color-text-primary)] p-6 flex flex-col items-center justify-center shadow-[6px_6px_0_var(--color-text-primary)]">
                    <h3 className="uppercase font-black text-[var(--color-text-secondary)] mb-4">Sales Timeline</h3>
                    <div className="w-full h-32 border-b-2 border-l-2 border-black relative">
                        {/* Mock Line Chart */}
                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <polyline points="0,100 20,80 40,60 60,90 80,40 100,20" fill="none" stroke="var(--color-accent-primary)" strokeWidth="3" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderFinances = () => (
        <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-3xl font-black uppercase text-[var(--color-text-primary)] mb-6">Finances</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 bg-white border-4 border-black shadow-[6px_6px_0_black]">
                    <p className="text-sm font-black uppercase text-gray-500">Available Balance</p>
                    <h3 className="text-4xl font-black text-black">$8,240.00</h3>
                    <button className="mt-4 text-xs font-black uppercase bg-black text-white px-3 py-1">Withdraw</button>
                </div>
                <div className="p-6 bg-gray-100 border-4 border-black text-gray-400">
                    <p className="text-sm font-black uppercase">Pending Clearance</p>
                    <h3 className="text-4xl font-black">$1,200.00</h3>
                </div>
            </div>

            <h3 className="text-xl font-black uppercase text-[var(--color-text-primary)] mb-4">Recent Payouts</h3>
            <div className="space-y-2">
                <div className="flex justify-between p-4 bg-[var(--color-bg-surface)] border-2 border-[var(--color-text-primary)]">
                    <span className="font-bold">Payout to Bank ****4432</span>
                    <span className="font-black text-green-500">-$4,500.00</span>
                </div>
                <div className="flex justify-between p-4 bg-[var(--color-bg-surface)] border-2 border-[var(--color-text-primary)]">
                    <span className="font-bold">Payout to PayPal</span>
                    <span className="font-black text-green-500">-$2,100.00</span>
                </div>
            </div>
        </div>
    );

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
                profileImageUrl = await uploadToS3(settingsForm.profileImageFile, 'organizers/profiles');
            }

            const profileRef = doc(db, 'organizers', currentUser.uid);
            await setDoc(profileRef, {
                ...settingsForm,
                profileImage: profileImageUrl,
                profileImageFile: null, // Don't save file object to DB
                uid: currentUser.uid,
                email: currentUser.email,
                updatedAt: serverTimestamp(),
            }, { merge: true });

            setSettingsForm(prev => ({ ...prev, profileImage: profileImageUrl, profileImageFile: null }));
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

                {/* Image Upload */}
                <div className="mb-6 flex flex-col items-center">
                    <div className="w-32 h-32 bg-gray-200 rounded-full border-4 border-black overflow-hidden mb-4 relative group">
                        <img
                            src={settingsForm.profileImageFile ? URL.createObjectURL(settingsForm.profileImageFile) : (settingsForm.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${settingsForm.organizerName}`)}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                        <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <span className="text-white font-bold text-xs uppercase">Change</span>
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
                    </div>
                    <p className="text-xs font-bold text-[var(--color-text-secondary)] uppercase">Click image to upload new</p>
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
                    <div className="w-10 h-10 bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] flex items-center justify-center font-black text-xl border-2 border-[var(--color-bg-primary)]">O</div>
                    <span className="font-black text-xl uppercase tracking-tighter hidden md:block">Organizer Panel</span>
                </div>
                <div className="flex items-center gap-6">
                    <Link to="/contact" className="font-bold uppercase hover:underline text-[var(--color-text-primary)]">Help</Link>
                    <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-[var(--color-text-primary)] overflow-hidden">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Organizer" alt="Profile" />
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
                                    {['Overview', 'Events', 'Attendees', 'Analytics', 'Finances', 'Settings'].map((item) => (
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
