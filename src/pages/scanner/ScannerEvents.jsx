import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ScannerEvents = () => {
    // Mock Assigned Events
    const events = [
        { id: 1, title: 'Neon Nights Festival', date: 'Today, 8:00 PM', location: 'Gate A', status: 'live' },
        { id: 2, title: 'VIP Afterparty', date: 'Tonight, 11:00 PM', location: 'Club Zenith', status: 'upcoming' },
    ];

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] p-4 pt-12">
            <div className="max-w-md mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-black uppercase text-[var(--color-text-primary)]">Select Event</h1>
                    <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-black border-2 border-white shadow-[2px_2px_0_black]">User</div>
                </div>

                <div className="space-y-4">
                    {events.map((event) => (
                        <div key={event.id} className="neo-card bg-[var(--color-bg-surface)] border-4 border-black p-6 shadow-[6px_6px_0_black] relative overflow-hidden group">
                            {event.status === 'live' && (
                                <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-black uppercase px-2 py-1 border-b-2 border-l-2 border-black">
                                    🔴 Live Now
                                </div>
                            )}

                            <h3 className="text-xl font-black uppercase mb-1">{event.title}</h3>
                            <p className="font-bold text-[var(--color-text-secondary)] text-sm mb-4">{event.date} • {event.location}</p>

                            <Link to="/scanner/scan" className="block text-center w-full py-3 bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] font-black uppercase border-2 border-[var(--color-bg-primary)] group-hover:bg-[var(--color-accent-primary)] group-hover:text-white transition-colors">
                                Start Scanning &rarr;
                            </Link>
                        </div>
                    ))}

                    {/* Placeholder for no events */}
                    <div className="neo-card bg-[var(--color-bg-secondary)] border-2 border-dashed border-black p-6 text-center opacity-50">
                        <span className="text-2xl">📅</span>
                        <p className="font-black uppercase mt-2">No other events assigned</p>
                    </div>
                </div>

                <button className="w-full mt-8 py-3 bg-red-500 text-white font-black uppercase border-4 border-black shadow-[4px_4px_0_black]">
                    Log Out
                </button>
            </div>
        </div>
    );
};

export default ScannerEvents;
