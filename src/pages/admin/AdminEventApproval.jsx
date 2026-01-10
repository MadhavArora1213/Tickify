import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp, addDoc, getDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { sendEventApprovalEmail, sendEventRejectionEmail } from '../../services/brevoService';

const AdminEventApproval = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [rejectMode, setRejectMode] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchPendingEvents();
    }, []);

    const fetchPendingEvents = async () => {
        try {
            setLoading(true);
            const eventsRef = collection(db, 'events');
            const q = query(eventsRef, where('status', '==', 'pending'));
            const querySnapshot = await getDocs(q);

            const pendingEvents = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Get unique organizer IDs
            const organizerIds = [...new Set(pendingEvents.map(e => e.organizerId))];

            // Fetch organizer names
            const organizerMap = {};
            for (const orgId of organizerIds) {
                if (!orgId) continue;
                const orgDoc = await getDoc(doc(db, 'organizers', orgId));
                if (orgDoc.exists()) {
                    organizerMap[orgId] = {
                        name: orgDoc.data().displayName || orgDoc.data().organizerDetails?.companyName || 'Unknown Organizer',
                        email: orgDoc.data().email
                    };
                }
            }

            const eventsWithOrgs = pendingEvents.map(e => ({
                ...e,
                organizerName: organizerMap[e.organizerId]?.name || 'Unknown Organizer',
                organizerEmail: organizerMap[e.organizerId]?.email || 'No email'
            }));

            setEvents(eventsWithOrgs);
        } catch (error) {
            toast.error("Error fetching pending events");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (eventId) => {
        if (!window.confirm("Approve this event for publication?")) return;
        setActionLoading(true);
        try {
            const eventRef = doc(db, 'events', eventId);
            await updateDoc(eventRef, {
                status: 'published', // or 'active'
                approvedAt: serverTimestamp(),
                moderatedBy: 'admin'
            });

            // Send Confirmation Email
            if (selectedEvent.organizerEmail) {
                try {
                    await sendEventApprovalEmail(
                        selectedEvent.organizerEmail,
                        selectedEvent.organizerName || 'Organizer',
                        selectedEvent.eventTitle || selectedEvent.title
                    );
                } catch (emailErr) {
                    toast.error("Failed to send notification email");
                }
            }

            // Create Notification for Organizer
            await addDoc(collection(db, 'notifications'), {
                recipient: selectedEvent.organizerId,
                type: 'event_approved',
                message: `Your event "${selectedEvent.eventTitle || selectedEvent.title}" has been approved!`,
                eventId: eventId,
                read: false,
                createdAt: serverTimestamp()
            });

            setSelectedEvent(null);
            await fetchPendingEvents();
            toast.success("Event approved successfully!");
        } catch (error) {
            toast.error("Failed to approve event.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async (eventId) => {
        if (!rejectionReason.trim()) {
            toast.error("Please provide a reason for rejection.");
            return;
        }
        setActionLoading(true);
        try {
            const eventRef = doc(db, 'events', eventId);
            await updateDoc(eventRef, {
                status: 'rejected',
                rejectionReason: rejectionReason,
                moderatedAt: serverTimestamp()
            });

            // Send Rejection Email
            if (selectedEvent.organizerEmail) {
                try {
                    await sendEventRejectionEmail(
                        selectedEvent.organizerEmail,
                        selectedEvent.organizerName || 'Organizer',
                        selectedEvent.eventTitle || selectedEvent.title,
                        rejectionReason
                    );
                } catch (emailErr) {
                    toast.error("Failed to send notification email");
                }
            }

            // Create Notification for Organizer
            await addDoc(collection(db, 'notifications'), {
                recipient: selectedEvent.organizerId,
                type: 'event_rejected',
                message: `Your event "${selectedEvent.eventTitle || selectedEvent.title}" was not approved. Reason: ${rejectionReason}`,
                eventId: eventId,
                read: false,
                createdAt: serverTimestamp()
            });

            setSelectedEvent(null);
            setRejectMode(false);
            setRejectionReason('');
            await fetchPendingEvents();
            toast.success("Event rejected.");
        } catch (error) {
            toast.error("Failed to reject event.");
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 font-mono text-sm text-black">
            {/* Header */}
            <div className="bg-black text-white p-4 border-b-4 border-gray-400 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <Link to="/admin/dashboard" className="w-8 h-8 bg-white text-black flex items-center justify-center font-black hover:bg-yellow-400 transition-colors">
                        &larr;
                    </Link>
                    <h1 className="font-black uppercase tracking-tighter text-xl">Event Moderation Queue</h1>
                </div>
                <div className="flex items-center gap-4">
                    <span className="bg-yellow-400 text-black px-2 py-1 font-black uppercase text-[10px]">
                        Pending: {events.length}
                    </span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* List Column */}
                <div className="lg:col-span-1 space-y-4 max-h-[calc(100vh-160px)] overflow-y-auto pr-2">
                    {loading ? (
                        <div className="p-10 text-center animate-pulse uppercase font-black">Scanning database...</div>
                    ) : events.map(event => (
                        <div
                            key={event.id}
                            onClick={() => { setSelectedEvent(event); setRejectMode(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            className={`p-4 border-2 cursor-pointer transition-all hover:bg-yellow-50
                            ${selectedEvent?.id === event.id ? 'bg-yellow-100 border-black shadow-[4px_4px_0_black]' : 'bg-white border-gray-400'}`}
                        >
                            <p className="font-bold uppercase text-[10px] text-gray-500 mb-1">{event.startDate || event.date || 'No Date Set'}</p>
                            <h3 className="font-black uppercase text-base leading-tight mb-2 truncate">{event.eventTitle || event.title}</h3>
                            <div className="flex justify-between items-center">
                                <p className="text-[10px] font-bold text-blue-600">{event.organizerName || event.organizer || 'Unknown Organizer'}</p>
                                {(() => {
                                    const now = new Date();
                                    const endDate = new Date(`${event.registrationEndDate}T${event.registrationEndTime || '23:59'}`);
                                    if (event.registrationEndDate && now > endDate) {
                                        return <span className="text-[8px] font-black uppercase px-2 py-0.5 border border-black bg-red-100 text-red-800">Closed</span>;
                                    }
                                    return null;
                                })()}
                            </div>
                        </div>
                    ))}
                    {!loading && events.length === 0 && <p className="text-gray-500 italic font-bold">No pending events in queue. ✅</p>}
                </div>

                {/* Detail Column */}
                <div className={`lg:col-span-2 ${!selectedEvent ? 'hidden lg:block' : 'block'}`}>
                    {selectedEvent ? (
                        <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0_gray] relative animate-fade-in">
                            {/* Mobile Back Button */}
                            <button
                                onClick={() => setSelectedEvent(null)}
                                className="lg:hidden mb-4 flex items-center gap-2 text-sm font-black uppercase underline"
                            >
                                &larr; Back to List
                            </button>

                            <div className="absolute top-0 right-0 bg-yellow-400 text-black px-4 py-1 text-[10px] font-black uppercase border-b-2 border-l-2 border-black z-10">
                                Reviewing ID: {selectedEvent.id.slice(0, 8)}...
                            </div>

                            {/* Banner Display */}
                            <div className="mb-6 -mx-8 -mt-8 border-b-4 border-black overflow-hidden h-64 bg-gray-200">
                                <img
                                    src={selectedEvent.bannerUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1200&q=80'}
                                    alt="Event Banner"
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <h2 className="text-3xl font-black uppercase mb-4">{selectedEvent.eventTitle || selectedEvent.title}</h2>

                            <div className="grid grid-cols-2 gap-8 mb-8">
                                <div>
                                    <h4 className="text-[10px] font-black uppercase text-gray-400 mb-1">Organizer</h4>
                                    <p className="font-black text-blue-600">{selectedEvent.organizerName}</p>
                                    <p className="text-xs font-bold text-gray-500">{selectedEvent.organizerEmail}</p>
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black uppercase text-gray-400 mb-1">Type & Category</h4>
                                    <p className="font-black uppercase">{selectedEvent.eventType || 'Offline'} | {selectedEvent.category}</p>
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black uppercase text-gray-400 mb-1">Date & Time</h4>
                                    <p className="font-bold">{selectedEvent.startDate} @ {selectedEvent.startTime}</p>
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black uppercase text-gray-400 mb-1">Venue</h4>
                                    <p className="font-bold">{selectedEvent.venueName}, {selectedEvent.city}</p>
                                </div>
                            </div>

                            <div className="mb-8">
                                <h4 className="text-[10px] font-black uppercase text-gray-400 mb-2">Event Description</h4>
                                <div className="p-4 bg-gray-50 border-2 border-dashed border-gray-300 text-sm leading-relaxed">
                                    {selectedEvent.eventDescription || 'No description provided.'}
                                </div>
                            </div>

                            {/* Compliance Info */}
                            <div className="mb-8 p-4 bg-blue-50 border-2 border-blue-400">
                                <h4 className="text-xs font-black uppercase text-blue-600 mb-3 flex items-center gap-2">
                                    🛡️ Compliance Verification
                                </h4>
                                <div className="grid grid-cols-2 gap-4 text-xs">
                                    <div>
                                        <span className="block text-gray-500 uppercase font-bold text-[9px]">PAN Number</span>
                                        <span className="font-black">{selectedEvent.panNumber || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="block text-gray-500 uppercase font-bold text-[9px]">GST Number</span>
                                        <span className="font-black">{selectedEvent.gstNumber || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="block text-gray-500 uppercase font-bold text-[9px]">{selectedEvent.govtIdType}</span>
                                        <span className="font-black">{selectedEvent.govtIdNumber || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <a
                                            href={selectedEvent.idProofUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-block mt-1 text-blue-600 font-black underline hover:text-blue-800"
                                        >
                                            View ID Proof Document ↗
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            {!rejectMode ? (
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => handleApprove(selectedEvent.id)}
                                        disabled={actionLoading}
                                        className="flex-1 bg-green-500 text-white font-black uppercase py-4 border-4 border-black shadow-[4px_4px_0_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_black] active:shadow-none active:translate-x-0 transition-all disabled:opacity-50"
                                    >
                                        {actionLoading ? 'Processing...' : 'Approve & Publish ✅'}
                                    </button>
                                    <button
                                        onClick={() => setRejectMode(true)}
                                        disabled={actionLoading}
                                        className="bg-red-500 text-white font-black uppercase px-8 py-4 border-4 border-black shadow-[4px_4px_0_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_black] active:shadow-none active:translate-x-0 transition-all disabled:opacity-50"
                                    >
                                        Reject ✕
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4 animate-fade-in">
                                    <label className="block text-xs font-black uppercase text-red-600">Rejection Reason (Required)</label>
                                    <textarea
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        className="w-full border-4 border-black p-4 font-bold text-sm h-32 focus:outline-none"
                                        placeholder="Explain why this event was rejected..."
                                    ></textarea>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => handleReject(selectedEvent.id)}
                                            disabled={actionLoading}
                                            className="flex-1 bg-red-600 text-white font-black uppercase py-4 border-4 border-black shadow-[4px_4px_0_black] hover:shadow-[6px_6px_0_black] transition-all disabled:opacity-50"
                                        >
                                            Confirm Rejection
                                        </button>
                                        <button
                                            onClick={() => { setRejectMode(false); setRejectionReason(''); }}
                                            className="bg-gray-200 text-black font-black uppercase px-8 py-4 border-4 border-black hover:bg-white transition-all"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-full min-h-[500px] border-4 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400">
                            <span className="text-6xl mb-4">🔦</span>
                            <p className="font-black uppercase tracking-widest text-xl">Select an event to review</p>
                            <p className="font-bold text-sm">Actionable items will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminEventApproval;
