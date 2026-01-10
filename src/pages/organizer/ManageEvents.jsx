import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

const ManageEvents = () => {
    const { currentUser } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchEvents = async () => {
            if (!currentUser) return;
            try {
                setLoading(true);
                const eventsRef = collection(db, 'events');
                const q = query(eventsRef, where('organizerId', '==', currentUser.uid));
                const querySnapshot = await getDocs(q);

                const fetchedEvents = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    title: doc.data().eventTitle || doc.data().title,
                    date: doc.data().startDate || doc.data().date,
                    status: doc.data().status || doc.data().approvalStatus || 'pending'
                }));

                setEvents(fetchedEvents);
            } catch (error) {
                toast.error("Error fetching events");
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [currentUser]);

    const isRegistrationClosed = (event) => {
        if (!event.registrationEndDate) return false;
        const now = new Date();
        const endDate = new Date(`${event.registrationEndDate}T${event.registrationEndTime || '23:59'}`);
        return now > endDate;
    };

    const handleDelete = async (eventId) => {
        if (!window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) return;
        try {
            await deleteDoc(doc(db, 'events', eventId));
            setEvents(events.filter(e => e.id !== eventId));
            toast.success("Event deleted successfully.");
        } catch (error) {
            toast.error("Failed to delete event.");
        }
    };

    const filteredEvents = events.filter(e => {
        const matchesFilter = filter === 'all' || e.status === filter;
        const matchesSearch = e.title?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'published':
            case 'active':
                return 'bg-green-100 text-green-800 border-green-800';
            case 'pending':
            case 'pending_approval':
                return 'bg-yellow-100 text-yellow-800 border-yellow-800';
            case 'rejected':
                return 'bg-red-100 text-red-800 border-red-800';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] pt-24 pb-12">
            <div className="container mx-auto px-4">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
                    <div>
                        <Link to="/organizer/dashboard" className="text-xs font-black uppercase underline text-[var(--color-text-secondary)] mb-2 inline-block">&larr; Dashboard</Link>
                        <h1 className="text-4xl md:text-5xl font-black uppercase text-[var(--color-text-primary)]">Manage Events</h1>
                    </div>
                    <Link to="/organizer/events/create" className="neo-btn bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] px-6 py-3 font-black uppercase shadow-[4px_4px_0_var(--color-text-secondary)] hover:shadow-[6px_6px_0_var(--color-text-primary)] hover:translate-x-[-2px] hover:translate-y-[-2px]">
                        Create New Event +
                    </Link>
                </div>

                {/* Filters */}
                <div className="neo-card bg-[var(--color-bg-surface)] border-4 border-[var(--color-text-primary)] p-4 mb-8 flex flex-col md:flex-row gap-4 justify-between items-center shadow-[8px_8px_0_var(--color-text-primary)]">
                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        {['all', 'published', 'pending', 'rejected'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 font-black uppercase border-2 transition-all
                                ${filter === f
                                        ? 'bg-[var(--color-accent-primary)] text-white border-black shadow-[2px_2px_0_black]'
                                        : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] border-[var(--color-text-primary)] hover:bg-[var(--color-text-primary)] hover:text-[var(--color-bg-primary)]'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                    <div className="w-full md:w-64 relative">
                        <input
                            type="text"
                            placeholder="Search events..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] pl-10 pr-4 py-2 font-bold text-[var(--color-text-primary)]"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">🔍</span>
                    </div>
                </div>

                {/* Events List */}
                <div className="grid grid-cols-1 gap-6">
                    {loading ? (
                        <div className="text-center py-20 uppercase font-black animate-pulse">Loading your events...</div>
                    ) : filteredEvents.map(event => (
                        <div key={event.id} className="neo-card bg-[var(--color-bg-surface)] border-4 border-[var(--color-text-primary)] p-6 shadow-[6px_6px_0_var(--color-text-primary)] flex flex-col md:flex-row justify-between items-center gap-6 group hover:translate-x-1 transition-transform">

                            {/* Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                    <span className={`text-[10px] font-black uppercase px-2 py-1 border-2 rounded ${getStatusColor(event.status)}`}>
                                        {event.status}
                                    </span>
                                    {isRegistrationClosed(event) && (
                                        <span className="text-[10px] font-black uppercase px-2 py-1 border-2 border-black bg-red-100 text-red-800 animate-pulse">
                                            Registration Closed
                                        </span>
                                    )}
                                    <span className="text-xs font-bold text-[var(--color-text-secondary)]">{event.date}</span>
                                </div>
                                <h3 className="text-2xl font-black uppercase text-[var(--color-text-primary)] leading-none">{event.title}</h3>
                                <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase">{event.id}</p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 w-full md:w-auto">
                                <Link to={`/organizer/events/${event.id}/edit`} className="flex-1 md:flex-none neo-btn bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] p-3 hover:bg-[var(--color-text-primary)] hover:text-white transition-colors flex items-center justify-center" title="Edit">
                                    ✏️
                                </Link>
                                <Link to={`/organizer/events/${event.id}/analytics`} className="flex-1 md:flex-none neo-btn bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] p-3 hover:bg-[var(--color-text-primary)] hover:text-white transition-colors flex items-center justify-center" title="Analytics">
                                    📊
                                </Link>
                                <button
                                    onClick={() => handleDelete(event.id)}
                                    className="flex-1 md:flex-none neo-btn bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] p-3 hover:bg-red-600 hover:text-white hover:border-black transition-colors flex items-center justify-center"
                                    title="Delete"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}

                    {!loading && filteredEvents.length === 0 && (
                        <div className="text-center py-20 neo-card bg-[var(--color-bg-surface)] border-4 border-dashed border-[var(--color-text-secondary)]">
                            <span className="text-4xl block mb-4">🌪️</span>
                            <p className="font-black text-xl text-[var(--color-text-primary)] uppercase">No events found</p>
                            <p className="font-bold text-[var(--color-text-secondary)]">Try adjusting your search or filters.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ManageEvents;
