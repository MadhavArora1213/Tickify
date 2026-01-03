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
                    padding: '20px'
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
                                <div className="neo-card bg-white border-4 border-black shadow-[8px_8px_0_black] overflow-hidden">
                                    {/* Printable Area */}
                                    <div
                                        ref={el => ticketRefs.current[ticket.ticketId] = el}
                                        className="flex flex-col md:flex-row min-h-[220px] bg-white"
                                    >
                                        <div className="flex-1 p-6 flex flex-col justify-between relative">
                                            <div className="mb-4">
                                                <h3 className="text-2xl font-black text-black uppercase leading-none mb-2">{ticket.eventTitle}</h3>
                                                <p className="text-sm font-bold text-gray-600 uppercase mb-2">{ticket.name || ticket.ticketName}</p>
                                                <div className="mt-1 text-sm font-bold text-gray-800 flex items-center gap-1">
                                                    Paid: ₹{ticket.originalPrice}
                                                </div>
                                                {ticket.label && (
                                                    <div className="mt-1 text-xs font-black bg-yellow-200 inline-block px-2 py-1 border border-black">
                                                        Seat: {ticket.label}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-[10px] font-mono text-gray-400 mt-4 uppercase">
                                                Order Ref: {ticket.bookingReference || ticket.bookingId.slice(0, 10)}
                                            </div>
                                        </div>

                                        <div className="w-full md:w-48 bg-gray-50 p-6 flex flex-col items-center justify-center border-l-0 md:border-l-4 border-t-4 md:border-t-0 border-black relative">
                                            <div className="bg-white p-2 border-2 border-black mb-2 shadow-[2px_2px_0_black]">
                                                <QRCodeSVG
                                                    value={`${window.location.origin}/verify/${ticket.bookingId}`}
                                                    size={100}
                                                    level="H"
                                                    includeMargin={true}
                                                />
                                            </div>
                                            <span className="text-[8px] font-black uppercase text-center text-gray-500 tracking-tighter">
                                                Official Tickify Pass
                                            </span>
                                            <span className="mt-2 text-[8px] font-mono text-gray-400">{ticket.ticketNumber || ticket.ticketId}</span>
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
                </div>
            </div>
        </div>
    );
};

export default MyTickets;
