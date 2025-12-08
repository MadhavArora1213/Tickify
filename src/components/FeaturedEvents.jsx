import React from 'react';
import TiltedCard from './react-bits/TiltedCard';

const events = [
    {
        id: 1,
        title: "Neon Cyber Party 2077",
        date: "DEC 12 • 8:00 PM",
        price: "$45",
        location: "Cyber Hub, NY",
        category: "Music",
        description: "Experience the future of partying with neon lights, synthwave music, and holographic performances.",
        image: null
    },
    {
        id: 2,
        title: "Tech Innovators Summit",
        date: "JAN 15 • 9:00 AM",
        price: "$120",
        location: "Convention Center, SF",
        category: "Tech",
        description: "Join the brightest minds in tech for a day of innovation, networking, and groundbreaking talks.",
        image: null
    },
    {
        id: 3,
        title: "Abstract Art Workshop",
        date: "DEC 20 • 2:00 PM",
        price: "$30",
        location: "Art Lofts, Chicago",
        category: "Arts",
        description: "Unleash your creativity in this hands-on workshop led by renowned abstract artist Jane Doe.",
        image: null
    },
    {
        id: 4,
        title: "Global Food Festival",
        date: "FEB 05 • 11:00 AM",
        price: "Free",
        location: "City Park, Austin",
        category: "Food",
        description: "Taste dishes from around the world at the biggest food festival of the year.",
        image: null
    }
];

const FeaturedEvents = () => {
    return (
        <section className="container mx-auto px-4 mb-24">
            <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
                <div>
                    <h2 className="text-4xl md:text-5xl font-black mb-2 uppercase">
                        <span className="block dark:hidden" style={{ WebkitTextStroke: '2px black', color: 'white', textShadow: '4px 4px 0px #000' }}>Featured Events</span>
                        <span className="hidden dark:block drop-shadow-[4px_4px_0_var(--color-accent-primary)]">Featured Events</span>
                    </h2>
                    <p className="text-[var(--color-text-secondary)] font-bold text-lg border-l-4 border-[var(--color-accent-primary)] pl-4">Curated picks just for you.</p>
                </div>
                <a href="#" className="hidden md:block neo-btn px-6 py-2 bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] text-sm hover:bg-[var(--color-accent-primary)] hover:text-white transition-colors">VIEW ALL EVENTS -&gt;</a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {events.map(event => (
                    <div
                        key={event.id}
                        className="group relative flex flex-col h-[400px] border-4 border-black bg-white rounded-xl overflow-hidden shadow-[8px_8px_0_black] transition-all hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[12px_12px_0_black]"
                    >
                        {/* Image Section */}
                        <div className="h-56 overflow-hidden relative border-b-4 border-black">
                            <img
                                src={event.image || `https://placehold.co/400x500/1e293b/ffffff?text=${event.title.charAt(0)}`}
                                alt={event.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute top-2 right-2 bg-[var(--color-accent-secondary)] text-white text-xs font-black uppercase px-2 py-1 border-2 border-black rotate-3">
                                {event.category}
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="p-4 flex-1 flex flex-col bg-[var(--color-bg-surface)]">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-black uppercase tracking-wider text-[var(--color-text-muted)]">{event.date}</span>
                                <span className="text-sm font-black bg-[var(--color-accent-primary)] text-white px-2 py-0.5 rounded-sm border border-black transform -rotate-2">{event.price}</span>
                            </div>

                            <h3 className="text-xl font-black mb-2 leading-tight uppercase text-[var(--color-text-primary)] line-clamp-2">{event.title}</h3>
                            <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2 mb-4 font-medium border-l-2 border-[var(--color-neutral-200)] pl-2">{event.description}</p>

                            <div className="mt-auto flex items-center text-xs font-bold text-[var(--color-text-muted)] uppercase">
                                <svg className="w-4 h-4 mr-1 text-[var(--color-accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                                {event.location}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-8 text-center md:hidden">
                <a href="#" className="neo-btn px-6 py-3 bg-[var(--color-bg-surface)] text-[var(--color-text-primary)]">VIEW ALL EVENTS -&gt;</a>
            </div>
        </section>
    );
};

export default FeaturedEvents;
