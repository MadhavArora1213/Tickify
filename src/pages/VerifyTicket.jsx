import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import toast from 'react-hot-toast';

const VerifyTicket = () => {
    const { bookingId } = useParams();
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
                const bookingRef = doc(db, 'bookings', bookingId);
                const bookingSnap = await getDoc(bookingRef);

                if (bookingSnap.exists()) {
                    const bookingData = bookingSnap.data();
                    setBooking({ id: bookingId, ...bookingData });

                    if (bookingData.eventId) {
                        const eventRef = doc(db, 'events', bookingData.eventId);
                        const eventSnap = await getDoc(eventRef);
                        if (eventSnap.exists()) {
                            setEvent(eventSnap.data());
                        }
                    }
                } else {
                    setError("Invalid Ticket: Booking not found");
                }
            } catch (err) {
                toast.error("Error verifying ticket");
                setError("Error verifying ticket");
            } finally {
                setLoading(false);
            }
        };

        verifyTicket();
    }, [bookingId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white p-6">
                <div className="text-2xl font-black animate-pulse uppercase tracking-widest text-center">
                    Authenticating Ticket...
                </div>
            </div>
        );
    }

    const isSuccess = !error && booking && (booking.status === 'confirmed' || booking.status === 'scanned');

    return (
        <div className={`min-h-screen flex flex-col items-center justify-center p-6 py-20 text-center transition-colors duration-500 ${isSuccess ? 'bg-[var(--color-bg-primary)]' : 'bg-red-500'}`}>

            <div className="container max-w-lg">
                {/* Branding */}
                <div className="mb-10 animate-fade-in">
                    <h1 className="text-4xl font-black uppercase tracking-tighter text-[var(--color-text-primary)] mb-2">Tickify <span className="text-[var(--color-accent-primary)]">Verify</span></h1>
                    <p className="text-sm font-bold uppercase text-[var(--color-text-secondary)] tracking-widest">Official Verification Service</p>
                </div>

                <div className={`w-full bg-white border-4 border-black shadow-[12px_12px_0_black] p-8 relative overflow-hidden ${isSuccess ? 'animate-bounce-in' : 'animate-shake'}`}>

                    {/* Status Badge */}
                    <div className={`absolute top-4 right-4 px-4 py-1 border-2 border-black font-black uppercase text-[10px] transform rotate-3 ${isSuccess ? 'bg-green-400' : 'bg-red-400 text-white'}`}>
                        {isSuccess ? 'Genuine' : 'Invalid'}
                    </div>

                    {/* Status Icon */}
                    <div className={`w-28 h-28 mx-auto rounded-full border-4 border-black flex items-center justify-center text-6xl mb-8 ${isSuccess ? 'bg-green-400 text-black shadow-[6px_6px_0_black]' : 'bg-red-400 text-white shadow-[6px_6px_0_rgba(0,0,0,0.3)]'}`}>
                        {isSuccess ? '✓' : '✕'}
                    </div>

                    <h2 className="text-3xl font-black uppercase mb-2 text-black">{isSuccess ? 'Ticket Verified' : 'Access Denied'}</h2>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mb-10 pb-6 border-b-2 border-dashed border-gray-200">
                        {isSuccess ? 'This ticket is authentic and registered to our system' : (error || 'Counterfeit or Expired Ticket Detected')}
                    </p>

                    {/* Details Container */}
                    {isSuccess && (
                        <div className="space-y-6 text-left">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Pass Holder</p>
                                    <p className="text-xl font-black text-black leading-tight uppercase">{booking?.userName || 'Anonymous Guest'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Status</p>
                                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase ${booking.status === 'scanned' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                        {booking.status === 'scanned' ? 'Already Entered' : 'Valid Pass'}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Event Entry</p>
                                <p className="text-lg font-bold text-black uppercase leading-tight">{event?.eventTitle || event?.title || 'Private Event'}</p>
                                <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">📅 {event?.startDate || 'Date Confirmed'}</p>
                            </div>

                            <div className="bg-gray-50 p-4 border-2 border-black border-dashed rounded-lg">
                                <p className="text-[10px] font-black uppercase text-gray-400 mb-2">Category & Quantity</p>
                                <div className="space-y-2">
                                    {booking?.items?.map((item, i) => (
                                        <div key={i} className="flex justify-between items-center">
                                            <p className="text-xs font-black text-black uppercase">{item.name || item.ticketName} {item.label && `(Seat: ${item.label})`}</p>
                                            <p className="text-xs font-black bg-black text-white px-2 py-0.5 ml-2">x{item.quantity}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t-2 border-dashed border-gray-100">
                                <p className="text-[10px] font-black uppercase text-gray-400">Order Ref</p>
                                <p className="text-sm font-mono font-bold text-black">{booking?.bookingReference || booking?.id?.slice(0, 10).toUpperCase()}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Post-Verification Actions */}
                <div className="mt-12 space-y-4">
                    <Link to="/" className="block w-full py-4 bg-black text-white font-black uppercase text-lg border-4 border-black shadow-[6px_6px_0_var(--color-accent-primary)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0_var(--color-accent-primary)] transition-all">
                        Buy More Tickets
                    </Link>
                    <p className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-widest pt-4 animate-pulse">
                        🛡️ Secure Verification System v2.0
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes bounce-in {
                    0% { transform: scale(0.8); opacity: 0; }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); opacity: 1; }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-10px); }
                    75% { transform: translateX(10px); }
                }
                .animate-bounce-in { animation: bounce-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
                .animate-shake { animation: shake 0.5s ease-in-out infinite; }
            `}</style>
        </div>
    );
};

export default VerifyTicket;
