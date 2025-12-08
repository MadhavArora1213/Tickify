import React from 'react';

const steps = [
    {
        id: 1,
        title: "Discover",
        description: "Browse thousands of events or search for something specific in your area.",
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        ),
        color: "bg-blue-500"
    },
    {
        id: 2,
        title: "Book Ticket",
        description: "Secure your spot in seconds with our seamless and secure checkout process.",
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
        ),
        color: "bg-purple-500"
    },
    {
        id: 3,
        title: "Enjoy",
        description: "Get ready for an unforgettable experience. Your tickets are always handy.",
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        color: "bg-pink-500"
    }
];

const HowItWorks = () => {
    return (
        <section className="bg-[var(--color-bg-secondary)] py-20 mb-20 relative overflow-hidden border-y-4 border-black">
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-black mb-4 uppercase text-[var(--color-text-primary)]">
                        <span className="block dark:hidden" style={{ WebkitTextStroke: '2px black', color: 'white', textShadow: '4px 4px 0px #000' }}>How It Works</span>
                        <span className="hidden dark:block drop-shadow-[4px_4px_0_var(--color-accent-primary)]">How It Works</span>
                    </h2>
                    <p className="text-[var(--color-text-secondary)] font-bold text-lg max-w-2xl mx-auto border-2 border-dashed border-black p-4 rounded-xl bg-[var(--color-bg-surface)] shadow-[4px_4px_0_black]">Your journey to amazing experiences is just three simple steps away.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-[60px] left-[16%] right-[16%] h-2 bg-black border-2 border-black z-0"></div>

                    {steps.map((step, index) => (
                        <div key={step.id} className="flex flex-col items-center text-center group relative z-10">
                            <div className={`w-32 h-32 rounded-full ${step.color} border-4 border-black shadow-[6px_6px_0_black] flex items-center justify-center mb-6 relative transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 bg-white`}>
                                <div className={`relative z-10 text-black`}>
                                    {step.icon}
                                </div>
                                {/* Step Number Badge */}
                                <div className="absolute -top-2 -right-2 w-10 h-10 bg-black text-white rounded-full border-2 border-white flex items-center justify-center font-black text-lg shadow-lg">
                                    {step.id}
                                </div>
                            </div>

                            <h3 className="text-2xl font-black mb-3 uppercase text-[var(--color-text-primary)] bg-[var(--color-bg-surface)] px-4 py-1 border-2 border-black shadow-[4px_4px_0_black] -rotate-2 group-hover:rotate-0 transition-transform">{step.title}</h3>
                            <p className="text-[var(--color-text-secondary)] leading-relaxed px-4 font-bold">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
