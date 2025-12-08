import React from 'react';

const testimonials = [
    {
        id: 1,
        name: "Alex Morgan",
        role: "Music Lover",
        content: "Tickify made it super easy to find tickets for the sold-out synthwave concert. The interface is just so fun to use!",
        avatar: "A"
    },
    {
        id: 2,
        name: "Sarah Chen",
        role: "Event Organizer",
        content: "Listing my art workshop was a breeze. I love how professional my event page looks. Highly recommended!",
        avatar: "S"
    },
    {
        id: 3,
        name: "James Doe",
        role: "Concert Goer",
        content: "The best platform for discovering local events. I've found so many hidden gems here. 5 stars!",
        avatar: "J"
    }
];

const Testimonials = () => {
    return (
        <section className="container mx-auto px-4 mb-24">
            <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-black mb-2 uppercase">
                    <span className="block dark:hidden" style={{ WebkitTextStroke: '2px black', color: 'white', textShadow: '4px 4px 0px #000' }}>What People Say</span>
                    <span className="hidden dark:block drop-shadow-[4px_4px_0_var(--color-accent-primary)]">What People Say</span>
                </h2>
                <p className="text-[var(--color-text-secondary)] font-bold text-lg bg-[var(--color-bg-surface)] inline-block px-4 py-1 border-2 border-black rotate-1">Hear from our community of event lovers.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonials.map((testimonial) => (
                    <div key={testimonial.id} className="flex flex-col items-center">
                        {/* Bubble */}
                        <div className="bg-[var(--color-bg-surface)] p-8 rounded-xl border-4 border-black shadow-[8px_8px_0_black] relative mb-8 hover:-translate-y-2 hover:shadow-[12px_12px_0_black] transition-all duration-300 transform rotate-1 hover:rotate-0">
                            <div className="text-[var(--color-accent-primary)] text-6xl font-black absolute -top-6 -left-2 opacity-100 drop-shadow-[2px_2px_0_black]">"</div>
                            <p className="text-[var(--color-text-primary)] font-bold text-lg italic relative z-10">
                                {testimonial.content}
                            </p>
                            {/* Triangle */}
                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-[var(--color-bg-surface)] transform rotate-45 border-b-4 border-r-4 border-black"></div>
                        </div>

                        {/* User */}
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-[var(--color-accent-primary)] border-4 border-black flex items-center justify-center text-white font-black text-2xl shadow-[4px_4px_0_black]">
                                {testimonial.avatar}
                            </div>
                            <div className="text-left">
                                <h4 className="font-black text-xl uppercase text-[var(--color-text-primary)]">{testimonial.name}</h4>
                                <span className="text-xs font-bold bg-black text-white px-2 py-1 rounded-sm uppercase tracking-wide">{testimonial.role}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Testimonials;
