import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { db, auth } from '../config/firebase';
import toast from 'react-hot-toast';

const Profile = () => {
    const [activeTab, setActiveTab] = useState('info');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // User profile data
    const [profileData, setProfileData] = useState({
        displayName: '',
        email: '',
        phone: '',
        bio: '',
        firstName: '',
        lastName: ''
    });
    const [collectionName, setCollectionName] = useState('users');

    // Password change
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    // Fetch user data from Firestore
    useEffect(() => {
        const fetchUserData = async () => {
            if (!currentUser) {
                navigate('/login');
                return;
            }

            try {
                // Try to find user in 'users' collection first
                let targetCollection = 'users';
                let docRef = doc(db, 'users', currentUser.uid);
                let userDoc = await getDoc(docRef);

                // If not found, check 'organizers' collection
                if (!userDoc.exists()) {
                    docRef = doc(db, 'organizers', currentUser.uid);
                    userDoc = await getDoc(docRef);
                    targetCollection = 'organizers';
                }

                if (userDoc.exists()) {
                    setCollectionName(targetCollection);
                    const data = userDoc.data();
                    const nameParts = (data.displayName || '').split(' ');
                    setProfileData({
                        displayName: data.displayName || '',
                        email: data.email || currentUser.email || '',
                        phone: data.phoneNumber || data.phone || '', // Check phoneNumber first
                        bio: data.bio || '',
                        firstName: nameParts[0] || '',
                        lastName: nameParts.slice(1).join(' ') || ''
                    });
                } else {
                    // If no Firestore doc, use Firebase Auth data
                    const nameParts = (currentUser.displayName || '').split(' ');
                    setProfileData({
                        displayName: currentUser.displayName || '',
                        email: currentUser.email || '',
                        phone: '',
                        bio: '',
                        firstName: nameParts[0] || '',
                        lastName: nameParts.slice(1).join(' ') || ''
                    });
                }
            } catch (error) {
                toast.error('Failed to load profile data.');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [currentUser, navigate]);

    // Handle profile update
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        setSaving(true);

        try {
            const fullName = `${profileData.firstName} ${profileData.lastName}`.trim();

            await updateDoc(doc(db, collectionName, currentUser.uid), {
                displayName: fullName,
                phoneNumber: profileData.phone, // Update phoneNumber
                bio: profileData.bio,
                updatedAt: serverTimestamp()
            });

            setProfileData(prev => ({ ...prev, displayName: fullName }));
            toast.success('Profile updated successfully!');
        } catch (error) {
            toast.error('Failed to update profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    // Handle password change
    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match.' });
            return;
        }

        if (passwordData.newPassword.length < 8) {
            setMessage({ type: 'error', text: 'Password must be at least 8 characters long.' });
            return;
        }

        setSaving(true);

        try {
            // Re-authenticate user first
            const credential = EmailAuthProvider.credential(
                currentUser.email,
                passwordData.currentPassword
            );
            await reauthenticateWithCredential(auth.currentUser, credential);

            // Update password
            await updatePassword(auth.currentUser, passwordData.newPassword);

            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            toast.success('Password updated successfully!');
        } catch (error) {
            if (error.code === 'auth/wrong-password') {
                toast.error('Current password is incorrect.');
            } else if (error.code === 'auth/requires-recent-login') {
                toast.error('Please log out and log in again before changing password.');
            } else {
                toast.error('Failed to change password. Please try again.');
            }
        } finally {
            setSaving(false);
        }
    };

    // Handle logout
    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            // Fail silently or toast
            toast.error('Logout failed');
        }
    };

    // Get member since date
    const getMemberSince = () => {
        if (currentUser?.metadata?.creationTime) {
            return new Date(currentUser.metadata.creationTime).getFullYear();
        }
        return new Date().getFullYear();
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'info':
                return (
                    <form onSubmit={handleProfileUpdate} className="space-y-6 animate-fade-in-up">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-[var(--color-text-secondary)]">First Name</label>
                                <input
                                    type="text"
                                    value={profileData.firstName}
                                    onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                                    className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-black rounded-lg px-4 py-3 font-bold text-[var(--color-text-primary)]"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-[var(--color-text-secondary)]">Last Name</label>
                                <input
                                    type="text"
                                    value={profileData.lastName}
                                    onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                                    className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-black rounded-lg px-4 py-3 font-bold text-[var(--color-text-primary)]"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-[var(--color-text-secondary)]">Email Address</label>
                            <input
                                type="email"
                                value={profileData.email}
                                disabled
                                className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-black rounded-lg px-4 py-3 font-bold text-[var(--color-text-muted)] cursor-not-allowed opacity-60"
                            />
                            <p className="text-xs text-[var(--color-text-muted)]">Email cannot be changed</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-[var(--color-text-secondary)]">Phone Number</label>
                            <input
                                type="tel"
                                value={profileData.phone}
                                onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                                placeholder="+1 234 567 8900"
                                className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-black rounded-lg px-4 py-3 font-bold text-[var(--color-text-primary)]"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-[var(--color-text-secondary)]">Bio</label>
                            <textarea
                                value={profileData.bio}
                                onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                                placeholder="Tell us about yourself..."
                                rows="4"
                                className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-black rounded-lg px-4 py-3 font-bold text-[var(--color-text-primary)]"
                            ></textarea>
                        </div>
                        <button
                            type="submit"
                            disabled={saving}
                            className="neo-btn bg-[var(--color-accent-primary)] text-white px-6 py-3 shadow-[4px_4px_0_black] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <span className="animate-spin">⏳</span>
                                    SAVING...
                                </>
                            ) : (
                                'SAVE CHANGES'
                            )}
                        </button>
                    </form>
                );
            case 'security':
                return (
                    <form onSubmit={handlePasswordChange} className="space-y-6 animate-fade-in-up">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-[var(--color-text-secondary)]">Current Password</label>
                            <input
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                required
                                className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-black rounded-lg px-4 py-3 font-bold text-[var(--color-text-primary)]"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-[var(--color-text-secondary)]">New Password</label>
                            <input
                                type="password"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                required
                                minLength={8}
                                className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-black rounded-lg px-4 py-3 font-bold text-[var(--color-text-primary)]"
                            />
                            <p className="text-xs text-[var(--color-text-muted)]">Minimum 8 characters</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-[var(--color-text-secondary)]">Confirm New Password</label>
                            <input
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                required
                                className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-black rounded-lg px-4 py-3 font-bold text-[var(--color-text-primary)]"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={saving}
                            className="neo-btn bg-[var(--color-warning)] text-white px-6 py-3 shadow-[4px_4px_0_black] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <span className="animate-spin">⏳</span>
                                    UPDATING...
                                </>
                            ) : (
                                'UPDATE PASSWORD'
                            )}
                        </button>

                        {/* Danger Zone */}
                        <div className="mt-10 pt-6 border-t-2 border-dashed border-[var(--color-error)]">
                            <h4 className="font-black text-[var(--color-error)] uppercase mb-4">Danger Zone</h4>
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="neo-btn bg-[var(--color-error)] text-white px-6 py-3 shadow-[4px_4px_0_black]"
                            >
                                🚪 LOGOUT
                            </button>
                        </div>
                    </form>
                );
            case 'history':
                return (
                    <div className="space-y-4 animate-fade-in-up">
                        <p className="text-[var(--color-text-secondary)] font-bold mb-4">Your recent orders will appear here.</p>
                        {[1, 2, 3].map((order) => (
                            <div key={order} className="neo-card p-4 border-2 border-black bg-[var(--color-bg-secondary)] flex justify-between items-center group hover:translate-x-1 transition-transform">
                                <div>
                                    <h4 className="font-black text-[var(--color-text-primary)] uppercase">Order #ORD-{202400 + order}</h4>
                                    <p className="text-xs font-bold text-[var(--color-text-secondary)]">2 Items • March {10 + order}, 2025</p>
                                </div>
                                <span className="font-black text-[var(--color-accent-primary)]">$120.00</span>
                            </div>
                        ))}
                    </div>
                );
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl animate-bounce mb-4">👤</div>
                    <p className="font-black uppercase text-[var(--color-text-secondary)]">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!currentUser) {
        return null;
    }

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] pt-24 md:pt-36 pb-24">
            <div className="container mx-auto px-4">
                <h1 className="text-4xl md:text-6xl font-black mb-12 uppercase text-center text-[var(--color-text-primary)]">
                    <span className="block dark:hidden" style={{ WebkitTextStroke: '2px black', color: 'white', textShadow: '4px 4px 0px #000' }}>My Profile</span>
                    <span className="hidden dark:block drop-shadow-[4px_4px_0_var(--color-accent-primary)]">My Profile</span>
                </h1>


                <div className="flex flex-col lg:flex-row gap-8 max-w-5xl mx-auto">
                    {/* Sidebar */}
                    <div className="w-full lg:w-1/4">
                        <div className="neo-card bg-[var(--color-bg-surface)] p-6 border-4 border-black shadow-[8px_8px_0_black]">
                            <div className="flex flex-col items-center mb-6">
                                <div className="w-24 h-24 rounded-full border-4 border-black bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] mb-3 overflow-hidden flex items-center justify-center">
                                    {currentUser.photoURL ? (
                                        <img src={currentUser.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-white font-black text-4xl">
                                            {profileData.firstName?.charAt(0)?.toUpperCase() || profileData.email?.charAt(0)?.toUpperCase() || '?'}
                                        </span>
                                    )}
                                </div>
                                <h2 className="font-black text-xl text-[var(--color-text-primary)] uppercase text-center">
                                    {profileData.displayName || profileData.email?.split('@')[0] || 'User'}
                                </h2>
                                <p className="text-xs font-bold text-[var(--color-text-secondary)]">Member since {getMemberSince()}</p>

                                {/* Email badge */}
                                <div className="mt-2 px-3 py-1 bg-[var(--color-success)]/20 border border-[var(--color-success)] rounded-full">
                                    <span className="text-xs font-bold text-[var(--color-success)]">✓ Verified</span>
                                </div>
                            </div>

                            <nav className="space-y-2">
                                {[
                                    { id: 'info', label: 'Personal Info', icon: '👤' },
                                    { id: 'security', label: 'Security', icon: '🔒' },
                                    { id: 'notifications', label: 'Notifications', icon: '🔔' },
                                    { id: 'history', label: 'Order History', icon: '📜' },
                                    { id: 'saved', label: 'Saved Events', icon: '❤️' },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => { setActiveTab(tab.id); setMessage({ type: '', text: '' }); }}
                                        className={`w-full text-left px-4 py-3 font-black uppercase text-sm border-2 border-black transition-all flex items-center gap-3
                                        ${activeTab === tab.id
                                                ? 'bg-[var(--color-accent-primary)] text-white shadow-[4px_4px_0_black] translate-x-[-2px] translate-y-[-2px]'
                                                : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-primary)]'}`}
                                    >
                                        <span>{tab.icon}</span> {tab.label}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="w-full lg:w-3/4">
                        <div className="neo-card bg-[var(--color-bg-surface)] p-8 border-4 border-black shadow-[8px_8px_0_black] min-h-[500px]">
                            <h3 className="text-2xl font-black text-[var(--color-text-primary)] mb-6 uppercase border-b-4 border-black pb-4">
                                {activeTab.replace('-', ' ')}
                            </h3>
                            {renderContent()}

                            {/* Placeholder for unimplemented tabs */}
                            {['notifications', 'saved'].includes(activeTab) && (
                                <div className="text-center py-10">
                                    <span className="text-4xl">🚧</span>
                                    <p className="font-bold text-[var(--color-text-secondary)] mt-4">This section is under construction.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
