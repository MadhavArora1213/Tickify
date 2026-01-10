import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';
import download from 'downloadjs';
import toast from 'react-hot-toast';

const PaymentSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { state } = location;
    const ticketRef = useRef(null);

    const [booking, setBooking] = useState(null);
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);

    const handleDownload = async () => {
        if (ticketRef.current === null) return;

        try {
            // Quality options for better capture
            const options = {
                cacheBust: true,
                pixelRatio: 3,
                backgroundColor: '#ffffff',
                style: {
                    transform: 'scale(1)',
                    margin: '0 auto',
                    width: '800px', // Force fixed horizontal width
                    padding: '20px' // Padding around the card to capture shadows
                }
            };

            const dataUrl = await toPng(ticketRef.current, options);
            download(dataUrl, `Tickify-Ticket-${booking?.bookingReference || 'Order'}.png`);
        } catch (err) {
            toast.error("Failed to download ticket. Please try again.");
        }
    };

    useEffect(() => {
        const fetchBookingDetails = async () => {
            if (!state || !state.bookingId) {
                setLoading(false);
                return;
            }

            try {
                const bookingRef = doc(db, 'bookings', state.bookingId);
                const bookingSnap = await getDoc(bookingRef);

                if (bookingSnap.exists()) {
                    const bookingData = bookingSnap.data();
                    setBooking({ id: bookingSnap.id, ...bookingData });

                    if (bookingData.eventId) {
                        const eventRef = doc(db, 'events', bookingData.eventId);
                        const eventSnap = await getDoc(eventRef);
                        if (eventSnap.exists()) {
                            const eventRaw = eventSnap.data();
                            const eventData = {
                                id: eventSnap.id,
                                ...eventRaw,
                                title: eventRaw.eventTitle || eventRaw.title || "Event Title",
                                date: eventRaw.startDate || eventRaw.date,
                                time: eventRaw.startTime || eventRaw.time,
                                location: eventRaw.venueName ? `${eventRaw.venueName}, ${eventRaw.city}` : (eventRaw.location || eventRaw.city || "Venue TBA"),
                                image: eventRaw.bannerUrl || eventRaw.image
                            };
                            setEvent(eventData);
                        } else {
                            // Link missing event doc? Try to use booking items info
                            setEvent({
                                title: bookingData.items?.[0]?.eventTitle || "Verified Event",
                                date: "Check Details",
                                location: "Verified Venue"
                            });
                        }
                    } else {
                        // Resale tickets might not have eventId but have items[0].eventTitle
                        setEvent({
                            title: bookingData.items?.[0]?.eventTitle || "Verified Event",
                            date: "Check Details",
                            location: "Verified Venue"
                        });
                    }
                }
            } catch (error) {
                toast.error("Error fetching booking details");
            } finally {
                setLoading(false);
            }
        };

        fetchBookingDetails();
    }, [state]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center">
                <div className="text-xl font-bold animate-pulse">Processing your ticket...</div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="min-h-screen bg-[var(--color-bg-primary)] pt-36 pb-20 flex items-center justify-center px-4">
                <div className="neo-card bg-[var(--color-bg-surface)] p-8 text-center border-4 border-black">
                    <h1 className="text-2xl font-black mb-4">Booking Not Found</h1>
                    <p className="mb-6">We couldn't retrieve your booking details. Please check 'My Tickets'.</p>
                    <Link to="/my-tickets" className="neo-btn bg-[var(--color-accent-primary)] text-white px-6 py-2">Go to My Tickets</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] pt-36 pb-20 flex items-center justify-center px-4">
            <div className="max-w-3xl w-full">
                {/* Success Card */}
                <div className="neo-card bg-[var(--color-bg-surface)] p-8 md:p-12 border-4 border-black shadow-[12px_12px_0_black] text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-4 bg-[var(--color-success)] border-b-2 border-black"></div>

                    <div className="w-24 h-24 bg-[var(--color-success)] rounded-full border-4 border-black flex items-center justify-center mx-auto mb-8 shadow-[6px_6px_0_black]">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black text-[var(--color-text-primary)] uppercase mb-4">
                        Payment Successful!
                    </h1>
                    <p className="text-[var(--color-text-secondary)] font-bold text-lg mb-8 max-w-lg mx-auto">
                        You're going to have a blast! A confirmation email has been sent to <span className="text-[var(--color-accent-primary)] underline decoration-2">{booking.userEmail}</span>.
                    </p>

                    {/* Horizontal Scroll Wrapper for Mobile View */}
                    <div className="overflow-x-auto pb-6 -mx-4 px-4 scrollbar-hide">
                        {/* Premium Horizontal ID Card Ticket */}
                        <div ref={ticketRef} className="min-w-[600px] md:min-w-0 max-w-3xl mx-auto bg-white border-4 border-black rounded-3xl shadow-[12px_12px_0_black] mb-10 overflow-hidden transition-transform duration-300">
                            <div className="flex flex-col md:flex-row h-full min-h-[320px]">
                                {/* Left Side: Event Image & Details */}
                                <div className="flex-[1.5] relative p-0 flex flex-col">
                                    <div className="h-32 w-full relative">
                                        <img
                                            src={event?.image || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80"}
                                            alt="Banner"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                                        <div className="absolute bottom-4 left-6">
                                            <h3 className="text-white font-black text-2xl uppercase tracking-tight drop-shadow-md">{event?.title}</h3>
                                        </div>
                                        <div className="absolute top-4 left-6">
                                            <span className="bg-white text-black text-[9px] font-black px-2 py-1 uppercase border-2 border-black shadow-[2px_2px_0_black]">
                                                {booking.items?.[0]?.ticketNumber || booking.bookingReference || "Official Pass"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-6 flex flex-col justify-between flex-1 bg-white">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <span className="text-[9px] font-black uppercase text-gray-400 block mb-0.5">Attendee</span>
                                                <p className="font-black text-sm uppercase truncate text-black">{booking.userName}</p>
                                            </div>
                                            <div>
                                                <span className="text-[9px] font-black uppercase text-gray-400 block mb-0.5">Ticket id</span>
                                                <p className="font-mono text-xs font-bold text-gray-800 uppercase">{booking.items?.[0]?.ticketNumber || booking.bookingReference}</p>
                                            </div>
                                            <div>
                                                <span className="text-[9px] font-black uppercase text-gray-400 block mb-0.5">Date & Time</span>
                                                <p className="font-black text-xs uppercase text-black">
                                                    {(() => {
                                                        if (!event?.date) return "TBA";
                                                        const date = event.date?.toDate ? event.date.toDate() : new Date(event.date);
                                                        return !isNaN(date.getTime()) ? date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : event.date;
                                                    })()} • {event?.time || 'TBA'}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-[9px] font-black uppercase text-gray-400 block mb-0.5">Venue</span>
                                                <p className="font-black text-xs uppercase truncate text-black">{event?.location || 'Venue TBA'}</p>
                                            </div>
                                        </div>

                                        {/* Seat/Ticket List */}
                                        <div className="mt-4 pt-4 border-t-2 border-dashed border-gray-100">
                                            <div className="flex flex-wrap gap-2">
                                                {booking.items?.map((item, idx) => (
                                                    <div key={idx} className="bg-black text-white px-3 py-1 text-[10px] font-black uppercase flex items-center gap-2">
                                                        <span>{item.name || item.ticketName}</span>
                                                        {item.label && <span className="bg-yellow-400 text-black px-1.5 rounded-sm">SEAT: {item.label}</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: QR Stub (Perforated Edge) */}
                                <div className="flex-1 bg-gray-50 border-t-4 md:border-t-0 md:border-l-4 border-dashed border-black p-6 flex flex-col items-center justify-center relative overflow-hidden">
                                    {/* Side notches for "Ticket Stub" look */}
                                    <div className="absolute top-[-10px] left-[-10px] w-5 h-5 bg-white border-2 border-black rounded-full hidden md:block"></div>
                                    <div className="absolute bottom-[-10px] left-[-10px] w-5 h-5 bg-white border-2 border-black rounded-full hidden md:block"></div>

                                    <div className="bg-white p-3 border-2 border-black shadow-[6px_6px_0_black] mb-4">
                                        <QRCodeSVG
                                            value={`${window.location.origin}/verify/${booking.id}`}
                                            size={120}
                                            level="H"
                                            includeMargin={false}
                                        />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-black mb-1">Scan for Verified Entry</p>
                                        <div className="bg-black text-white px-4 py-0.5 text-[8px] font-mono tracking-tighter rounded">
                                            {(booking.items?.[0]?.ticketNumber || booking.id).toUpperCase()}
                                        </div>
                                    </div>

                                    {/* Vertical text on side */}
                                    <div className="absolute right-2 top-1/2 -rotate-90 origin-right translate-y-1/2 opacity-10 font-black text-2xl whitespace-nowrap pointer-events-none">
                                        TICKIFY OFFICIAL PASS
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col md:flex-row gap-4 justify-center">
                        <button
                            onClick={handleDownload}
                            className="neo-btn bg-[var(--color-accent-secondary)] text-white px-8 py-3 text-lg shadow-[6px_6px_0_black] hover:shadow-[8px_8px_0_black] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
                        >
                            DOWNLOAD TICKETS
                        </button>
                        <Link to="/my-tickets" className="neo-btn bg-white text-black px-8 py-3 text-lg shadow-[6px_6px_0_black] hover:shadow-[8px_8px_0_black]">
                            VIEW MY TICKETS
                        </Link>
                    </div>

                    <div className="mt-8">
                        <Link to="/events" className="font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:underline decoration-2 uppercase text-sm">
                            &larr; Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default PaymentSuccess;
