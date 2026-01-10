import React, { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Settlements = () => {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [payouts, setPayouts] = useState([]);

    useEffect(() => {
        const fetchFinances = async () => {
            if (!currentUser) return;
            try {
                setLoading(true);
                // 1. Fetch all events for this organizer
                const eventsRef = collection(db, 'events');
                const eq = query(eventsRef, where('organizerId', '==', currentUser.uid));
                const eSnap = await getDocs(eq);
                const eventIds = eSnap.docs.map(doc => doc.id);

                if (eventIds.length > 0) {
                    // 2. Fetch all bookings for these events
                    const bookingsRef = collection(db, 'bookings');
                    let revenue = 0;

                    for (let i = 0; i < eventIds.length; i += 10) {
                        const chunk = eventIds.slice(i, i + 10);
                        const bq = query(bookingsRef, where('eventId', 'in', chunk));
                        const bSnap = await getDocs(bq);
                        bSnap.docs.forEach(doc => {
                            revenue += (doc.data().totalAmount || 0);
                        });
                    }
                    setTotalRevenue(revenue);
                }

                // 3. Fetch Payouts (Mocking for now as we don't have a payouts collection yet)
                // In a real app, you'd fetch from a 'payouts' collection
                setPayouts([
                    { id: "SET-INIT", date: "Account Connected", amount: "₹0.00", status: "completed", method: "System" },
                ]);

            } catch (error) {
                toast.error("Error fetching finances");
            } finally {
                setLoading(false);
            }
        };

        fetchFinances();
    }, [currentUser]);

    const getStatusBadge = (status) => {
        const styles = {
            completed: "bg-green-400 text-black border-black",
            processing: "bg-yellow-300 text-black border-yellow-600",
            pending: "bg-gray-300 text-gray-700 border-gray-500",
            failed: "bg-red-400 text-white border-red-800"
        };
        return (
            <span className={`px-2 py-1 text-xs font-black uppercase border-2 ${styles[status]}`}>
                {status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center">
                <div className="font-black text-2xl animate-spin">💰</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] pt-24 pb-12">
            <div className="container mx-auto px-4">
                <h1 className="text-4xl md:text-5xl font-black uppercase text-[var(--color-text-primary)] mb-8">Settlements</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Content: History */}
                    <div className="lg:col-span-2 space-y-8 animate-fade-in-up">

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="neo-card bg-[var(--color-bg-surface)] p-6 border-4 border-[var(--color-text-primary)] shadow-[6px_6px_0_var(--color-text-primary)]">
                                <p className="text-sm font-black uppercase text-[var(--color-text-secondary)]">Available to Withdraw</p>
                                <h2 className="text-4xl font-black text-[var(--color-text-primary)]">₹{totalRevenue.toLocaleString()}</h2>
                                <p className="text-[10px] font-bold text-gray-400 mt-2">7-Day Clearance Cycle</p>
                            </div>
                            <div className="neo-card bg-[var(--color-bg-surface)] p-6 border-4 border-[var(--color-text-primary)] shadow-[6px_6px_0_var(--color-text-primary)]">
                                <p className="text-sm font-black uppercase text-[var(--color-text-secondary)]">Total Payouts</p>
                                <h2 className="text-4xl font-black text-green-500">₹0</h2>
                            </div>
                        </div>

                        {/* Recent Settlements List */}
                        <div className="neo-card bg-[var(--color-bg-surface)] p-6 border-4 border-[var(--color-text-primary)] shadow-[8px_8px_0_var(--color-text-primary)]">
                            <h3 className="text-xl font-black uppercase mb-6 border-b-2 border-black pb-2">Settlement History</h3>
                            <div className="space-y-4">
                                {payouts.length === 0 ? (
                                    <p className="text-center font-bold text-gray-500 py-8">No payout history yet.</p>
                                ) : (
                                    payouts.map((s) => (
                                        <div key={s.id} className="flex flex-col md:flex-row justify-between items-center p-4 border-2 border-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] transition-colors">
                                            <div className="mb-2 md:mb-0">
                                                <div className="flex items-center gap-3">
                                                    <span className="font-black text-lg text-[var(--color-text-primary)]">{s.id}</span>
                                                    {getStatusBadge(s.status)}
                                                </div>
                                                <p className="text-xs font-bold text-[var(--color-text-secondary)]">{s.date} • {s.method}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="block text-xl font-black text-[var(--color-text-primary)]">{s.amount}</span>
                                                {s.status === 'completed' && <span className="text-[10px] font-bold text-green-600 block">PROCESSED</span>}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar: Request & Methods */}
                    <div className="space-y-8 animate-fade-in-up">
                        {/* Request Settlement */}
                        <div className="neo-card bg-[var(--color-accent-secondary)] p-6 border-4 border-black shadow-[8px_8px_0_black] text-white">
                            <h3 className="text-xl font-black uppercase mb-4">Request Payout</h3>
                            <p className="font-bold text-sm mb-6 opacity-90">
                                Minimum withdrawal amount is ₹500. Processing takes 2-3 business days.
                            </p>
                            <div className="mb-4">
                                <label className="block text-xs font-black uppercase mb-1">Amount</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black font-black">₹</span>
                                    <input type="number" defaultValue={totalRevenue} className="w-full pl-8 pr-4 py-3 bg-white text-black font-black border-2 border-black" />
                                </div>
                            </div>
                            <button className="w-full py-3 bg-black text-white font-black uppercase border-2 border-white hover:bg-white hover:text-black hover:border-black transition-colors shadow-[4px_4px_0_black]">
                                Withdraw Funds
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settlements;
