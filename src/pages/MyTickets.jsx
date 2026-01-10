import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';
import download from 'downloadjs';
import toast from 'react-hot-toast';

const MyTickets = () => {
    const { currentUser } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [resellPrice, setResellPrice] = useState({});
    const [showResellInput, setShowResellInput] = useState(null);
    const ticketRefs = useRef({});

    const handleDownload = async (ticketId, refRef) => {
        if (!refRef) return;
        try {
            const options = {
                cacheBust: true,
                pixelRatio: 3,
                backgroundColor: '#ffffff',
                style: {
                    transform: 'scale(1)',
                    margin: '0',
                    padding: '20px',
                    width: '650px' // Match the card internal width
                }
            };
            const dataUrl = await toPng(refRef, options);
            download(dataUrl, `Tickify-Ticket-${ticketId}.png`);
        } catch (err) {
            toast.error("Download failed. Please try again.");
        }
    };

    useEffect(() => {
        const fetchTickets = async () => {
            if (!currentUser) return;
            setLoading(true);
            try {
                // 1. Fetch user's bookings
                const q = query(collection(db, 'bookings'), where('userId', '==', currentUser.uid));
                const querySnapshot = await getDocs(q);

                // 2. Fetch user's active resale listings
                const resellQ = query(
                    collection(db, 'resell_tickets'),
                    where('sellerId', '==', currentUser.uid),
                    where('status', '==', 'available')
                );
                const resellSnapshot = await getDocs(resellQ);

                // Cleanup logic: If event has passed, these should be returned to user implicitly
                // For now, we just filter them out if they are truly 'available' on market
                const listedTicketIds = resellSnapshot.docs.map(doc => doc.data().ticketId);

                let allTickets = [];

                for (const docSnap of querySnapshot.docs) {
                    const booking = docSnap.data();

                    let eventTitle = "Event Ticket";
                    if (booking.eventId) {
                        try {
                            const eventRef = doc(db, 'events', booking.eventId);
                            const eventSnap = await getDoc(eventRef);
                            if (eventSnap.exists()) {
                                eventTitle = eventSnap.data().eventTitle || eventSnap.data().title || "Event Ticket";
                            }
                        } catch (e) {
                            // Fail silently for event fetch
                        }
                    }

                    if (booking.items && Array.isArray(booking.items)) {
                        booking.items.forEach((item, itemIdx) => {
                            const quantity = item.quantity || 1;

                            for (let i = 0; i < quantity; i++) {
                                const ticketId = `${docSnap.id}-${itemIdx}-${i}`;

                                // Only add if not currently listed for resale
                                if (!listedTicketIds.includes(ticketId)) {
                                    allTickets.push({
                                        ...item,
                                        bookingId: docSnap.id,
                                        bookingReference: booking.bookingReference || docSnap.id.slice(0, 8).toUpperCase(),
                                        eventId: booking.eventId,
                                        eventTitle: eventTitle,
                                        bookingDate: booking.bookingDate,
                                        status: booking.status,
                                        ticketNumber: item.ticketNumbers?.[i] || item.ticketNumber || booking.bookingReference || `${docSnap.id.slice(0, 8)}-${itemIdx}-${i}`,
                                        ticketId: ticketId,
                                        originalPrice: Number(item.price)
                                    });
                                }
                            }
                        });
                    }
                }
                setTickets(allTickets);
            } catch (error) {
                console.error("Error fetching tickets:", error);
                toast.error("Error fetching tickets");
            } finally {
                setLoading(false);
            }
        };

        fetchTickets();
    }, [currentUser]);

    const handleResell = async (ticket) => {
        const priceString = resellPrice[ticket.ticketId];
        const price = parseFloat(priceString);

        if (priceString === '' || isNaN(price) || price < 0) {
            toast.error("Please enter a valid price.");
            return;
        }
        if (price > ticket.originalPrice) {
            toast.error(`You cannot resell for more than the original price (₹${ticket.originalPrice}).`);
            return;
        }

        if (!window.confirm("ARE YOU SURE? Once listed, this ticket will be LOCKED and INVALID for entry until it is either sold or the event expires. You will not be able to use it.")) {
            return;
        }

        try {
            await addDoc(collection(db, 'resell_tickets'), {
                originalBookingId: ticket.bookingId,
                ticketId: ticket.ticketId,
                ticketNumber: ticket.ticketNumber,
                eventId: ticket.eventId,
                eventTitle: ticket.eventTitle,
                sellerId: currentUser.uid,
                seatId: ticket.id || null,
                seatLabel: ticket.label || null,
                ticketName: ticket.name || ticket.ticketName,
                originalPrice: ticket.originalPrice,
                resalePrice: price,
                status: 'available',
                createdAt: serverTimestamp()
            });

            toast.success("Ticket listed for resale successfully!");
            setTickets(prev => prev.filter(t => t.ticketId !== ticket.ticketId)); // Remove from local view
            setShowResellInput(null);
        } catch (error) {
            toast.error("Failed to list ticket.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--color-bg-primary)] pt-36 pb-20 flex justify-center items-center">
                <div className="text-xl font-bold text-[var(--color-text-primary)]">Loading your tickets...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] pt-36 pb-24">
            <div className="container mx-auto px-4">
                <h1 className="text-4xl md:text-6xl font-black mb-12 uppercase text-center text-[var(--color-text-primary)]">
                    <span className="block dark:hidden" style={{ WebkitTextStroke: '2px black', color: 'white', textShadow: '4px 4px 0px #000' }}>My Tickets</span>
                    <span className="hidden dark:block drop-shadow-[4px_4px_0_var(--color-accent-primary)]">My Tickets</span>
                </h1>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 max-w-7xl mx-auto">
                    {tickets.length > 0 ? (
                        tickets.map((ticket) => (
                            <div key={ticket.ticketId} className="flex flex-col gap-4">
                                <div className="neo-card ticket-print bg-white border-4 border-black shadow-[12px_12px_0_black] overflow-hidden">
                                    <div className="overflow-x-auto lg:overflow-visible scrollbar-hide">
                                        {/* Display Container with scaling/sizing */}
                                        <div className="min-w-[580px] md:min-w-0 md:w-full">
                                            {/* Printable Area - Horizontal ID Card */}
                                            <div
                                                ref={el => ticketRefs.current[ticket.ticketId] = el}
                                                className="bg-white rounded-[2rem] p-1" // Inner rounded for capture
                                            >
                                                <div className="flex h-[340px] border-4 border-black rounded-[1.8rem] overflow-hidden">
                                                    {/* Info Section */}
                                                    <div className="flex-[1.8] p-8 flex flex-col justify-between relative bg-white">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <h3 className="font-black text-[10px] uppercase tracking-widest text-[var(--color-accent-primary)] mb-1">Official Event Pass</h3>
                                                                <h4 className="text-3xl font-black uppercase leading-tight text-black break-words max-w-[280px]">{ticket.eventTitle}</h4>
                                                            </div>
                                                            <div className="text-right flex-shrink-0 ml-4">
                                                                <span className="text-[10px] font-black uppercase text-gray-400 block mb-1 tracking-tighter">Ticket ID</span>
                                                                <div className="bg-black text-white px-3 py-1.5 text-[10px] font-mono leading-none border-2 border-black">
                                                                    {ticket.ticketNumber || ticket.bookingReference}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-x-6 gap-y-8 pt-6 border-t-2 border-dashed border-gray-100">
                                                            <div>
                                                                <span className="text-[10px] font-black uppercase text-gray-400 block mb-1">Attendee</span>
                                                                <p className="font-black text-base uppercase text-black truncate">{currentUser.displayName || 'Guest User'}</p>
                                                            </div>
                                                            <div>
                                                                <span className="text-[10px] font-black uppercase text-gray-400 block mb-1">Pass Type</span>
                                                                <p className="font-black text-base uppercase text-black truncate">{ticket.name || ticket.ticketName}</p>
                                                            </div>
                                                            <div>
                                                                <span className="text-[10px] font-black uppercase text-gray-400 block mb-1">Seat Assignment</span>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-black text-2xl uppercase text-[var(--color-accent-primary)]">{ticket.label || 'GA'}</span>
                                                                    <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 text-[10px] font-black border border-yellow-300">CONFIRMED</span>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <span className="text-[10px] font-black uppercase text-gray-400 block mb-1">Entry Price</span>
                                                                <p className="font-black text-base uppercase text-black">₹{ticket.originalPrice}</p>
                                                            </div>
                                                        </div>

                                                        <div className="mt-6 flex justify-between items-end border-t border-gray-100 pt-4">
                                                            <div className="text-[8px] font-mono text-gray-400 uppercase tracking-[0.2em]">
                                                                SECURE_AUTH_HASH: {(ticket.ticketNumber || ticket.ticketId).toUpperCase()}
                                                            </div>
                                                            <div className="text-[8px] font-black text-gray-200">© 2026 TICKIFY.COM</div>
                                                        </div>
                                                    </div>

                                                    {/* QR Stub */}
                                                    <div className="flex-1 bg-gray-50 border-l-4 border-dashed border-black p-8 flex flex-col items-center justify-center relative shadow-inner">
                                                        {/* Stub Tear Notches */}
                                                        <div className="absolute top-[-16px] left-[-16px] w-8 h-8 bg-white border-2 border-black rounded-full z-10"></div>
                                                        <div className="absolute bottom-[-16px] left-[-16px] w-8 h-8 bg-white border-2 border-black rounded-full z-10"></div>

                                                        <div className="bg-white p-3 border-4 border-black shadow-[8px_8px_0_black] mb-4 transform rotate-1 group-hover:rotate-0 transition-all duration-300">
                                                            <QRCodeSVG
                                                                value={`${window.location.origin}/verify/${ticket.bookingId}`}
                                                                size={160}
                                                                level="H"
                                                                includeMargin={false}
                                                                className="w-full h-full"
                                                            />
                                                        </div>
                                                        <div className="text-center relative z-20">
                                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black mb-2 italic underline decoration-yellow-400">Scan to Verify</p>
                                                            <div className="bg-black text-white px-3 py-1.5 text-[10px] font-mono border-2 border-white shadow-[2px_2px_0_black]">
                                                                {ticket.ticketNumber || ticket.ticketId.slice(-8).toUpperCase()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="p-6 bg-white border-t-4 border-black grid grid-cols-2 gap-4">
                                        {showResellInput === ticket.ticketId ? (
                                            <div className="col-span-2">
                                                <label className="text-[10px] font-black uppercase text-gray-500 block mb-2">Resale Price (Max ₹{ticket.originalPrice})</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="number"
                                                        value={resellPrice[ticket.ticketId] || ''}
                                                        onChange={(e) => setResellPrice(prev => ({ ...prev, [ticket.ticketId]: e.target.value }))}
                                                        className="flex-1 px-4 py-2 border-2 border-black font-black text-base focus:bg-yellow-50 outline-none"
                                                        placeholder="₹ Amount"
                                                    />
                                                    <button
                                                        onClick={() => handleResell(ticket)}
                                                        className="bg-[var(--color-success)] text-white text-xs font-black px-6 py-2 border-2 border-black shadow-[4px_4px_0_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_black]"
                                                    >
                                                        CONFIRM
                                                    </button>
                                                    <button
                                                        onClick={() => setShowResellInput(null)}
                                                        className="text-red-600 font-black px-4 hover:underline"
                                                    >
                                                        CANCEL
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleDownload(ticket.ticketId, ticketRefs.current[ticket.ticketId])}
                                                    className="neo-btn bg-black text-white px-6 py-3 font-black text-xs uppercase shadow-[4px_4px_0_black] hover:shadow-[6px_6px_0_black] flex items-center justify-center gap-2"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                                    Save PNG
                                                </button>
                                                <button
                                                    onClick={() => setShowResellInput(ticket.ticketId)}
                                                    className="neo-btn bg-white text-black px-6 py-3 font-black text-xs uppercase shadow-[4px_4px_0_black] hover:shadow-[6px_6px_0_black] flex items-center justify-center gap-2"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                    Resell
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-20 neo-card bg-[var(--color-bg-surface)]">
                            <h2 className="text-2xl font-black text-[var(--color-text-primary)] mb-4">NO TICKETS FOUND</h2>
                            <p className="text-[var(--color-text-secondary)] font-bold mb-6">You haven't purchased any tickets yet.</p>
                            <a href="/events" className="neo-btn inline-block bg-[var(--color-accent-primary)] text-white px-8 py-3">BROWSE EVENTS</a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyTickets;
