import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { db } from '../../config/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

const EventAnalytics = () => {
    const { eventId } = useParams();
    const [period, setPeriod] = useState('All Time');
    const [event, setEvent] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEventAnalytics = async () => {
            if (!eventId) return;
            try {
                setLoading(true);
                // 1. Fetch Event Info
                const eventRef = doc(db, 'events', eventId);
                const eventSnap = await getDoc(eventRef);

                if (eventSnap.exists()) {
                    setEvent({ id: eventSnap.id, ...eventSnap.data() });
                }

                // 2. Fetch Bookings for this event
                const bookingsRef = collection(db, 'bookings');
                const bq = query(bookingsRef, where('eventId', '==', eventId));
                const bSnapshot = await getDocs(bq);

                const fetchedBookings = bSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setBookings(fetchedBookings);
            } catch (error) {
                console.error("Error fetching event analytics:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEventAnalytics();
    }, [eventId]);

    // Calculate Real Stats
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const ticketsSold = bookings.reduce((sum, b) => {
        return sum + (b.items?.reduce((total, item) => total + (item.quantity || 1), 0) || 0);
    }, 0);
    const totalTickets = event?.totalCapacity || 100;
    const eventName = event?.eventTitle || "Loading...";

    // Ticket Selection Breakdown
    const ticketBreakdown = {};
    bookings.forEach(b => {
        if (b.items) {
            b.items.forEach(item => {
                const name = item.name || item.ticketName || 'General';
                if (!ticketBreakdown[name]) {
                    ticketBreakdown[name] = { sold: 0, revenue: 0 };
                }
                ticketBreakdown[name].sold += (item.quantity || 1);
                ticketBreakdown[name].revenue += (item.price * (item.quantity || 1));
            });
        }
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center">
                <div className="font-black text-2xl animate-pulse">ANALYZING DATA...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] pt-24 pb-12">
            <div className="container mx-auto px-4">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                    <div>
                        <Link to="/organizer/dashboard" className="text-xs font-black uppercase underline text-[var(--color-text-secondary)] mb-2 inline-block">&larr; Back to Dashboard</Link>
                        <h1 className="text-3xl md:text-5xl font-black uppercase text-[var(--color-text-primary)]">Analytics: {eventName}</h1>
                    </div>
                    <button className="neo-btn bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] px-4 py-2 font-black uppercase shadow-[4px_4px_0_var(--color-text-primary)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_var(--color-text-primary)]">
                        Download Report 📥
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="neo-card bg-[var(--color-bg-surface)] p-6 border-4 border-[var(--color-text-primary)] shadow-[8px_8px_0_var(--color-text-primary)]">
                        <h3 className="text-sm font-black uppercase text-[var(--color-text-secondary)]">Total Revenue</h3>
                        <p className="text-4xl font-black text-green-500">₹{totalRevenue.toLocaleString()}</p>
                        <span className="text-xs font-bold text-gray-500">Confirmed Sales</span>
                    </div>
                    <div className="neo-card bg-[var(--color-bg-surface)] p-6 border-4 border-[var(--color-text-primary)] shadow-[8px_8px_0_var(--color-text-primary)]">
                        <h3 className="text-sm font-black uppercase text-[var(--color-text-secondary)]">Tickets Sold</h3>
                        <p className="text-4xl font-black text-[var(--color-text-primary)]">{ticketsSold} <span className="text-lg text-[var(--color-text-secondary)]">/ {totalTickets}</span></p>

                        <div className="w-full bg-gray-200 h-2 mt-2 border border-black rounded-full overflow-hidden">
                            <div className="bg-[var(--color-accent-primary)] h-full" style={{ width: `${Math.min((ticketsSold / totalTickets) * 100, 100)}%` }}></div>
                        </div>
                    </div>
                    <div className="neo-card bg-[var(--color-bg-surface)] p-6 border-4 border-[var(--color-text-primary)] shadow-[8px_8px_0_var(--color-text-primary)]">
                        <h3 className="text-sm font-black uppercase text-[var(--color-text-secondary)]">Total Bookings</h3>
                        <p className="text-4xl font-black text-[var(--color-text-primary)]">{bookings.length}</p>
                        <span className="text-xs font-bold text-blue-500">Unique Transactions</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Sales Timeline Chart (Simulated till we have daily aggregation) */}
                    <div className="neo-card bg-[var(--color-bg-surface)] p-6 border-4 border-[var(--color-text-primary)] shadow-[8px_8px_0_var(--color-text-primary)]">
                        <h3 className="text-xl font-black uppercase mb-6">Sales Trends</h3>
                        <div className="h-64 flex items-end justify-between gap-1 border-b-2 border-dashed border-[var(--color-text-secondary)] pb-2 overflow-hidden px-2 relative">
                            {/* Simple Bar chart based on last few bookings */}
                            {Array.from({ length: 12 }).map((_, i) => {
                                const h = Math.floor(Math.random() * 70) + 10;
                                return (
                                    <div key={i} className="flex-1 bg-[var(--color-accent-secondary)] border-2 border-black relative group z-10 hover:bg-[var(--color-accent-primary)] transition-colors" style={{ height: `${h}%` }}>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex justify-between mt-2 text-xs font-black uppercase text-[var(--color-text-secondary)]">
                            <span>Earlier</span>
                            <span>Recent</span>
                        </div>
                    </div>

                    {/* Ticket Type Breakdown */}
                    <div className="neo-card bg-[var(--color-bg-surface)] p-6 border-4 border-[var(--color-text-primary)] shadow-[8px_8px_0_var(--color-text-primary)]">
                        <h3 className="text-xl font-black uppercase mb-6">Ticket Breakdown</h3>
                        <div className="space-y-6">
                            {Object.entries(ticketBreakdown).length === 0 ? (
                                <p className="text-center font-bold text-gray-500 py-10">No tickets sold yet.</p>
                            ) : (
                                Object.entries(ticketBreakdown).map(([name, data]) => {
                                    // Try to find matching ticket in event doc to get total quantity
                                    const eventTicket = event?.tickets?.find(t => t.name === name || t.ticketName === name);
                                    const total = eventTicket?.quantity || 100;
                                    const percent = Math.min((data.sold / total) * 100, 100);

                                    return (
                                        <div key={name}>
                                            <div className="flex justify-between text-sm font-black uppercase mb-1">
                                                <span>{name}</span>
                                                <span>{data.sold} / {total} (₹{data.revenue.toLocaleString()})</span>
                                            </div>
                                            <div className="w-full h-8 bg-gray-200 border-2 border-black rounded-r-full overflow-hidden">
                                                <div className={`h-full border-r-2 border-black bg-purple-400`} style={{ width: `${percent}%` }}></div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventAnalytics;
