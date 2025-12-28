import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const FAQSection = () => {
    const [activeIndex, setActiveIndex] = useState(null);

    // Top 6 most common questions for homepage
    const topQuestions = [
        {
            q: "How do I buy a ticket?",
            a: "Browse events, select your preferred event, choose ticket type and quantity, and checkout securely. Your e-ticket with QR code will be sent instantly to your email."
        },
        {
            q: "Can I get a refund?",
            a: "Refund policies are set by individual event organizers. Check the specific event page for details. Platform convenience fees are generally non-refundable."
        },
        {
            q: "Is my payment secure?",
            a: "Yes! We use industry-standard SSL encryption and are PCI DSS compliant. We accept cards, UPI, net banking, and popular wallets."
        },
        {
            q: "Where can I find my tickets?",
            a: "Your tickets are available in 'My Tickets' section of your account and also sent to your registered email after purchase."
        },
        {
            q: "How do I become an event organizer?",
            a: "Click 'Organizer Login', create an account, complete your profile with verification documents, and wait for admin approval (24-48 hours)."
        },
        {
            q: "What if I didn't receive my confirmation email?",
            a: "Check spam/junk folder first. You can also download tickets directly from 'My Tickets' in your account. Contact support if issues persist."
        },
    ];

    return (
        <section className="py-20 px-4 bg-[var(--color-bg-secondary)]">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <span className="inline-block bg-yellow-400 text-black px-4 py-1 font-black uppercase text-sm border-2 border-black mb-4">
                        Got Questions?
                    </span>
                    <h2 className="text-4xl md:text-5xl font-black uppercase text-[var(--color-text-primary)] mb-4">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-lg font-bold text-[var(--color-text-secondary)]">
                        Quick answers to common questions
                    </p>
                </div>

                {/* FAQ Accordion */}
                <div className="space-y-4 mb-10">
                    {topQuestions.map((item, i) => (
                        <div
                            key={i}
                            className="neo-card bg-[var(--color-bg-surface)] border-4 border-[var(--color-text-primary)] shadow-[6px_6px_0_var(--color-text-primary)] overflow-hidden"
                        >
                            <button
                                onClick={() => setActiveIndex(activeIndex === i ? null : i)}
                                className="w-full text-left p-5 font-black uppercase text-base md:text-lg flex justify-between items-center bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-secondary)] transition-colors"
                            >
                                <span className="pr-4 flex items-center gap-3">
                                    <span className="text-[var(--color-accent-primary)]">Q.</span>
                                    {item.q}
                                </span>
                                <span
                                    className="text-xl transform transition-transform duration-300 flex-shrink-0"
                                    style={{ transform: activeIndex === i ? 'rotate(45deg)' : 'rotate(0deg)' }}
                                >
                                    +
                                </span>
                            </button>
                            <div
                                className={`px-5 bg-[var(--color-bg-secondary)] border-t-2 border-[var(--color-text-primary)] transition-all duration-300 overflow-hidden ${activeIndex === i ? 'max-h-40 py-5' : 'max-h-0 py-0'
                                    }`}
                            >
                                <p className="font-bold text-[var(--color-text-secondary)] leading-relaxed">
                                    {item.a}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* View All Button */}
                <div className="text-center">
                    <Link
                        to="/faq"
                        className="inline-block neo-btn bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] px-8 py-4 font-black uppercase text-lg border-2 border-[var(--color-text-primary)] shadow-[6px_6px_0_var(--color-accent-primary)] hover:shadow-[8px_8px_0_var(--color-accent-primary)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
                    >
                        View All FAQs →
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default FAQSection;
