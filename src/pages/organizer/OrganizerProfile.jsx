import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

const OrganizerProfile = () => {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profileData, setProfileData] = useState({
        organizerName: '',
        email: '',
        phoneNumber: '',
        taxId: '',
        address: '',
        supportEmail: '',
        bio: '',
        city: '',
        state: '',
        createdAt: null,
        isVerified: false
    });

    useEffect(() => {
        const fetchProfile = async () => {
            if (!currentUser) return;
            try {
                const docRef = doc(db, 'organizers', currentUser.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setProfileData({
                        organizerName: data.organizerName || data.displayName || '',
                        email: data.email || '',
                        phoneNumber: data.phoneNumber || '',
                        taxId: data.organizerDetails?.taxId || '',
                        address: data.organizerDetails?.address || '',
                        supportEmail: data.supportEmail || data.email || '',
                        bio: data.bio || '',
                        city: data.city || '',
                        state: data.state || '',
                        createdAt: data.createdAt,
                        isVerified: data.status === 'active' || data.isVerified
                    });
                }
            } catch (error) {
                toast.error("Error fetching profile");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [currentUser]);

    const handleSave = async () => {
        if (!currentUser) return;
        setSaving(true);
        try {
            const docRef = doc(db, 'organizers', currentUser.uid);
            await updateDoc(docRef, {
                organizerName: profileData.organizerName,
                supportEmail: profileData.supportEmail,
                bio: profileData.bio,
                city: profileData.city,
                state: profileData.state,
                'organizerDetails.taxId': profileData.taxId,
                'organizerDetails.address': profileData.address,
                updatedAt: new Date()
            });
            toast.success("Profile updated successfully!");
        } catch (error) {
            toast.error("Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--color-bg-primary)] pt-36 flex justify-center items-center">
                <div className="font-black animate-pulse uppercase tracking-widest text-xl">Loading Official Data...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] pt-24 pb-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <h1 className="text-4xl md:text-5xl font-black uppercase text-[var(--color-text-primary)] mb-8">Organizer Profile</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Left Column: Avatar & Quick Info */}
                    <div className="space-y-6">
                        <div className="neo-card bg-[var(--color-bg-surface)] p-6 border-4 border-[var(--color-text-primary)] shadow-[8px_8px_0_var(--color-text-primary)] text-center">
                            <div className="w-32 h-32 mx-auto bg-gray-200 rounded-full border-4 border-black overflow-hidden mb-4 group relative cursor-pointer">
                                <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${profileData.organizerName}`} alt="Avatar" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-white font-black uppercase text-xs">AI Generated</span>
                                </div>
                            </div>
                            <h2 className="text-xl font-black uppercase break-words">{profileData.organizerName || 'New Organizer'}</h2>
                            <p className="text-sm font-bold text-[var(--color-text-secondary)]">
                                Member since {profileData.createdAt ? new Date(profileData.createdAt.seconds * 1000).getFullYear() : '2025'}
                            </p>
                            <div className="mt-4 flex justify-center gap-2">
                                <span className={`${profileData.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} text-xs font-black uppercase px-2 py-1 border border-black`}>
                                    {profileData.isVerified ? 'Verified' : 'Pending Verification'}
                                </span>
                            </div>
                        </div>

                        {/* Public Bio Section */}
                        <div className="neo-card bg-white p-6 border-4 border-black shadow-[4px_4px_0_black]">
                            <label className="block text-xs font-black uppercase text-gray-400 mb-2 tracking-widest">Public Bio</label>
                            <textarea
                                value={profileData.bio}
                                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                placeholder="Tell your audience about your events..."
                                className="w-full bg-transparent font-bold text-sm resize-none focus:outline-none min-h-[100px]"
                            />
                        </div>
                    </div>

                    {/* Right Column: Forms */}
                    <div className="md:col-span-2 space-y-8 animate-fade-in-up">

                        {/* Company Info */}
                        <div className="neo-card bg-[var(--color-bg-surface)] p-8 border-4 border-black shadow-[8px_8px_0_black] relative">
                            <h3 className="text-2xl font-black uppercase mb-6 flex items-center gap-2 italic">
                                🏢 Company Details
                            </h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-gray-500 mb-1 tracking-widest">Display Name</label>
                                        <input
                                            type="text"
                                            value={profileData.organizerName}
                                            onChange={(e) => setProfileData({ ...profileData, organizerName: e.target.value })}
                                            className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-black px-4 py-2 font-bold focus:shadow-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-gray-500 mb-1 tracking-widest">Tax ID (GST/VAT)</label>
                                        <input
                                            type="text"
                                            value={profileData.taxId}
                                            onChange={(e) => setProfileData({ ...profileData, taxId: e.target.value })}
                                            className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-black px-4 py-2 font-bold focus:shadow-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-gray-500 mb-1 tracking-widest">Support Email</label>
                                        <input
                                            type="email"
                                            value={profileData.supportEmail}
                                            onChange={(e) => setProfileData({ ...profileData, supportEmail: e.target.value })}
                                            className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-black px-4 py-2 font-bold focus:shadow-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-gray-500 mb-1 tracking-widest">City</label>
                                        <input
                                            type="text"
                                            value={profileData.city}
                                            onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                                            className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-black px-4 py-2 font-bold focus:shadow-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-gray-500 mb-1 tracking-widest">Registered Address</label>
                                    <textarea
                                        value={profileData.address}
                                        onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                                        className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-black px-4 py-2 font-bold focus:shadow-none transition-all min-h-[80px] resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Account Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="neo-card bg-black text-white p-6 shadow-[4px_4px_0_var(--color-accent-primary)]">
                                <span className="block text-[10px] font-black uppercase text-gray-400 mb-1">Login Email</span>
                                <span className="font-black text-sm truncate block">{profileData.email}</span>
                            </div>
                            <div className="neo-card bg-white p-6 border-2 border-black shadow-[4px_4px_0_black]">
                                <span className="block text-[10px] font-black uppercase text-gray-500 mb-1">Phone Verified</span>
                                <span className="font-black text-sm block">{profileData.phoneNumber || 'N/A'}</span>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="neo-btn bg-white border-2 border-black text-black px-6 py-3 font-black uppercase shadow-[4px_4px_0_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_black] transition-all"
                            >
                                Reset
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className={`neo-btn ${saving ? 'bg-gray-400' : 'bg-black'} text-white px-8 py-3 font-black uppercase shadow-[6px_6px_0_var(--color-accent-primary)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0_black] transition-all flex items-center gap-2`}
                            >
                                {saving ? 'Saving...' : 'Save Profile'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrganizerProfile;
