import React, { useState } from 'react';

const FAQ = () => {
    const [activeIndex, setActiveIndex] = useState(null);

    const questions = [
        { q: "How do I buy a ticket?", a: "Simply browse our events page, select an event, choose your ticket type, and checkout securely. You'll receive a QR code immediately." },
        { q: "Can I get a refund?", a: "Refund policies are set by individual event organizers. Check the specific event page for details. Generally, platform fees are non-refundable." },
        { q: "Is my payment secure?", a: "Yes. We use industry-standard encryption and trusted payment gateways (Stripe, PayPal) to handle all transactions." },
        { q: "How do I become an organizer?", a: "Click on 'Organizer Login' in the footer, create an account, and complete your profile. Once approved, you can start hosting!" },
    ];

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] pt-24 pb-12 px-4">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl md:text-6xl font-black uppercase text-[var(--color-text-primary)] mb-12 text-center">
                    Freq. Asked Questions
                </h1>

                {/* Accordion */}
                <div className="space-y-4">
                    {questions.map((item, i) => (
                        <div key={i} className="neo-card bg-[var(--color-bg-surface)] border-4 border-[var(--color-text-primary)] shadow-[8px_8px_0_var(--color-text-primary)] overflow-hidden">
                            <button
                                onClick={() => setActiveIndex(activeIndex === i ? null : i)}
                                className="w-full text-left p-6 font-black uppercase text-xl flex justify-between items-center bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-secondary)] transition-colors"
                            >
                                {item.q}
                                <span className="text-2xl transform transition-transform duration-300" style={{ transform: activeIndex === i ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                                    ▼
                                </span>
                            </button>
                            <div
                                className={`px-6 bg-[var(--color-bg-secondary)] border-t-2 border-[var(--color-text-primary)] transition-all duration-300 overflow-hidden ${activeIndex === i ? 'max-h-48 py-6' : 'max-h-0 py-0'}`}
                            >
                                <p className="font-bold text-[var(--color-text-secondary)]">{item.a}</p>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default FAQ;
