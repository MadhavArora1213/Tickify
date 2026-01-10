import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import toast from 'react-hot-toast';

const FeaturedEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const isRegistrationClosed = (event) => {
        if (!event.registrationEndDate) return false;
        const now = new Date();
        const endDate = new Date(`${event.registrationEndDate}T${event.registrationEndTime || '23:59'}`);
        return now > endDate;
    };

    useEffect(() => {
        const fetchFeaturedEvents = async () => {
            try {
                setLoading(true);
                const eventsRef = collection(db, 'events');
                // Fetch published events, limit to 4 for "Featured"
                const q = query(eventsRef, where('status', '==', 'published'), limit(10));
                const querySnapshot = await getDocs(q);

                const fetchedEvents = querySnapshot.docs.map(doc => {
                    const data = doc.data();

                    // Calculate starting price
                    let startingPrice = data.price;
                    if (!startingPrice && data.tickets && Array.isArray(data.tickets) && data.tickets.length > 0) {
                        const prices = data.tickets.map(t => Number(t.price) || 0);
                        startingPrice = Math.min(...prices);
                    }

                    return {
                        id: doc.id,
                        ...data,
                        title: data.eventTitle || data.title,
                        image: data.bannerUrl || data.image,
                        date: data.startDate || data.date,
                        location: data.city ? `${data.venueName ? data.venueName + ', ' : ''}${data.city}` : data.location,
                        price: startingPrice
                    };
                });

                // Filter out closed registrations and limit to 4
                const activeFeatured = fetchedEvents
                    .filter(event => !isRegistrationClosed(event))
                    .slice(0, 4);

                setEvents(activeFeatured);
            } catch (error) {
                toast.error("Error fetching featured events");
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedEvents();
    }, []);

    if (loading) {
        return (
            <section className="container mx-auto px-4 mb-24 min-h-[400px] flex items-center justify-center">
                <p className="font-black uppercase text-gray-400 animate-pulse">Loading Featured Events...</p>
            </section>
        );
    }

    if (events.length === 0) return null;

    return (
        <section className="container mx-auto px-4 mb-24">
            <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
                <div>
                    <h2 className="text-4xl md:text-5xl font-black mb-2 uppercase">
                        <span className="block dark:hidden" style={{ WebkitTextStroke: '2px black', color: 'white', textShadow: '4px 4px 0px #000' }}>Featured Events</span>
                        <span className="hidden dark:block drop-shadow-[4px_4px_0_var(--color-accent-primary)]">Featured Events</span>
                    </h2>
                    <p className="text-[var(--color-text-secondary)] font-bold text-lg border-l-4 border-[var(--color-accent-primary)] pl-4">Curated picks just for you.</p>
                </div>
                <Link to="/events" className="hidden md:block neo-btn px-6 py-2 bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] text-sm hover:bg-[var(--color-accent-primary)] hover:text-white transition-colors uppercase font-black">VIEW ALL EVENTS -&gt;</Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {events.map(event => (
                    <Link
                        key={event.id}
                        to={`/events/${event.id}`}
                        className="group relative flex flex-col h-[420px] border-4 border-black bg-white rounded-xl overflow-hidden shadow-[8px_8px_0_black] transition-all hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[12px_12px_0_black]"
                    >
                        {/* Image Section */}
                        <div className="h-56 overflow-hidden relative border-b-4 border-black bg-gray-100">
                            <img
                                src={event.image || `https://placehold.co/400x500/1e293b/ffffff?text=${event.title.charAt(0)}`}
                                alt={event.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute top-2 right-2 bg-[var(--color-accent-secondary)] text-white text-xs font-black uppercase px-2 py-1 border-2 border-black rotate-3">
                                {event.category || 'Event'}
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="p-4 flex-1 flex flex-col bg-[var(--color-bg-surface)]">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-black uppercase tracking-wider text-[var(--color-text-muted)]">{event.date}</span>
                                <span className="text-sm font-black bg-[var(--color-accent-primary)] text-white px-2 py-0.5 rounded-sm border border-black transform -rotate-2">
                                    {event.price ? (typeof event.price === 'number' ? `₹${event.price}` : event.price) : 'Free'}
                                </span>
                            </div>

                            <h3 className="text-xl font-black mb-2 leading-tight uppercase text-[var(--color-text-primary)] line-clamp-2">{event.title}</h3>
                            <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2 mb-4 font-medium border-l-2 border-[var(--color-accent-primary)] pl-2">
                                {event.eventDescription || event.description}
                            </p>

                            <div className="mt-auto flex items-center text-xs font-bold text-[var(--color-text-muted)] uppercase">
                                <svg className="w-4 h-4 mr-1 text-[var(--color-accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                                {event.location}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
            <div className="mt-8 text-center md:hidden">
                <Link to="/events" className="neo-btn px-6 py-3 bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] font-black uppercase">VIEW ALL EVENTS -&gt;</Link>
            </div>
        </section>
    );
};

export default FeaturedEvents;
