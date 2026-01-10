import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import toast from 'react-hot-toast';

const OrganizerPublicProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [organizer, setOrganizer] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrganizer = async () => {
            try {
                if (!id) return;
                const docRef = doc(db, 'organizers', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setOrganizer(docSnap.data());
                } else {
                    console.log("No such organizer!");
                }
            } catch (error) {
                toast.error("Error fetching organizer profile");
            } finally {
                setLoading(false);
            }
        };

        fetchOrganizer();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--color-bg-primary)] pt-36 pb-20 flex justify-center items-center">
                <div className="text-xl font-bold text-[var(--color-text-primary)]">Loading Profile...</div>
            </div>
        );
    }

    if (!organizer) {
        return (
            <div className="min-h-screen bg-[var(--color-bg-primary)] pt-36 pb-20 flex justify-center items-center">
                <div className="text-xl font-bold text-[var(--color-text-primary)]">Organizer not found.</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] pt-36 pb-20">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="neo-btn mb-8 bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] px-6 py-2 flex items-center gap-2 font-black uppercase text-sm border-2 border-black shadow-[4px_4px_0_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_black] transition-all"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Back
                </button>

                {/* Header Card */}
                <div className="neo-card bg-[var(--color-bg-surface)] p-8 border-4 border-[var(--color-text-primary)] shadow-[8px_8px_0_var(--color-text-primary)] mb-8 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-32 h-32 flex-shrink-0 bg-gray-200 rounded-full border-4 border-black overflow-hidden relative">
                        <img
                            src={organizer.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${organizer.name}`}
                            alt={organizer.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="text-center md:text-left flex-1">
                        <h1 className="text-3xl md:text-5xl font-black uppercase text-[var(--color-text-primary)] mb-2">
                            {organizer.organizerName || organizer.name || "Organizer"}
                        </h1>
                        <p className="text-lg font-bold text-[var(--color-text-secondary)] mb-4">
                            {organizer.city ? `${organizer.city}, ${organizer.state || ''}` : 'Location Hidden'}
                        </p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                            {organizer.website && (
                                <a href={organizer.website} target="_blank" rel="noreferrer" className="neo-btn px-4 py-2 bg-blue-100 text-blue-800 text-xs font-black uppercase border border-black hover:bg-blue-200">
                                    Website
                                </a>
                            )}
                            {(organizer.supportEmail || organizer.email) && (
                                <a href={`mailto:${organizer.supportEmail || organizer.email}`} className="neo-btn px-4 py-2 bg-green-100 text-green-800 text-xs font-black uppercase border border-black hover:bg-green-200">
                                    Contact
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* About */}
                    <div className="neo-card bg-[var(--color-bg-surface)] p-8 border-4 border-[var(--color-text-primary)] shadow-[8px_8px_0_var(--color-text-primary)]">
                        <h3 className="text-2xl font-black uppercase mb-4 flex items-center gap-2">
                            📢 About
                        </h3>
                        <p className="text-[var(--color-text-primary)] font-medium leading-relaxed">
                            {organizer.bio || "This organizer has not shared a bio yet."}
                        </p>
                    </div>

                    {/* Stats or Additional Info */}
                    <div className="neo-card bg-[var(--color-bg-surface)] p-8 border-4 border-[var(--color-text-primary)] shadow-[8px_8px_0_var(--color-text-primary)]">
                        <h3 className="text-2xl font-black uppercase mb-4 flex items-center gap-2">
                            ⭐ Info
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b-2 border-dashed border-[var(--color-text-secondary)] pb-2">
                                <span className="font-bold text-[var(--color-text-secondary)]">Member Since</span>
                                <span className="font-black text-[var(--color-text-primary)]">
                                    {organizer.createdAt ? new Date(organizer.createdAt.seconds * 1000).getFullYear() : '2025'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center border-b-2 border-dashed border-[var(--color-text-secondary)] pb-2">
                                <span className="font-bold text-[var(--color-text-secondary)]">Verified</span>
                                <span className="font-black text-[var(--color-text-primary)]">
                                    {organizer.isVerified ? 'YES' : 'NO'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrganizerPublicProfile;
