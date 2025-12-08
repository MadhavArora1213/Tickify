import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import ShinyText from '../components/react-bits/ShinyText';
import SpotlightCard from '../components/react-bits/SpotlightCard';

const EventDetails = () => {
    const { id } = useParams();
    const [ticketQuantity, setTicketQuantity] = useState(1);
    const [selectedTicket, setSelectedTicket] = useState('standard');

    // Mock Data
    const event = {
        title: "Neon Nights Music Festival",
        date: "March 15, 2025",
        time: "8:00 PM - 2:00 AM",
        location: "Cyber Arena, New York",
        price: 120,
        image: "https://images.unsplash.com/photo-1470229722913-7ea2d9865154?q=80&w=2070&auto=format&fit=crop",
        organizer: "Electric Dreams Co.",
        description: "Prepare for an immersive sonic journey at Neon Nights. Featuring top-tier DJs from around the globe, this festival combines cutting-edge visual mapping technology with earth-shattering bass lines. Experience the future of live music in a fully interactive cyber-arena.",
        lineup: ["Synthetix", "CyberPunk", "BassDrop", "NeonWave"],
        tickets: [
            { id: 'standard', name: 'General Admission', price: 120, features: ['Entry to festival', 'Access to main floor'] },
            { id: 'vip', name: 'VIP Pass', price: 250, features: ['Fast-track entry', 'VIP Lounge Access', 'Free Drinks'] },
            { id: 'backstage', name: 'Backstage Access', price: 500, features: ['Meet & Greet', 'Backstage Tour', 'All VIP perks'] },
        ]
    };

    const handleQuantityChange = (delta) => {
        setTicketQuantity(Math.max(1, ticketQuantity + delta));
    };

    const currentTicketPrice = event.tickets.find(t => t.id === selectedTicket)?.price || 0;
    const totalPrice = currentTicketPrice * ticketQuantity;

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] pb-20 pt-36">
            {/* Banner */}
            <div className="relative h-[50vh] w-full mx-auto container px-4 mb-8">
                <div className="w-full h-full rounded-3xl overflow-hidden border-4 border-black shadow-[12px_12px_0_black] relative group">
                    {/* Image */}
                    <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Overlay Content */}
                    <div className="absolute bottom-0 left-0 w-full z-20 p-8 bg-gradient-to-t from-black via-black/80 to-transparent">
                        <div className="max-w-4xl">
                            <span className="inline-block px-4 py-2 bg-[var(--color-accent-primary)] text-white text-sm font-black uppercase tracking-wider border-2 border-white shadow-[4px_4px_0_white] mb-4 transform -rotate-2">
                                Music Festival
                            </span>
                            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 uppercase drop-shadow-[4px_4px_0_black]">
                                {event.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-6 text-white font-bold text-lg">
                                <div className="flex items-center gap-2 bg-black/50 px-3 py-1 rounded border-2 border-white/50">
                                    <svg className="w-5 h-5 text-[var(--color-accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                    {event.date}
                                </div>
                                <div className="flex items-center gap-2 bg-black/50 px-3 py-1 rounded border-2 border-white/50">
                                    <svg className="w-5 h-5 text-[var(--color-accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    {event.time}
                                </div>
                                <div className="flex items-center gap-2 bg-black/50 px-3 py-1 rounded border-2 border-white/50">
                                    <svg className="w-5 h-5 text-[var(--color-accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                    {event.location}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-4 relative z-30">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Content */}
                    <div className="flex-1 space-y-8">
                        {/* Description */}
                        <div className="neo-card bg-[var(--color-bg-surface)] p-8">
                            <h2 className="text-2xl font-black text-[var(--color-text-primary)] mb-4 uppercase decoration-4 underline decoration-[var(--color-accent-secondary)]">
                                <span className="block dark:hidden" style={{ WebkitTextStroke: '1px black', color: 'white', textShadow: '2px 2px 0px #000' }}>About the Event</span>
                                <span className="hidden dark:block">About the Event</span>
                            </h2>
                            <p className="text-[var(--color-text-secondary)] leading-relaxed text-lg font-medium">
                                {event.description}
                            </p>
                        </div>

                        {/* Lineup */}
                        <div className="neo-card bg-[var(--color-bg-surface)] p-8">
                            <h2 className="text-2xl font-black text-[var(--color-text-primary)] mb-6 uppercase decoration-4 underline decoration-[var(--color-accent-secondary)]">
                                <span className="block dark:hidden" style={{ WebkitTextStroke: '1px black', color: 'white', textShadow: '2px 2px 0px #000' }}>The Lineup</span>
                                <span className="hidden dark:block">The Lineup</span>
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {event.lineup.map((artist, idx) => (
                                    <div key={idx} className="neo-card bg-[var(--color-bg-secondary)] p-4 text-center hover:scale-105 transition-transform flex flex-col items-center">
                                        <div className="w-20 h-20 rounded-full border-4 border-black bg-[var(--color-accent-primary)] mb-3 flex items-center justify-center text-3xl shadow-[4px_4px_0_black]">
                                            😎
                                        </div>
                                        <span className="font-black text-[var(--color-text-primary)] text-lg uppercase">{artist}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Organizer */}
                        <div className="neo-card bg-[var(--color-bg-surface)] p-8 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-black text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">Organizer</h3>
                                <p className="text-2xl font-black text-[var(--color-text-primary)]">{event.organizer}</p>
                            </div>
                            <button className="neo-btn px-6 py-3 bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] text-sm">
                                View Profile
                            </button>
                        </div>
                    </div>

                    {/* Booking Sidebar */}
                    <div className="w-full lg:w-[400px] flex-shrink-0">
                        <div className="sticky top-24">
                            <div className="neo-card bg-[var(--color-bg-surface)] p-8 border-4 border-[var(--color-accent-primary)] shadow-[12px_12px_0_rgba(0,0,0,1)]">
                                <h3 className="text-2xl font-black text-[var(--color-text-primary)] mb-6 uppercase">
                                    <span className="block dark:hidden" style={{ WebkitTextStroke: '1px black', color: 'white', textShadow: '2px 2px 0px #000' }}>Get Tickets</span>
                                    <span className="hidden dark:block">Get Tickets</span>
                                </h3>

                                <div className="space-y-4 mb-8">
                                    {event.tickets.map(ticket => (
                                        <div
                                            key={ticket.id}
                                            onClick={() => setSelectedTicket(ticket.id)}
                                            className={`cursor-pointer rounded-xl p-4 border-4 transition-all ${selectedTicket === ticket.id ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10 shadow-[4px_4px_0_var(--color-accent-primary)] translate-x-[-2px] translate-y-[-2px]' : 'border-[var(--color-neutral-200)] hover:border-black hover:shadow-[4px_4px_0_black]'}`}
                                        >
                                            <div className="flex justify-between items-center mb-2">
                                                <span className={`font-black uppercase ${selectedTicket === ticket.id ? 'text-[var(--color-accent-primary)]' : 'text-[var(--color-text-primary)]'}`}>{ticket.name}</span>
                                                <span className="text-xl font-black text-[var(--color-text-primary)]">${ticket.price}</span>
                                            </div>
                                            <ul className="text-xs font-bold text-[var(--color-text-muted)] space-y-1">
                                                {ticket.features.map((f, i) => (
                                                    <li key={i} className="flex items-center gap-2">
                                                        <span className="text-green-500 text-lg">✓</span>
                                                        {f}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between mb-8 pb-8 border-b-4 border-dashed border-[var(--color-neutral-200)]">
                                    <span className="font-black text-[var(--color-text-primary)] uppercase">Quantity</span>
                                    <div className="flex items-center gap-4 bg-[var(--color-bg-secondary)] rounded p-2 border-2 border-black shadow-[2px_2px_0_black]">
                                        <button
                                            onClick={() => handleQuantityChange(-1)}
                                            className="w-8 h-8 flex items-center justify-center font-black hover:bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] rounded"
                                        >
                                            -
                                        </button>
                                        <span className="font-black w-6 text-center text-[var(--color-text-primary)] text-xl">{ticketQuantity}</span>
                                        <button
                                            onClick={() => handleQuantityChange(1)}
                                            className="w-8 h-8 flex items-center justify-center font-black hover:bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] rounded"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-xl font-black uppercase">
                                        <span className="text-[var(--color-text-secondary)]">Total</span>
                                        <span className="text-3xl text-[var(--color-text-primary)]">${totalPrice}</span>
                                    </div>
                                    <button className="neo-btn w-full py-4 bg-[var(--color-accent-primary)] text-white text-xl shadow-[6px_6px_0_black] hover:shadow-[8px_8px_0_black] hover:translate-x-[-2px] hover:translate-y-[-2px] active:shadow-[0_0_0_black] active:translate-x-[0] active:translate-y-[0]">
                                        CHECKOUT NOW -&gt;
                                    </button>
                                    <p className="text-xs text-center font-bold text-[var(--color-text-muted)] mt-2">
                                        POWERED BY TICKIFY
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetails;
