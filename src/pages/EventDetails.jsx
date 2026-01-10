import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ShinyText from '../components/react-bits/ShinyText';
import SpotlightCard from '../components/react-bits/SpotlightCard';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [ticketQuantity, setTicketQuantity] = useState(1);
    const [selectedTicket, setSelectedTicket] = useState(null); // Changed default to null or first ticket after load

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                setLoading(true);
                const docRef = doc(db, 'events', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists() && docSnap.data().status === 'published') {
                    const data = docSnap.data();

                    let organizerName = 'Tickify Organizer';
                    if (data.organizerId) {
                        try {
                            const orgRef = doc(db, 'organizers', data.organizerId);
                            const orgSnap = await getDoc(orgRef);
                            if (orgSnap.exists()) {
                                organizerName = orgSnap.data().name || orgSnap.data().organizerName || organizerName;
                            }
                        } catch (err) {
                            console.error("Error fetching organizer details:", err);
                        }
                    }

                    const eventData = {
                        id: docSnap.id,
                        ...data,
                        title: data.eventTitle || data.title,
                        description: data.eventDescription || data.description,
                        image: data.bannerUrl || data.image,
                        date: data.startDate || data.date,
                        time: data.startTime || data.time,
                        location: data.venueName ? `${data.venueName}, ${data.city}` : (data.location || data.city || 'Online'),
                        organizer: organizerName,
                        tickets: (data.tickets || []).map(t => ({
                            ...t,
                            features: Array.isArray(t.features) ? t.features : (t.description ? [t.description] : [])
                        }))
                    };
                    setEvent(eventData);

                    // Select first ticket type by default if available
                    if (eventData.tickets && eventData.tickets.length > 0) {
                        setSelectedTicket(eventData.tickets[0].id || 0); // Use index 0 if id missing
                    }
                } else {
                    console.log("No such event!");
                    setEvent(null);
                }
            } catch (error) {
                console.error("Error fetching event:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvent();
    }, [id]);

    const handleQuantityChange = (delta) => {
        setTicketQuantity(Math.max(1, ticketQuantity + delta));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--color-bg-primary)] pt-36 pb-20 flex justify-center items-center">
                <div className="text-xl font-bold text-[var(--color-text-primary)]">Loading Event Details...</div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen bg-[var(--color-bg-primary)] pt-36 pb-20 flex justify-center items-center">
                <div className="text-xl font-bold text-[var(--color-text-primary)]">Event not found.</div>
            </div>
        );
    }

    const currentTicketPrice = event.tickets?.find((t, index) => (t.id || index) === selectedTicket)?.price || 0;
    const totalPrice = currentTicketPrice * ticketQuantity;

    const isRegistrationClosed = event ? (() => {
        if (!event.registrationEndDate) return false;
        const now = new Date();
        const endDate = new Date(`${event.registrationEndDate}T${event.registrationEndTime || '23:59'}`);
        return now > endDate;
    })() : false;

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] pb-20 pt-24 md:pt-36">
            {/* Banner */}
            <div className="relative w-full mx-auto container px-4 mb-8">
                <div className={`w-full h-auto md:aspect-[21/9] rounded-3xl overflow-hidden border-4 border-black shadow-[12px_12px_0_black] relative group bg-black flex flex-col md:block ${isRegistrationClosed ? 'grayscale' : ''}`}>
                    {/* Image Container */}
                    <div className="w-full aspect-video md:w-full md:h-full md:absolute md:inset-0 bg-black">
                        <img
                            src={event.image || "https://via.placeholder.com/1200x600?text=No+Image"}
                            alt={event.title}
                            className="w-full h-full object-contain"
                        />
                    </div>

                    {isRegistrationClosed && (
                        <div className="absolute inset-0 bg-black/40 z-30 flex items-center justify-center p-4">
                            <div className="bg-red-500 text-white font-black text-2xl md:text-5xl border-4 border-white shadow-[8px_8px_0_black] px-8 py-4 -rotate-3 uppercase flex flex-col items-center gap-2">
                                <span>🚫 Registration Closed</span>
                                <span className="text-sm md:text-lg opacity-90">This event is no longer accepting new bookings</span>
                            </div>
                        </div>
                    )}

                    {/* Content (Stacked on mobile, Overlay on desktop) */}
                    <div className="relative md:absolute bottom-0 left-0 w-full z-20 p-6 md:p-8 bg-black md:bg-gradient-to-t md:from-black md:via-black/80 md:to-transparent border-t-2 md:border-t-0 border-[var(--color-bg-secondary)] md:border-none">
                        <div className="max-w-4xl">
                            <span className="inline-block px-3 py-1 md:px-4 md:py-2 bg-[var(--color-accent-primary)] text-white text-xs md:text-sm font-black uppercase tracking-wider border-2 border-white shadow-[2px_2px_0_white] md:shadow-[4px_4px_0_white] mb-3 md:mb-4 transform -rotate-2">
                                {event.category || 'Event'}
                            </span>
                            <h1 className="text-2xl md:text-5xl lg:text-6xl font-black text-white mb-3 md:mb-4 uppercase drop-shadow-[2px_2px_0_black] md:drop-shadow-[4px_4px_0_black] break-words leading-tight">
                                {event.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-3 md:gap-6 text-white font-bold text-xs md:text-lg">
                                <div className="flex items-center gap-2 bg-white/10 md:bg-black/50 px-3 py-1.5 md:px-3 md:py-1 rounded border border-white/30 md:border-white/50">
                                    <svg className="w-4 h-4 md:w-5 md:h-5 text-[var(--color-accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                    {event.date}
                                </div>
                                {event.time && (
                                    <div className="flex items-center gap-2 bg-white/10 md:bg-black/50 px-3 py-1.5 md:px-3 md:py-1 rounded border border-white/30 md:border-white/50">
                                        <svg className="w-4 h-4 md:w-5 md:h-5 text-[var(--color-accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        {event.time}
                                    </div>
                                )}
                                <div className="flex items-center gap-2 bg-white/10 md:bg-black/50 px-3 py-1.5 md:px-3 md:py-1 rounded border border-white/30 md:border-white/50">
                                    <svg className="w-4 h-4 md:w-5 md:h-5 text-[var(--color-accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                    {event.location}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-4 relative z-30">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Content */}
                    <div className="flex-1 space-y-8">
                        {/* Description */}
                        <div className="neo-card bg-[var(--color-bg-surface)] p-8">
                            <h2 className="text-2xl font-black text-[var(--color-text-primary)] mb-4 uppercase decoration-4 underline decoration-[var(--color-accent-secondary)]">
                                <span className="block dark:hidden" style={{ WebkitTextStroke: '1px black', color: 'white', textShadow: '2px 2px 0px #000' }}>About the Event</span>
                                <span className="hidden dark:block">About the Event</span>
                            </h2>
                            <p className="text-[var(--color-text-secondary)] leading-relaxed text-lg font-medium">
                                {event.description}
                            </p>
                        </div>

                        {/* Lineup */}
                        {event.lineup && event.lineup.length > 0 && (
                            <div className="neo-card bg-[var(--color-bg-surface)] p-8">
                                <h2 className="text-2xl font-black text-[var(--color-text-primary)] mb-6 uppercase decoration-4 underline decoration-[var(--color-accent-secondary)]">
                                    <span className="block dark:hidden" style={{ WebkitTextStroke: '1px black', color: 'white', textShadow: '2px 2px 0px #000' }}>The Lineup</span>
                                    <span className="hidden dark:block">The Lineup</span>
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    {event.lineup.map((artist, idx) => (
                                        <div key={idx} className="neo-card bg-[var(--color-bg-secondary)] p-4 text-center hover:scale-105 transition-transform flex flex-col items-center">
                                            <div className="w-20 h-20 rounded-full border-4 border-black bg-[var(--color-accent-primary)] mb-3 flex items-center justify-center text-3xl shadow-[4px_4px_0_black]">
                                                😎
                                            </div>
                                            <span className="font-black text-[var(--color-text-primary)] text-lg uppercase">{artist}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Organizer */}
                        <div className="neo-card bg-[var(--color-bg-surface)] p-8 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-black text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">Organizer</h3>
                                <p className="text-2xl font-black text-[var(--color-text-primary)]">{event.organizer || "Unknown Organizer"}</p>
                            </div>
                            <button
                                onClick={() => {
                                    if (event.organizerId) {
                                        navigate(`/organizer-public/${event.organizerId}`);
                                    } else {
                                        alert("Organizer profile is private or not linked.");
                                    }
                                }}
                                className="neo-btn px-6 py-3 bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] text-sm"
                            >
                                View Profile
                            </button>
                        </div>
                    </div>

                    {/* Booking Sidebar */}
                    <div className="w-full lg:w-[400px] flex-shrink-0">
                        <div className="sticky top-24">
                            <div className="neo-card bg-[var(--color-bg-surface)] p-8 border-4 border-[var(--color-accent-primary)] shadow-[12px_12px_0_rgba(0,0,0,1)]">
                                <h3 className="text-2xl font-black text-[var(--color-text-primary)] mb-6 uppercase">
                                    <span className="block dark:hidden" style={{ WebkitTextStroke: '1px black', color: 'white', textShadow: '2px 2px 0px #000' }}>Get Tickets</span>
                                    <span className="hidden dark:block">Get Tickets</span>
                                </h3>

                                {event.tickets && event.tickets.length > 0 ? (
                                    <>
                                        <div className="space-y-4 mb-8">
                                            {event.tickets.map((ticket, index) => (
                                                <div
                                                    key={ticket.id || index}
                                                    onClick={() => setSelectedTicket(ticket.id || index)}
                                                    className={`cursor-pointer rounded-xl p-4 border-4 transition-all ${(selectedTicket === (ticket.id || index)) ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10 shadow-[4px_4px_0_var(--color-accent-primary)] translate-x-[-2px] translate-y-[-2px]' : 'border-[var(--color-neutral-200)] hover:border-black hover:shadow-[4px_4px_0_black]'}`}
                                                >
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className={`font-black uppercase ${(selectedTicket === (ticket.id || index)) ? 'text-[var(--color-accent-primary)]' : 'text-[var(--color-text-primary)]'}`}>{ticket.name}</span>
                                                        <span className="text-xl font-black text-[var(--color-text-primary)]">₹{ticket.price}</span>
                                                    </div>
                                                    {ticket.features && (
                                                        <ul className="text-xs font-bold text-[var(--color-text-muted)] space-y-1">
                                                            {ticket.features.map((f, i) => (
                                                                <li key={i} className="flex items-center gap-2">
                                                                    <span className="text-green-500 text-lg">✓</span>
                                                                    {f}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex items-center justify-between mb-8 pb-8 border-b-4 border-dashed border-[var(--color-neutral-200)]">
                                            <span className="font-black text-[var(--color-text-primary)] uppercase">Quantity</span>
                                            <div className="flex items-center gap-4 bg-[var(--color-bg-secondary)] rounded p-2 border-2 border-black shadow-[2px_2px_0_black]">
                                                <button
                                                    onClick={() => handleQuantityChange(-1)}
                                                    className="w-8 h-8 flex items-center justify-center font-black hover:bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] rounded"
                                                >
                                                    -
                                                </button>
                                                <span className="font-black w-6 text-center text-[var(--color-text-primary)] text-xl">{ticketQuantity}</span>
                                                <button
                                                    onClick={() => handleQuantityChange(1)}
                                                    className="w-8 h-8 flex items-center justify-center font-black hover:bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] rounded"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center text-xl font-black uppercase">
                                                <span className="text-[var(--color-text-secondary)]">Total</span>
                                                <span className="text-3xl text-[var(--color-text-primary)]">₹{totalPrice}</span>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    if (isRegistrationClosed) return;
                                                    if (event.seatingType === 'Reserved' || (event.seatingGrid && event.seatingGrid.length > 0)) {
                                                        navigate(`/events/${event.id}/seats`);
                                                    } else {
                                                        const ticket = event.tickets.find((t, idx) => (t.id || idx) === selectedTicket);
                                                        navigate('/checkout', {
                                                            state: {
                                                                event: event,
                                                                items: [{
                                                                    ...ticket,
                                                                    quantity: ticketQuantity,
                                                                    totalPrice: totalPrice // Use the calculated total price
                                                                }]
                                                            }
                                                        });
                                                    }
                                                }}
                                                disabled={isRegistrationClosed}
                                                className={`w-full py-4 text-white text-xl shadow-[6px_6px_0_black] transition-all
                                                    ${isRegistrationClosed
                                                        ? 'bg-gray-400 cursor-not-allowed grayscale'
                                                        : 'bg-[var(--color-accent-primary)] hover:shadow-[8px_8px_0_black] hover:translate-x-[-2px] hover:translate-y-[-2px] active:shadow-[0_0_0_black] active:translate-x-[0] active:translate-y-[0]'
                                                    }`}
                                            >
                                                {isRegistrationClosed ? 'REGISTRATION CLOSED' : 'CHECKOUT NOW ->'}
                                            </button>
                                            <p className="text-xs text-center font-bold text-[var(--color-text-muted)] mt-2">
                                                POWERED BY TICKIFY
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center p-4">
                                        <p className="font-bold text-lg">Tickets not available</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetails;
