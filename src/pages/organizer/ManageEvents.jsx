import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ManageEvents = () => {
    const [filter, setFilter] = useState('all');

    // Mock Events Data
    const events = [
        { id: 1, title: 'Neon Nights Festival', date: 'Mar 15, 2025', status: 'published', sold: 450, total: 600, revenue: '$22,500' },
        { id: 2, title: 'Future Tech Summit', date: 'Apr 22, 2025', status: 'draft', sold: 0, total: 200, revenue: '$0' },
        { id: 3, title: 'Indie Art Showcase', date: 'Jun 10, 2025', status: 'past', sold: 120, total: 120, revenue: '$3,600' },
        { id: 4, title: 'Cyberpunk Workshop', date: 'Jul 05, 2025', status: 'published', sold: 15, total: 50, revenue: '$750' },
    ];

    const filteredEvents = filter === 'all' ? events : events.filter(e => e.status === filter);

    const getStatusColor = (status) => {
        switch (status) {
            case 'published': return 'bg-green-400 text-black border-black';
            case 'draft': return 'bg-gray-300 text-gray-700 border-gray-500';
            case 'past': return 'bg-red-300 text-red-900 border-red-900';
            default: return 'bg-white text-black';
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] pt-24 pb-12">
            <div className="container mx-auto px-4">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
                    <div>
                        <Link to="/organizer/dashboard" className="text-xs font-black uppercase underline text-[var(--color-text-secondary)] mb-2 inline-block">&larr; Dashboard</Link>
                        <h1 className="text-4xl md:text-5xl font-black uppercase text-[var(--color-text-primary)]">Manage Events</h1>
                    </div>
                    <Link to="/organizer/events/create" className="neo-btn bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] px-6 py-3 font-black uppercase shadow-[4px_4px_0_var(--color-text-secondary)] hover:shadow-[6px_6px_0_var(--color-text-primary)] hover:translate-x-[-2px] hover:translate-y-[-2px]">
                        Create New Event +
                    </Link>
                </div>

                {/* Filters */}
                <div className="neo-card bg-[var(--color-bg-surface)] border-4 border-[var(--color-text-primary)] p-4 mb-8 flex flex-col md:flex-row gap-4 justify-between items-center shadow-[8px_8px_0_var(--color-text-primary)]">
                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        {['all', 'published', 'draft', 'past'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 font-black uppercase border-2 transition-all
                                ${filter === f
                                        ? 'bg-[var(--color-accent-primary)] text-white border-black shadow-[2px_2px_0_black]'
                                        : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] border-[var(--color-text-primary)] hover:bg-[var(--color-text-primary)] hover:text-[var(--color-bg-primary)]'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                    <div className="w-full md:w-64 relative">
                        <input type="text" placeholder="Search events..." className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] pl-10 pr-4 py-2 font-bold text-[var(--color-text-primary)]" />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">🔍</span>
                    </div>
                </div>

                {/* Events List */}
                <div className="grid grid-cols-1 gap-6">
                    {filteredEvents.map(event => (
                        <div key={event.id} className="neo-card bg-[var(--color-bg-surface)] border-4 border-[var(--color-text-primary)] p-6 shadow-[6px_6px_0_var(--color-text-primary)] flex flex-col md:flex-row justify-between items-center gap-6 group hover:translate-x-1 transition-transform">

                            {/* Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={`text-[10px] font-black uppercase px-2 py-1 border-2 rounded ${getStatusColor(event.status)}`}>
                                        {event.status}
                                    </span>
                                    <span className="text-xs font-bold text-[var(--color-text-secondary)]">{event.date}</span>
                                </div>
                                <h3 className="text-2xl font-black uppercase text-[var(--color-text-primary)] leading-none">{event.title}</h3>
                            </div>

                            {/* Stats */}
                            <div className="flex gap-8 text-center border-l-0 md:border-l-4 border-dotted border-[var(--color-text-secondary)] pl-0 md:pl-8 py-2 w-full md:w-auto justify-around md:justify-start">
                                <div>
                                    <span className="block text-2xl font-black text-[var(--color-text-primary)]">{event.sold}/{event.total}</span>
                                    <span className="text-[10px] font-black uppercase text-[var(--color-text-secondary)]">Sold</span>
                                </div>
                                <div>
                                    <span className="block text-2xl font-black text-[var(--color-success)]">{event.revenue}</span>
                                    <span className="text-[10px] font-black uppercase text-[var(--color-text-secondary)]">Revenue</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 w-full md:w-auto">
                                <button className="flex-1 md:flex-none neo-btn bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] p-3 hover:bg-[var(--color-text-primary)] hover:text-white transition-colors" title="Edit">
                                    ✏️
                                </button>
                                <Link to={`/organizer/events/${event.id}/analytics`} className="flex-1 md:flex-none neo-btn bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] p-3 hover:bg-[var(--color-text-primary)] hover:text-white transition-colors" title="Analytics">
                                    📊
                                </Link>
                                <button className="flex-1 md:flex-none neo-btn bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] p-3 hover:bg-[var(--color-error)] hover:text-white hover:border-[var(--color-error)] transition-colors" title="Delete">
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}

                    {filteredEvents.length === 0 && (
                        <div className="text-center py-20 neo-card bg-[var(--color-bg-surface)] border-4 border-dashed border-[var(--color-text-secondary)]">
                            <span className="text-4xl block mb-4">🌪️</span>
                            <p className="font-black text-xl text-[var(--color-text-primary)] uppercase">No events found</p>
                            <p className="font-bold text-[var(--color-text-secondary)]">Try adjusting your search or filters.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ManageEvents;
