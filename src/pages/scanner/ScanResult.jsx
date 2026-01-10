import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import toast from 'react-hot-toast';

const ScanResult = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const bookingId = searchParams.get('bookingId');

    const [booking, setBooking] = useState(null);
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const verifyTicket = async () => {
            if (!bookingId) {
                setError("No booking ID provided");
                setLoading(false);
                return;
            }

            try {
                let foundBooking = null;
                let finalBookingId = bookingId;

                // 1. Try direct Firestore ID lookup
                const bookingRef = doc(db, 'bookings', bookingId);
                const bookingSnap = await getDoc(bookingRef);

                if (bookingSnap.exists()) {
                    foundBooking = bookingSnap.data();
                } else {
                    // 2. Try searching by bookingReference (case-insensitive usually requires normalized field, but let's try exact)
                    const qRef = query(collection(db, 'bookings'), where('bookingReference', '==', bookingId.toUpperCase()));
                    const querySnapRef = await getDocs(qRef);

                    if (!querySnapRef.empty) {
                        foundBooking = querySnapRef.docs[0].data();
                        finalBookingId = querySnapRef.docs[0].id;
                    }
                }

                if (foundBooking) {
                    setBooking({ id: finalBookingId, ...foundBooking });

                    if (foundBooking.eventId) {
                        try {
                            const eventRef = doc(db, 'events', foundBooking.eventId);
                            const eventSnap = await getDoc(eventRef);
                            if (eventSnap.exists()) {
                                setEvent(eventSnap.data());
                            }
                        } catch (e) {
                            // Silent failure for event fetch
                        }
                    }

                    // Mark as scanned in DB if it's the first time
                    // We must use the REAL document ID (finalBookingId)
                    if (foundBooking.status !== 'scanned') {
                        const realBookingRef = doc(db, 'bookings', finalBookingId);
                        await updateDoc(realBookingRef, {
                            status: 'scanned',
                            scannedAt: serverTimestamp()
                        });
                    }

                } else {
                    setError("Invalid Ticket: Booking not found");
                }
            } catch (err) {
                console.error("Verification Error:", err);
                toast.error("Verification error");
                setError("Error verifying ticket");
            } finally {
                setLoading(false);
            }
        };

        verifyTicket();
    }, [bookingId]);

    const handleNextScan = () => {
        navigate('/scanner/scan');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <div className="text-2xl font-black animate-pulse uppercase">Verifying...</div>
            </div>
        );
    }

    const isSuccess = !error && booking && (
        booking.status === 'confirmed' ||
        booking.status === 'scanned' ||
        booking.status === 'paid' ||
        booking.status === 'available' ||
        booking.scannedAt
    );

    return (
        <div className={`min-h-screen flex flex-col items-center justify-between p-6 py-12 text-center transition-colors duration-300 ${isSuccess ? 'bg-green-500' : 'bg-red-500'}`}>

            <div className="w-full max-w-sm bg-white border-4 border-black shadow-[12px_12px_0_rgba(0,0,0,0.5)] p-8 relative overflow-hidden animate-bounce-in">

                {/* Status Icon */}
                <div className={`w-24 h-24 mx-auto rounded-full border-4 border-black flex items-center justify-center text-5xl mb-6 ${isSuccess ? 'bg-green-400 text-black' : 'bg-red-400 text-white'}`}>
                    {isSuccess ? '✓' : '✕'}
                </div>

                {/* Status Message */}
                <h1 className="text-4xl font-black uppercase mb-2">{isSuccess ? 'Valid Ticket' : 'Invalid Ticket'}</h1>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-8">
                    {isSuccess ? (booking.scannedAt ? 'Entry Authorized (Already Scanned)' : 'Entry Authorized') : (error || 'Entry Denied')}
                </p>

                {/* Attendee Details */}
                <div className="border-t-2 border-dashed border-black pt-6 space-y-4 text-left">
                    <div>
                        <p className="text-[10px] font-black uppercase text-gray-500">Attendee</p>
                        <p className="text-xl font-black text-black">{booking?.userName || 'Unknown Guest'}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-gray-500">Event</p>
                        <p className="text-lg font-bold text-black uppercase">{event?.eventTitle || event?.title || 'Event Name'}</p>
                    </div>
                    <div className="flex justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase text-gray-500">Tickets</p>
                            <div className="space-y-1 mt-1">
                                {booking?.items?.map((item, i) => (
                                    <p key={i} className="text-sm font-bold text-black">
                                        {item.name || item.ticketName} {item.label ? `(Seat: ${item.label})` : `x${item.quantity}`}
                                    </p>
                                ))}
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase text-gray-500">Reference</p>
                            <p className="text-sm font-mono font-bold text-black underline">{booking?.bookingReference || booking?.id?.slice(0, 8).toUpperCase()}</p>
                        </div>
                    </div>
                </div>

                {isSuccess && booking?.items?.some(i => i.name?.toLowerCase().includes('vip')) && (
                    <div className="absolute -right-12 -top-12 bg-yellow-400 text-black font-black text-[10px] py-1 px-12 rotate-45 border-2 border-black shadow-sm">
                        VIP
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="w-full max-w-sm space-y-4">
                <button
                    onClick={handleNextScan}
                    className="w-full py-4 bg-black text-white font-black uppercase text-xl border-4 border-white shadow-[6px_6px_0_rgba(255,255,255,0.5)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0_white] transition-all"
                >
                    Scan Next
                </button>

                {!isSuccess && (
                    <button onClick={() => navigate('/scanner/scan')} className="w-full py-3 bg-white/20 text-black font-black uppercase border-2 border-black hover:bg-white/40 transition-colors">
                        Back to Scanner
                    </button>
                )}

                <Link to="/scanner/events" className="block text-xs font-black uppercase text-black/60 hover:text-black mt-6">
                    Exit Scanning Mode
                </Link>
            </div>

            <style>{`
                @keyframes bounce-in {
                    0% { transform: scale(0.8); opacity: 0; }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); opacity: 1; }
                }
                .animate-bounce-in {
                    animation: bounce-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }
            `}</style>
        </div>
    );
};

export default ScanResult;
