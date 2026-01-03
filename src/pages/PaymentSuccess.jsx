import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';
import download from 'downloadjs';

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
                backgroundColor: '#f8fafc', // Light gray background to ensure card shadows are captured
                style: {
                    transform: 'scale(1)', // Ensure no hover scale is active
                    margin: '0',
                    padding: '20px'
                }
            };

            const dataUrl = await toPng(ticketRef.current, options);
            download(dataUrl, `Tickify-Ticket-${booking?.bookingReference || 'Order'}.png`);
        } catch (err) {
            console.error('Failed to download ticket', err);
            alert("Failed to download ticket. Please try again.");
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
                console.error("Error fetching booking details:", error);
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

                    {/* Ticket Preview Card */}
                    <div ref={ticketRef} className="max-w-md mx-auto bg-white border-4 border-black rounded-xl overflow-hidden shadow-[8px_8px_0_black] mb-10 transition-transform duration-300">
                        <div className="bg-[var(--color-accent-primary)] p-4 text-white border-b-4 border-black border-dashed">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="font-black text-xl uppercase tracking-wider">Tickify Ticket</h3>
                                    <span className="text-sm font-bold opacity-80">Order #{booking.bookingReference || booking.id.slice(0, 8).toUpperCase()}</span>
                                </div>
                                <div className="bg-white p-1 rounded">
                                    <QRCodeSVG
                                        value={`${window.location.origin}/verify/${booking.id}`}
                                        size={50}
                                        level="H"
                                        includeMargin={false}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-white text-black text-left relative">
                            {/* Holes for "ticket" look */}
                            <div className="absolute top-[40%] -left-3 w-6 h-6 bg-[var(--color-bg-primary)] rounded-full border-r-4 border-black transform -translate-y-1/2"></div>
                            <div className="absolute top-[40%] -right-3 w-6 h-6 bg-[var(--color-bg-primary)] rounded-full border-l-4 border-black transform -translate-y-1/2"></div>

                            {/* Event Info */}
                            <div className="mb-6 border-b-2 border-dashed border-gray-300 pb-4">
                                <span className="text-xs font-black uppercase text-gray-500 block mb-1">Event</span>
                                <h4 className="text-xl font-black uppercase leading-tight mb-2">{event?.title}</h4>
                                <div className="flex flex-wrap gap-4 text-sm font-bold text-gray-700">
                                    <span className="flex items-center gap-1">
                                        📅 {(() => {
                                            if (!event?.date) return "Date TBA";
                                            if (event.date && typeof event.date.toDate === 'function') {
                                                return event.date.toDate().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
                                            }
                                            const d = new Date(event.date);
                                            if (!isNaN(d.getTime())) {
                                                return d.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
                                            }
                                            return event.date;
                                        })()}
                                    </span>
                                    <span className="flex items-center gap-1">📍 {event?.location}</span>
                                </div>
                            </div>

                            {/* Ticket Details (Loop through items) */}
                            <div className="space-y-3 mb-6">
                                {booking.items && booking.items.map((item, idx) => (
                                    <div key={idx} className="bg-gray-50 p-3 rounded border border-gray-200">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="block font-black uppercase text-sm">{item.name || item.ticketName}</span>
                                            <span className="font-bold">₹{item.price}</span>
                                        </div>

                                        <div className="text-xs text-gray-600 space-y-1">
                                            {item.label && <span className="block font-bold text-[var(--color-accent-secondary)]">Seat: {item.label}</span>}

                                            {/* Display Ticket Number(s) */}
                                            {item.ticketNumbers && item.ticketNumbers.length > 0 ? (
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {item.ticketNumbers.map((num, i) => (
                                                        <span key={i} className="bg-black text-white px-2 py-0.5 rounded text-[10px] font-mono">{num}</span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="block">Qty: {item.quantity}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-col items-center justify-center py-4 border-4 border-black rounded-lg bg-gray-50 shadow-[4px_4px_0_black]">
                                <QRCodeSVG
                                    value={`${window.location.origin}/verify/${booking.id}`}
                                    size={120}
                                    level="H"
                                    includeMargin={true}
                                />
                                <span className="text-xs font-black uppercase mt-4 tracking-widest bg-black text-white px-4 py-1">Official Verification</span>
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
        </div>
    );
};

export default PaymentSuccess;
