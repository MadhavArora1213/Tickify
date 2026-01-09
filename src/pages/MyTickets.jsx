import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';
import download from 'downloadjs';

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
            console.error('Download failed', err);
            alert("Download failed. Please try again.");
        }
    };

    useEffect(() => {
        const fetchTickets = async () => {
            if (!currentUser) return;
            setLoading(true);
            try {
                const q = query(collection(db, 'bookings'), where('userId', '==', currentUser.uid));
                const querySnapshot = await getDocs(q);
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
                            console.error("Error fetching event for ticket:", e);
                        }
                    }

                    if (booking.items && Array.isArray(booking.items)) {
                        booking.items.forEach((item, index) => {
                            allTickets.push({
                                ...item,
                                bookingId: docSnap.id,
                                eventId: booking.eventId,
                                eventTitle: eventTitle,
                                bookingDate: booking.bookingDate,
                                status: booking.status,
                                ticketId: `${docSnap.id}-${index}`,
                                originalPrice: Number(item.price)
                            });
                        });
                    }
                }
                setTickets(allTickets);
            } catch (error) {
                console.error("Error fetching tickets:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTickets();
    }, [currentUser]);

    const handleResell = async (ticket) => {
        const price = parseFloat(resellPrice[ticket.ticketId]);
        if (!price || price <= 0) {
            alert("Please enter a valid price.");
            return;
        }
        if (price > ticket.originalPrice) {
            alert(`You cannot resell for more than the original price (₹${ticket.originalPrice}).`);
            return;
        }

        try {
            await addDoc(collection(db, 'resell_tickets'), {
                originalBookingId: ticket.bookingId,
                ticketId: ticket.ticketId,
                eventId: ticket.eventId,
                sellerId: currentUser.uid,
                seatId: ticket.id || null,
                ticketName: ticket.name || ticket.ticketName,
                originalPrice: ticket.originalPrice,
                resalePrice: price,
                status: 'available',
                createdAt: serverTimestamp()
            });

            alert("Ticket listed for resale successfully!");
            setShowResellInput(null);
        } catch (error) {
            console.error("Error listing ticket:", error);
            alert("Failed to list ticket.");
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                    {tickets.length > 0 ? (
                        tickets.map((ticket) => (
                            <div key={ticket.ticketId} className="group relative">
                                <div className="neo-card bg-white border-4 border-black shadow-[8px_8px_0_black]">
                                    <div className="overflow-x-auto scrollbar-hide">
                                        {/* Printable Area - Horizontal ID Card */}
                                        <div
                                            ref={el => ticketRefs.current[ticket.ticketId] = el}
                                            className="bg-white overflow-hidden rounded-3xl border-4 border-black"
                                            style={{ width: '650px' }} // Landscape width for capture
                                        >
                                            <div className="flex h-[320px]">
                                                {/* Info Section */}
                                                <div className="flex-[1.5] p-8 flex flex-col justify-between relative bg-white">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <h3 className="font-black text-xs uppercase tracking-widest text-[var(--color-accent-primary)] mb-1">Official Event Pass</h3>
                                                            <h4 className="text-2xl font-black uppercase leading-tight text-black truncate max-w-[300px]">{ticket.eventTitle}</h4>
                                                        </div>
                                                        <div className="bg-black text-white px-2 py-1 text-[8px] font-mono">
                                                            REF_{ticket.bookingReference || ticket.bookingId.slice(0, 8).toUpperCase()}
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-y-6 pt-4 border-t-2 border-dashed border-gray-100">
                                                        <div>
                                                            <span className="text-[9px] font-black uppercase text-gray-400 block mb-0.5">Attendee</span>
                                                            <p className="font-black text-sm uppercase text-black truncate">{currentUser.displayName || 'Guest User'}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-[9px] font-black uppercase text-gray-400 block mb-0.5">Pass Type</span>
                                                            <p className="font-black text-sm uppercase text-black">{ticket.name || ticket.ticketName}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-[9px] font-black uppercase text-gray-400 block mb-0.5">Seat No.</span>
                                                            <p className="font-black text-lg uppercase text-[var(--color-accent-primary)]">{ticket.label || 'GA'}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-[9px] font-black uppercase text-gray-400 block mb-0.5">Entry Price</span>
                                                            <p className="font-black text-sm uppercase text-black">₹{ticket.originalPrice}</p>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 text-[7px] font-mono text-gray-300 uppercase tracking-[0.3em]">
                                                        Verified_Digital_Asset_Security_ID: {ticket.ticketId.toUpperCase()}
                                                    </div>
                                                </div>

                                                {/* QR Stub */}
                                                <div className="flex-1 bg-gray-50 border-l-4 border-dashed border-black p-8 flex flex-col items-center justify-center relative">
                                                    <div className="absolute top-[-10px] left-[-10px] w-5 h-5 bg-white border-2 border-black rounded-full"></div>
                                                    <div className="absolute bottom-[-10px] left-[-10px] w-5 h-5 bg-white border-2 border-black rounded-full"></div>

                                                    <div className="bg-white p-2 border-2 border-black shadow-[4px_4px_0_black] mb-3">
                                                        <QRCodeSVG
                                                            value={`${window.location.origin}/verify/${ticket.bookingId}`}
                                                            size={110}
                                                            level="H"
                                                            includeMargin={false}
                                                        />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-[8px] font-black uppercase tracking-widest text-black mb-1">Verify Entry</p>
                                                        <div className="bg-black text-white px-3 py-0.5 text-[7px] font-mono rounded">
                                                            TID_{ticket.ticketId.slice(-8).toUpperCase()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons - Not Captured */}
                                    <div className="p-4 bg-gray-100 border-t-4 border-black flex flex-col md:flex-row gap-3">
                                        {showResellInput === ticket.ticketId ? (
                                            <div className="w-full">
                                                <label className="text-[10px] font-black uppercase text-gray-500 block mb-1">Resale Price (Max ₹{ticket.originalPrice})</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="number"
                                                        value={resellPrice[ticket.ticketId] || ''}
                                                        onChange={(e) => setResellPrice(prev => ({ ...prev, [ticket.ticketId]: e.target.value }))}
                                                        className="w-24 p-1 border border-black font-bold text-sm"
                                                        placeholder="Amount"
                                                    />
                                                    <button
                                                        onClick={() => handleResell(ticket)}
                                                        className="bg-[var(--color-accent-primary)] text-white text-xs font-black px-3 py-1 border border-black shadow-[2px_2px_0_black]"
                                                    >
                                                        CONFIRM
                                                    </button>
                                                    <button
                                                        onClick={() => setShowResellInput(null)}
                                                        className="text-red-500 text-xs font-black px-2"
                                                    >
                                                        CANCEL
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleDownload(ticket.ticketId, ticketRefs.current[ticket.ticketId])}
                                                    className="flex-1 neo-btn bg-black text-white px-4 py-2 text-xs uppercase shadow-[2px_2px_0_black] hover:shadow-[4px_4px_0_black]"
                                                >
                                                    Download Ticket
                                                </button>
                                                <button
                                                    onClick={() => setShowResellInput(ticket.ticketId)}
                                                    className="flex-1 neo-btn bg-white text-black px-4 py-2 text-xs uppercase shadow-[2px_2px_0_black] hover:shadow-[4px_4px_0_black]"
                                                >
                                                    Resell on Marketplace
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
                </div >
            </div >
        </div >
    );
};

export default MyTickets;
