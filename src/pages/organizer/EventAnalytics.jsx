import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

const EventAnalytics = () => {
    const { eventId } = useParams();
    const [period, setPeriod] = useState('7d');

    // Mock Data
    const eventName = "Neon Nights Festival";
    const totalRevenue = 45250;
    const ticketsSold = 854;
    const totalTickets = 1000;

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] pt-24 pb-12">
            <div className="container mx-auto px-4">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                    <div>
                        <Link to="/organizer/events" className="text-xs font-black uppercase underline text-[var(--color-text-secondary)] mb-2 inline-block">&larr; Back to Events</Link>
                        <h1 className="text-3xl md:text-5xl font-black uppercase text-[var(--color-text-primary)]">Analytics: {eventName}</h1>
                    </div>
                    <button className="neo-btn bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] px-4 py-2 font-black uppercase shadow-[4px_4px_0_var(--color-text-primary)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_var(--color-text-primary)]">
                        Download Report 📥
                    </button>
                </div>

                {/* Date Controls */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                    {['24h', '7d', '30d', 'All Time'].map(p => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-4 py-2 font-black uppercase border-2 transition-all
                            ${period === p
                                    ? 'bg-[var(--color-accent-primary)] text-white border-black shadow-[2px_2px_0_black]'
                                    : 'bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] border-[var(--color-text-primary)] hover:bg-[var(--color-text-primary)] hover:text-[var(--color-bg-primary)]'}`}
                        >
                            {p}
                        </button>
                    ))}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="neo-card bg-[var(--color-bg-surface)] p-6 border-4 border-[var(--color-text-primary)] shadow-[8px_8px_0_var(--color-text-primary)]">
                        <h3 className="text-sm font-black uppercase text-[var(--color-text-secondary)]">Total Revenue</h3>
                        <p className="text-4xl font-black text-[var(--color-success)]">${totalRevenue.toLocaleString()}</p>
                        <span className="text-xs font-bold text-green-600">▲ 12% vs last period</span>
                    </div>
                    <div className="neo-card bg-[var(--color-bg-surface)] p-6 border-4 border-[var(--color-text-primary)] shadow-[8px_8px_0_var(--color-text-primary)]">
                        <h3 className="text-sm font-black uppercase text-[var(--color-text-secondary)]">Tickets Sold</h3>
                        <p className="text-4xl font-black text-[var(--color-text-primary)]">{ticketsSold} <span className="text-lg text-[var(--color-text-secondary)]">/ {totalTickets}</span></p>

                        <div className="w-full bg-gray-200 h-2 mt-2 border border-black rounded-full overflow-hidden">
                            <div className="bg-[var(--color-accent-primary)] h-full" style={{ width: `${(ticketsSold / totalTickets) * 100}%` }}></div>
                        </div>
                    </div>
                    <div className="neo-card bg-[var(--color-bg-surface)] p-6 border-4 border-[var(--color-text-primary)] shadow-[8px_8px_0_var(--color-text-primary)]">
                        <h3 className="text-sm font-black uppercase text-[var(--color-text-secondary)]">Page Views</h3>
                        <p className="text-4xl font-black text-[var(--color-text-primary)]">12.5k</p>
                        <span className="text-xs font-bold text-red-500">▼ 3% vs last period</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Sales Timeline Chart (Simulated) */}
                    <div className="neo-card bg-[var(--color-bg-surface)] p-6 border-4 border-[var(--color-text-primary)] shadow-[8px_8px_0_var(--color-text-primary)]">
                        <h3 className="text-xl font-black uppercase mb-6">Sales Trends</h3>
                        <div className="h-64 flex items-end justify-between gap-2 border-b-2 border-dashed border-[var(--color-text-secondary)] pb-2 overflow-hidden px-2 relative">
                            {/* Horizontal Grid Lines */}
                            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 z-0">
                                <div className="border-t border-black w-full"></div>
                                <div className="border-t border-black w-full"></div>
                                <div className="border-t border-black w-full"></div>
                                <div className="border-t border-black w-full"></div>
                            </div>

                            {[30, 45, 25, 60, 80, 55, 90, 70, 40, 65, 85, 95].map((h, i) => (
                                <div key={i} className="w-full bg-[var(--color-accent-secondary)] border-2 border-black relative group z-10 hover:bg-[var(--color-accent-primary)] transition-colors" style={{ height: `${h}%` }}>
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none">
                                        ${h * 100}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-2 text-xs font-black uppercase text-[var(--color-text-secondary)]">
                            <span>Day 1</span>
                            <span>Day 12</span>
                        </div>
                    </div>

                    {/* Ticket Type Breakdown */}
                    <div className="neo-card bg-[var(--color-bg-surface)] p-6 border-4 border-[var(--color-text-primary)] shadow-[8px_8px_0_var(--color-text-primary)]">
                        <h3 className="text-xl font-black uppercase mb-6">Ticket Breakdown</h3>
                        <div className="space-y-4">
                            {[
                                { name: "Early Bird", sold: 200, total: 200, color: "bg-purple-400" },
                                { name: "General Admission", sold: 550, total: 600, color: "bg-blue-400" },
                                { name: "VIP Pass", sold: 104, total: 200, color: "bg-yellow-400" }
                            ].map((type) => (
                                <div key={type.name}>
                                    <div className="flex justify-between text-sm font-black uppercase mb-1">
                                        <span>{type.name}</span>
                                        <span>{type.sold} / {type.total}</span>
                                    </div>
                                    <div className="w-full h-6 bg-gray-200 border-2 border-black rounded-r-full overflow-hidden">
                                        <div className={`h-full border-r-2 border-black ${type.color}`} style={{ width: `${(type.sold / type.total) * 100}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t-2 border-dashed border-[var(--color-text-secondary)]">
                            <h4 className="font-black uppercase mb-4">Attendee Demographics</h4>
                            <div className="flex gap-4">
                                <div className="flex-1 text-center p-2 bg-gray-100 border-2 border-black">
                                    <span className="block text-2xl font-black">24-35</span>
                                    <span className="text-xs uppercase">Top Age</span>
                                </div>
                                <div className="flex-1 text-center p-2 bg-gray-100 border-2 border-black">
                                    <span className="block text-2xl font-black">NYC</span>
                                    <span className="text-xs uppercase">Top City</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventAnalytics;
