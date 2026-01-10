import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ShinyText from '../components/react-bits/ShinyText';
import SpotlightCard from '../components/react-bits/SpotlightCard';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import toast from 'react-hot-toast';

const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
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
                            // Fail silently for organizer fetch
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
                    setEvent(null);
                }
            } catch (error) {
                toast.error("Error fetching event details");
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
        <div className="min-h-screen bg-[var(--color-bg-primary)] pb-32 pt-24 md:pt-36 relative overflow-hidden">
            {/* Background Ornaments */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-accent-primary)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--color-accent-secondary)]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

            <div className="container mx-auto px-4 relative z-10">
                {/* Hero Layout */}
                <div className="flex flex-col lg:flex-row gap-12 mb-16">
                    {/* Left: Content & Visuals */}
                    <div className="flex-1">
                        {/* Breadcrumbs */}
                        <div className="flex items-center gap-2 mb-8 text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)]">
                            <Link to="/" className="hover:text-[var(--color-accent-primary)] transition-colors">Home</Link>
                            <span>/</span>
                            <Link to="/events" className="hover:text-[var(--color-accent-primary)] transition-colors">Events</Link>
                            <span>/</span>
                            <span className="text-[var(--color-text-primary)]">{event.title}</span>
                        </div>

                        {/* Title & Chips */}
                        <div className="mb-10">
                            <div className="flex flex-wrap gap-3 mb-6">
                                <span className="bg-yellow-400 text-black px-4 py-1.5 border-2 border-black font-black uppercase text-xs shadow-[2px_2px_0_black] -rotate-2">
                                    {event.category || 'Featured'}
                                </span>
                                {event.isVerified && (
                                    <span className="bg-blue-500 text-white px-4 py-1.5 border-2 border-black font-black uppercase text-xs shadow-[2px_2px_0_black] rotate-1 flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path></svg>
                                        Verified Event
                                    </span>
                                )}
                            </div>
                            <h1 className="text-4xl md:text-7xl font-black text-[var(--color-text-primary)] uppercase leading-[0.9] tracking-tighter mb-8 max-w-4xl italic">
                                {event.title}
                            </h1>

                            {/* Main Visual */}
                            <div className="neo-card w-full aspect-video md:aspect-[21/9] bg-black overflow-hidden border-4 border-black shadow-[16px_16px_0_black] relative mb-12 transform hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all group">
                                <img
                                    src={event.image || "https://via.placeholder.com/1200x600?text=No+Image"}
                                    alt={event.title}
                                    className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                                />
                                {isRegistrationClosed && (
                                    <div className="absolute inset-0 bg-black/60 z-30 flex items-center justify-center p-4">
                                        <div className="bg-red-500 text-white font-black text-2xl md:text-4xl border-4 border-white shadow-[8px_8px_0_black] px-8 py-4 -rotate-3 uppercase">
                                            SOLD OUT
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Info Bar */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                                <div className="neo-card bg-[var(--color-bg-surface)] p-6 border-2 border-[var(--color-text-primary)] shadow-[4px_4px_0_var(--color-text-primary)] flex items-center gap-4">
                                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center border-2 border-[var(--color-text-primary)] rounded shadow-[2px_2px_0_var(--color-text-primary)]">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-[var(--color-text-muted)]">Date</p>
                                        <p className="font-black uppercase text-sm text-[var(--color-text-primary)]">{event.date}</p>
                                    </div>
                                </div>
                                <div className="neo-card bg-[var(--color-bg-surface)] p-6 border-2 border-[var(--color-text-primary)] shadow-[4px_4px_0_var(--color-text-primary)] flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center border-2 border-[var(--color-text-primary)] rounded shadow-[2px_2px_0_var(--color-text-primary)]">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-[var(--color-text-muted)]">Time</p>
                                        <p className="font-black uppercase text-sm text-[var(--color-text-primary)]">{event.time || 'TBA'}</p>
                                    </div>
                                </div>
                                <div className="neo-card bg-[var(--color-bg-surface)] p-6 border-2 border-[var(--color-text-primary)] shadow-[4px_4px_0_var(--color-text-primary)] flex items-center gap-4">
                                    <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center border-2 border-[var(--color-text-primary)] rounded shadow-[2px_2px_0_var(--color-text-primary)]">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-[var(--color-text-muted)]">Location</p>
                                        <p className="font-black uppercase text-sm line-clamp-1 text-[var(--color-text-primary)]">{event.location}</p>
                                    </div>
                                </div>
                            </div>

                            {/* About */}
                            <div className="prose prose-xl max-w-none">
                                <h2 className="text-3xl font-black uppercase italic mb-6 border-b-8 border-yellow-200 inline-block">The Details</h2>
                                <p className="text-xl leading-relaxed text-[var(--color-text-secondary)] font-medium whitespace-pre-line mb-12">
                                    {event.description}
                                </p>
                            </div>

                            {/* Lineup Section */}
                            {event.lineup && event.lineup.length > 0 && (
                                <div className="mb-16">
                                    <h2 className="text-3xl font-black uppercase italic mb-8 border-b-8 border-blue-200 inline-block">On the stage</h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {event.lineup.map((artist, idx) => (
                                            <div key={idx} className="neo-card bg-[var(--color-bg-surface)] p-6 border-2 border-[var(--color-text-primary)] shadow-[6px_6px_0_var(--color-text-primary)] flex items-center gap-4 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0_var(--color-text-primary)] transition-all cursor-crosshair">
                                                <div className="w-14 h-14 bg-[var(--color-text-primary)] flex items-center justify-center text-[var(--color-bg-primary)] font-black text-2xl rotate-3">
                                                    {artist.charAt(0)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-black uppercase text-lg leading-none text-[var(--color-text-primary)]">{artist}</span>
                                                    <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase mt-1 tracking-widest">Special Guest</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Organizer Profile Summary */}
                            <div className="neo-card bg-[var(--color-bg-surface)] p-8 border-2 border-black shadow-[4px_4px_0_black] flex flex-col md:flex-row justify-between items-center gap-6">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-full border-2 border-black bg-[var(--color-accent-secondary)] flex items-center justify-center text-white text-3xl shadow-[4px_4px_0_black]">
                                        🎭
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Presented By</h3>
                                        <p className="text-2xl font-black text-[var(--color-text-primary)] uppercase">{event.organizer}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => event.organizerId && navigate(`/organizer-public/${event.organizerId}`)}
                                    className="neo-btn px-8 py-3 bg-black text-white text-sm font-black uppercase hover:shadow-[4px_4px_0_var(--color-accent-primary)] transition-all"
                                >
                                    Explore Profile
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right: Booking Sidebar (Sticky) */}
                    <div className="w-full lg:w-[450px]">
                        <div className="sticky top-28">
                            <div className="neo-card bg-[var(--color-bg-surface)] p-8 border-4 border-[var(--color-text-primary)] shadow-[16px_16px_0_var(--color-text-primary)] relative mb-8">
                                {/* Top Label */}
                                <div className="absolute top-0 right-10 -translate-y-1/2 bg-[var(--color-accent-secondary)] text-white px-4 py-1.5 border-2 border-[var(--color-text-primary)] font-black uppercase text-xs shadow-[4px_4px_0_var(--color-text-primary)] rotate-2">
                                    Official Tickets
                                </div>

                                <h3 className="text-3xl font-black text-[var(--color-text-primary)] mb-10 uppercase italic tracking-tighter decoration-8 underline decoration-yellow-300">
                                    Grab Your Pass
                                </h3>

                                {event.tickets && event.tickets.length > 0 ? (
                                    <>
                                        <div className="space-y-4 mb-10">
                                            {event.tickets.map((ticket, index) => (
                                                <div
                                                    key={ticket.id || index}
                                                    onClick={() => setSelectedTicket(ticket.id || index)}
                                                    className={`cursor-pointer border-4 p-6 transition-all group relative overflow-hidden
                                                        ${(selectedTicket === (ticket.id || index))
                                                            ? 'border-black bg-yellow-50 shadow-[4px_4px_0_black] translate-x-[-2px] translate-y-[-2px]'
                                                            : 'border-transparent bg-gray-50 hover:bg-white hover:border-black'}`}
                                                >
                                                    {/* Selection Indicator */}
                                                    {(selectedTicket === (ticket.id || index)) && (
                                                        <div className="absolute top-0 right-0 w-12 h-12 bg-black flex items-center justify-center translate-x-6 -translate-y-6 rotate-45">
                                                            <svg className="w-4 h-4 text-white -rotate-45 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>
                                                        </div>
                                                    )}

                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <span className="block font-black uppercase text-xl text-black">{ticket.name}</span>
                                                            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest italic">{ticket.description || 'Access All Areas'}</span>
                                                        </div>
                                                        <span className="text-3xl font-black text-black leading-none">₹{ticket.price}</span>
                                                    </div>

                                                    {ticket.features && ticket.features.length > 0 && (
                                                        <ul className="flex flex-wrap gap-2">
                                                            {ticket.features.slice(0, 3).map((f, i) => (
                                                                <li key={i} className="text-[9px] font-black uppercase bg-white border border-black px-2 py-0.5 rounded-full">
                                                                    • {f}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Quantity Selector */}
                                        <div className="flex items-center justify-between mb-10 pb-8 border-b-4 border-black border-dashed">
                                            <div>
                                                <span className="block font-black text-black uppercase text-sm tracking-widest">Quantity</span>
                                                <span className="text-[10px] font-black text-gray-400 uppercase">Limit 10 tickets</span>
                                            </div>
                                            <div className="flex items-center gap-4 bg-white border-4 border-black p-2 shadow-[4px_4px_0_black]">
                                                <button
                                                    onClick={() => handleQuantityChange(-1)}
                                                    className="w-10 h-10 flex items-center justify-center font-black hover:bg-black hover:text-white transition-all text-xl"
                                                >
                                                    -
                                                </button>
                                                <span className="font-black w-8 text-center text-2xl">{ticketQuantity}</span>
                                                <button
                                                    onClick={() => handleQuantityChange(1)}
                                                    className="w-10 h-10 flex items-center justify-center font-black hover:bg-black hover:text-white transition-all text-xl"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>

                                        {/* Checkout Section */}
                                        <div className="space-y-6">
                                            <div className="flex justify-between items-end mb-4 group cursor-help">
                                                <div className="font-black text-gray-400 uppercase text-xs">Final Price</div>
                                                <div className="text-5xl font-black text-black group-hover:text-[var(--color-accent-primary)] transition-colors">
                                                    ₹{totalPrice}
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    if (isRegistrationClosed) return;

                                                    if (!currentUser) {
                                                        toast((t) => (
                                                            <div className="flex flex-col gap-2 p-1">
                                                                <span className="font-black text-xs uppercase tracking-tight">Hold on! You need to login first.</span>
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={() => {
                                                                            toast.dismiss(t.id);
                                                                            navigate('/login', { state: { from: `/events/${event.id}` } });
                                                                        }}
                                                                        className="bg-black text-white px-4 py-2 text-[10px] font-black uppercase border-2 border-black shadow-[2px_2px_0_white]"
                                                                    >
                                                                        Login
                                                                    </button>
                                                                    <button
                                                                        onClick={() => toast.dismiss(t.id)}
                                                                        className="bg-white text-black px-4 py-2 text-[10px] font-black uppercase border-2 border-black"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ), {
                                                            duration: 4000,
                                                            position: 'top-center',
                                                            style: {
                                                                border: '4px solid black',
                                                                borderRadius: '0',
                                                                background: '#fff',
                                                                boxShadow: '8px 8px_0 black',
                                                                padding: '12px'
                                                            }
                                                        });
                                                        return;
                                                    }

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
                                                                    totalPrice: totalPrice
                                                                }]
                                                            }
                                                        });
                                                    }
                                                }}
                                                disabled={isRegistrationClosed}
                                                className={`w-full py-5 text-white text-2xl font-black italic shadow-[8px_8px_0_black] transition-all relative overflow-hidden group
                                                    ${isRegistrationClosed
                                                        ? 'bg-gray-400 cursor-not-allowed opacity-50'
                                                        : 'bg-[var(--color-accent-primary)] hover:shadow-[12px_12px_0_black] hover:translate-x-[-4px] hover:translate-y-[-4px] active:shadow-none active:translate-x-0 active:translate-y-0'
                                                    }`}
                                            >
                                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                                <span className="relative z-10 flex items-center justify-center gap-3">
                                                    {isRegistrationClosed ? 'REGISTRATION CLOSED' : (
                                                        <>CONFIRM BOOKING <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg></>
                                                    )}
                                                </span>
                                            </button>

                                            <div className="bg-yellow-100 p-4 border-2 border-black border-dashed flex items-start gap-3">
                                                <div className="text-xl">💡</div>
                                                <p className="text-[10px] font-bold text-gray-600 leading-tight">
                                                    Tickets are non-refundable but can be resold on our <Link to="/resell" className="text-blue-600 underline font-black">Marketplace</Link>.
                                                    VAT and Service fees apply at checkout.
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center p-12 bg-gray-50 border-4 border-black border-dashed">
                                        <div className="text-5xl mb-4">🎫</div>
                                        <p className="font-black uppercase text-gray-400">Inventory Empty</p>
                                        <p className="text-xs font-bold text-gray-400 mt-2">Check back later or contact organizer</p>
                                    </div>
                                )}
                            </div>

                            {/* Sticky Footer Message */}
                            <p className="text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                Verified & Secured Secure by Tickify API
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetails;
