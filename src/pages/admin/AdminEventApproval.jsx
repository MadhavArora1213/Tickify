import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
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
        setLoading(true);
        try {
            const eventsRef = collection(db, 'events');
            const q = query(eventsRef, where('status', '==', 'pending'));
            const querySnapshot = await getDocs(q);
            const eventsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Fetch Organizer Names
            const organizerIds = [...new Set(eventsData.map(e => e.organizerId).filter(Boolean))];
            const organizerMap = {};

            if (organizerIds.length > 0) {
                // Fetch each organizer (Firestore 'in' query is limited to 10, so individual fetches or small batches)
                // For a few pending events, individual fetches is fine.
                await Promise.all(organizerIds.map(async (id) => {
                    const orgDoc = await getDocs(query(collection(db, 'organizers'), where('uid', '==', id)));
                    if (!orgDoc.empty) {
                        const orgData = orgDoc.docs[0].data();
                        organizerMap[id] = {
                            name: orgData.displayName || orgData.organizerDetails?.companyName,
                            email: orgData.email
                        };
                    }
                }));
            }

            const eventsWithOrgs = eventsData.map(e => ({
                ...e,
                organizerName: organizerMap[e.organizerId]?.name || 'Unknown Organizer',
                organizerEmail: organizerMap[e.organizerId]?.email || 'No email'
            }));

            setEvents(eventsWithOrgs);
        } catch (error) {
            console.error("Error fetching pending events:", error);
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
                await sendEventApprovalEmail(
                    selectedEvent.organizerEmail,
                    selectedEvent.organizerName || 'Organizer',
                    selectedEvent.eventTitle || selectedEvent.title
                );
            }

            setSelectedEvent(null);
            await fetchPendingEvents();
            alert("Event approved successfully!");
        } catch (error) {
            console.error("Error approving event:", error);
            alert("Failed to approve event.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async (eventId) => {
        if (!rejectionReason.trim()) {
            alert("Please provide a reason for rejection.");
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
                await sendEventRejectionEmail(
                    selectedEvent.organizerEmail,
                    selectedEvent.organizerName || 'Organizer',
                    selectedEvent.eventTitle || selectedEvent.title,
                    rejectionReason
                );
            }

            setSelectedEvent(null);
            setRejectMode(false);
            setRejectionReason('');
            await fetchPendingEvents();
            alert("Event rejected.");
        } catch (error) {
            console.error("Error rejecting event:", error);
            alert("Failed to reject event.");
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 font-mono text-sm text-black">
            {/* Header */}
            <div className="bg-black text-white p-4 border-b-4 border-gray-400 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <Link to="/admin/dashboard" className="w-8 h-8 bg-gray-700 flex items-center justify-center font-black text-white border border-gray-500 hover:bg-red-600 transition-colors">&larr;</Link>
                    <span className="font-bold uppercase tracking-widest">Event Approvals</span>
                </div>
                <div className="text-xs font-bold text-yellow-400">Queue: {events.length} Pending</div>
            </div>

            {/* Mobile View Toggle Logic */}
            <div className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 relative">

                {/* List Column */}
                <div className={`lg:col-span-1 space-y-4 ${selectedEvent ? 'hidden lg:block' : 'block'}`}>
                    <h2 className="lg:hidden text-xl font-black uppercase mb-4">Pending Events</h2>
                    {loading ? (
                        <p className="animate-pulse font-black uppercase text-gray-400">Loading queue...</p>
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

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 border-b-2 border-gray-200 pb-6">
                                <div>
                                    <span className="block text-[10px] font-bold uppercase text-gray-500">Organizer</span>
                                    <span className="text-lg font-bold">{selectedEvent.organizerName || selectedEvent.organizer}</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] font-bold uppercase text-gray-500">Scheduled Date</span>
                                    <span className="text-lg font-bold">{selectedEvent.startDate || selectedEvent.date}</span>
                                </div>
                            </div>

                            <div className="mb-8">
                                <span className="block text-[10px] font-bold uppercase text-gray-500 mb-2">Description</span>
                                <div className="bg-gray-100 p-4 border-2 border-gray-300 font-medium text-sm max-h-60 overflow-y-auto">
                                    {selectedEvent.description || 'No description provided.'}
                                </div>
                            </div>

                            {/* Actions */}
                            {!rejectMode ? (
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button
                                        onClick={() => handleApprove(selectedEvent.id)}
                                        disabled={actionLoading}
                                        className="flex-1 py-4 bg-green-600 text-white font-black uppercase border-2 border-black hover:bg-green-500 shadow-[4px_4px_0_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_black] transition-all disabled:opacity-50"
                                    >
                                        {actionLoading ? 'Processing...' : 'Approve Event'}
                                    </button>
                                    <button
                                        onClick={() => setRejectMode(true)}
                                        disabled={actionLoading}
                                        className="flex-1 py-4 bg-red-600 text-white font-black uppercase border-2 border-black hover:bg-red-500 shadow-[4px_4px_0_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_black] transition-all disabled:opacity-50"
                                    >
                                        Reject...
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-red-50 p-4 border-4 border-black animate-fade-in-up">
                                    <h4 className="font-black uppercase text-red-600 mb-2">Reason for Rejection</h4>
                                    <textarea
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        className="w-full border-2 border-black p-2 mb-4 font-bold outline-none focus:bg-white"
                                        rows="3"
                                        placeholder="Violation of content policy..."
                                    ></textarea>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleReject(selectedEvent.id)}
                                            disabled={actionLoading}
                                            className="px-4 py-2 bg-red-600 text-white font-black uppercase border-2 border-black hover:bg-red-500 disabled:opacity-50"
                                        >
                                            {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
                                        </button>
                                        <button
                                            onClick={() => { setRejectMode(false); setRejectionReason(''); }}
                                            disabled={actionLoading}
                                            className="px-4 py-2 bg-gray-200 text-black font-black uppercase border-2 border-black hover:bg-gray-300"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                        </div>
                    ) : (
                        <div className="h-full hidden lg:flex items-center justify-center border-4 border-dashed border-gray-300 text-gray-400 font-bold uppercase min-h-[400px]">
                            Select an event to review
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminEventApproval;
