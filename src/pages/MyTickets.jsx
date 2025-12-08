import React, { useState } from 'react';

const MyTickets = () => {
    const [activeTab, setActiveTab] = useState('upcoming');

    // Mock Data
    const TICKETS = [
        {
            id: 1,
            title: "Neon Nights Music Festival",
            date: "MAR 15, 2025",
            time: "8:00 PM",
            location: "Cyber Arena, NY",
            type: "General Admission",
            status: "upcoming",
            image: "https://images.unsplash.com/photo-1470229722913-7ea2d9865154?q=80&w=2070&auto=format&fit=crop",
            qrCode: "🏁" // Placeholder for QR
        },
        {
            id: 2,
            title: "Future Tech Summit 2025",
            date: "APR 22, 2025",
            time: "10:00 AM",
            location: "Silicon Valley Center",
            type: "VIP Pass",
            status: "upcoming",
            image: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=2070&auto=format&fit=crop",
            qrCode: "🏁"
        },
        {
            id: 3,
            title: "Vintage Rock Concert",
            date: "DEC 12, 2024",
            time: "7:00 PM",
            location: "The Old Garage",
            type: "Backstage Pass",
            status: "past",
            image: "https://images.unsplash.com/photo-1459749411177-05be25402f0f?q=80&w=2070&auto=format&fit=crop",
            qrCode: "🏁"
        }
    ];

    const filteredTickets = TICKETS.filter(t => t.status === activeTab);

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] pt-36 pb-24">
            <div className="container mx-auto px-4">
                {/* Header */}
                <h1 className="text-4xl md:text-6xl font-black mb-12 uppercase text-center text-[var(--color-text-primary)]">
                    <span className="block dark:hidden" style={{ WebkitTextStroke: '2px black', color: 'white', textShadow: '4px 4px 0px #000' }}>My Tickets</span>
                    <span className="hidden dark:block drop-shadow-[4px_4px_0_var(--color-accent-primary)]">My Tickets</span>
                </h1>

                {/* Tabs */}
                <div className="flex justify-center gap-4 mb-12">
                    <button
                        onClick={() => setActiveTab('upcoming')}
                        className={`px-8 py-3 font-black uppercase border-2 border-black shadow-[4px_4px_0_black] transition-all
                        ${activeTab === 'upcoming' ? 'bg-[var(--color-accent-primary)] text-white translate-x-[-2px] translate-y-[-2px] shadow-[6px_6px_0_black]' : 'bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] hover:bg-gray-100'}`}
                    >
                        Upcoming
                    </button>
                    <button
                        onClick={() => setActiveTab('past')}
                        className={`px-8 py-3 font-black uppercase border-2 border-black shadow-[4px_4px_0_black] transition-all
                        ${activeTab === 'past' ? 'bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] translate-x-[-2px] translate-y-[-2px] shadow-[6px_6px_0_black]' : 'bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] hover:bg-gray-100'}`}
                    >
                        Past Events
                    </button>
                </div>

                {/* Tickets List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                    {filteredTickets.length > 0 ? (
                        filteredTickets.map(ticket => (
                            <div key={ticket.id} className="group relative">
                                {/* Ticket Card - Mimics a physical ticket with split design */}
                                <div className="neo-card bg-[var(--color-bg-surface)] flex flex-col md:flex-row border-4 border-black shadow-[8px_8px_0_black] overflow-hidden">

                                    {/* Left Side: Event Info */}
                                    <div className="flex-1 p-6 flex flex-col justify-between relative">
                                        {/* Perforated Line Decoration (Mobile: Bottom, Desktop: Right) */}
                                        <div className="hidden md:block absolute right-[-2px] top-0 bottom-0 border-r-4 border-dashed border-black z-10"></div>
                                        <div className="md:hidden absolute bottom-[-2px] left-0 right-0 border-b-4 border-dashed border-black z-10"></div>

                                        <div className="flex justify-between items-start mb-4">
                                            <span className="inline-block px-3 py-1 bg-[var(--color-accent-secondary)] text-white text-xs font-black uppercase border-2 border-black transform -rotate-1">
                                                {ticket.type}
                                            </span>
                                            <span className="text-xs font-black text-[var(--color-text-secondary)] uppercase bg-[var(--color-bg-secondary)] px-2 py-1 rounded border border-black">
                                                ID: #{ticket.id}8294
                                            </span>
                                        </div>

                                        <div className="mb-4">
                                            <h3 className="text-2xl font-black text-[var(--color-text-primary)] uppercase leading-none mb-2">{ticket.title}</h3>
                                            <div className="flex items-center gap-4 text-sm font-bold text-[var(--color-text-secondary)]">
                                                <span className="flex items-center gap-1">
                                                    📅 {ticket.date}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    ⏰ {ticket.time}
                                                </span>
                                            </div>
                                            <div className="mt-1 text-sm font-bold text-[var(--color-text-secondary)] flex items-center gap-1">
                                                📍 {ticket.location}
                                            </div>
                                        </div>

                                        <div className="flex gap-2 mt-auto">
                                            <button className="flex-1 neo-btn bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] px-2 py-2 text-xs uppercase shadow-[2px_2px_0_black] hover:shadow-[4px_4px_0_black]">
                                                Download
                                            </button>
                                            <button className="flex-1 neo-btn bg-white text-black px-2 py-2 text-xs uppercase shadow-[2px_2px_0_black] hover:shadow-[4px_4px_0_black]">
                                                Transfer
                                            </button>
                                        </div>
                                    </div>

                                    {/* Right Side: QR Code Stub */}
                                    <div className="w-full md:w-48 bg-[var(--color-bg-secondary)] p-6 flex flex-col items-center justify-center border-l-0 md:border-l-4 border-t-4 md:border-t-0 border-black relative">
                                        {/* Half circles for 'tear' effect */}
                                        <div className="absolute -top-3 left-1/2 md:-left-3 md:top-1/2 w-6 h-6 bg-[var(--color-bg-primary)] rounded-full border-b-4 md:border-r-4 border-black transform -translate-x-1/2 md:translate-x-0 md:-translate-y-1/2"></div>
                                        <div className="absolute -bottom-3 left-1/2 md:-right-3 md:top-1/2 w-6 h-6 bg-[var(--color-bg-primary)] rounded-full border-t-4 md:border-l-4 border-black transform -translate-x-1/2 md:translate-x-0 md:-translate-y-1/2"></div>

                                        <div className="bg-white p-2 border-2 border-black mb-2">
                                            {/* Simulate QR Code */}
                                            <div className="w-24 h-24 bg-black flex items-center justify-center text-white text-4xl">
                                                {ticket.qrCode}
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-black uppercase text-center text-gray-500">
                                            Scan for Entry
                                        </span>
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
