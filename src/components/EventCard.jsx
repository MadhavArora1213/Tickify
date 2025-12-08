import React from 'react';

const EventCard = ({ event }) => {
    return (
        <div className="group bg-[var(--color-bg-surface)] rounded-2xl overflow-hidden border border-[var(--color-neutral-200)]/10 hover:border-[var(--color-accent-primary)]/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            {/* Image Container */}
            <div className="relative h-48 bg-gray-200 overflow-hidden">
                {event.image ? (
                    <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 group-hover:scale-110 transition-transform duration-500 flex items-center justify-center text-white text-opacity-50 text-4xl font-bold">
                        {event.title[0]}
                    </div>
                )}
                <div className="absolute top-4 right-4 bg-[var(--color-bg-surface)]/90 backdrop-blur text-[var(--color-text-primary)] text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    {event.category}
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-[var(--color-accent-primary)] text-sm font-bold uppercase tracking-wider">{event.date}</span>
                    <span className="text-[var(--color-text-muted)] text-sm">{event.price}</span>
                </div>

                <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2 line-clamp-1 group-hover:text-[var(--color-accent-primary)] transition-colors">
                    {event.title}
                </h3>

                <p className="text-[var(--color-text-secondary)] text-sm mb-4 line-clamp-2">
                    {event.description}
                </p>

                <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center text-[var(--color-text-muted)] text-sm">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        {event.location}
                    </div>
                    <button className="text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] p-2 rounded-full transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EventCard;
