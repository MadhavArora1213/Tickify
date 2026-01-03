import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const FAQ = () => {
    const [activeIndex, setActiveIndex] = useState(null);
    const [activeCategory, setActiveCategory] = useState('all');

    const categories = [
        { id: 'all', label: 'All FAQs', icon: '📋' },
        { id: 'tickets', label: 'Tickets & Booking', icon: '🎫' },
        { id: 'payment', label: 'Payment & Refunds', icon: '💳' },
        { id: 'account', label: 'Account', icon: '👤' },
        { id: 'organizer', label: 'For Organizers', icon: '🎪' },
        { id: 'technical', label: 'Technical', icon: '🔧' },
    ];

    const questions = [
        // Tickets & Booking
        {
            q: "How do I buy a ticket?",
            a: "Simply browse our events page, select an event, choose your ticket type and quantity, and proceed to checkout. You'll receive your e-ticket with a QR code immediately via email.",
            category: 'tickets'
        },
        {
            q: "Where can I find my tickets after purchase?",
            a: "Your tickets are available in the 'My Tickets' section of your account. You can also find them in the confirmation email sent to your registered email address.",
            category: 'tickets'
        },
        {
            q: "Can I buy tickets for someone else?",
            a: "Yes! During checkout, you can specify the attendee's name. The ticket will be issued in their name, but the purchase confirmation will be sent to your email.",
            category: 'tickets'
        },
        {
            q: "How do I transfer my ticket to someone else?",
            a: "Go to 'My Tickets', select the ticket you want to transfer, and click 'Transfer Ticket'. Enter the recipient's email, and they'll receive the ticket directly.",
            category: 'tickets'
        },
        {
            q: "Is there a limit on how many tickets I can buy?",
            a: "Ticket limits are set by event organizers and vary by event. Any limits will be displayed during the ticket selection process.",
            category: 'tickets'
        },

        // Payment & Refunds
        {
            q: "What payment methods are accepted?",
            a: "We accept all major credit/debit cards (Visa, Mastercard, RuPay), UPI, net banking, and popular wallets like Paytm and PhonePe.",
            category: 'payment'
        },
        {
            q: "Is my payment information secure?",
            a: "Absolutely. We use industry-standard SSL encryption and are PCI DSS compliant. We never store your complete card details on our servers.",
            category: 'payment'
        },
        {
            q: "Can I get a refund?",
            a: "Refund policies are set by individual event organizers and vary by event. Check the event page for specific refund terms. Platform convenience fees are generally non-refundable.",
            category: 'payment'
        },
        {
            q: "How long does a refund take to process?",
            a: "Once approved by the organizer, refunds are processed within 5-7 business days. The time for the amount to reflect in your account depends on your bank.",
            category: 'payment'
        },
        {
            q: "What if my payment failed but money was deducted?",
            a: "Don't worry! If money was deducted but your booking wasn't confirmed, the amount will be auto-refunded within 48-72 hours. If not, contact our support team.",
            category: 'payment'
        },

        // Account
        {
            q: "How do I create an account?",
            a: "Click 'Sign Up' and enter your email, phone number, and password. Verify your email and phone via OTP, and you're all set!",
            category: 'account'
        },
        {
            q: "I forgot my password. How do I reset it?",
            a: "Click 'Forgot Password' on the login page, enter your registered email, and follow the instructions sent to your inbox to reset your password.",
            category: 'account'
        },
        {
            q: "Can I change my email address?",
            a: "Yes, go to Profile Settings and update your email. You'll need to verify the new email address before the change takes effect.",
            category: 'account'
        },
        {
            q: "How do I delete my account?",
            a: "Contact our support team to request account deletion. Note that this action is irreversible and your ticket history will be lost.",
            category: 'account'
        },

        // For Organizers
        {
            q: "How do I become an event organizer on Tickify?",
            a: "Click 'Organizer Login' in the footer, then 'Register as Organizer'. Complete your profile, submit your verification documents, and wait for admin approval (usually within 24-48 hours).",
            category: 'organizer'
        },
        {
            q: "What are the fees for organizers?",
            a: "We charge a small platform fee per ticket sold. The exact percentage depends on your plan. Contact our sales team for detailed pricing.",
            category: 'organizer'
        },
        {
            q: "When will I receive my event earnings?",
            a: "Settlements are processed within 7 business days after the event concludes. You can track your earnings in the Organizer Dashboard.",
            category: 'organizer'
        },
        {
            q: "Can I create a free event?",
            a: "Yes! You can create free events with no platform fees. This is perfect for community gatherings, webinars, or promotional events.",
            category: 'organizer'
        },
        {
            q: "How do I cancel my event?",
            a: "Go to your Organizer Dashboard, find the event, and click 'Cancel Event'. Important: You'll need to handle refunds for all ticket holders.",
            category: 'organizer'
        },

        // Technical
        {
            q: "The website is not loading properly. What should I do?",
            a: "Try clearing your browser cache, disabling extensions, or using a different browser. If the issue persists, contact support.",
            category: 'technical'
        },
        {
            q: "I didn't receive my confirmation email.",
            a: "Check your spam/junk folder first. If not there, verify your email in Profile Settings. You can also download tickets directly from 'My Tickets'.",
            category: 'technical'
        },
        {
            q: "The QR code on my ticket isn't scanning.",
            a: "Ensure your screen brightness is at maximum and the QR code is fully visible. If issues persist, use the ticket ID for manual entry.",
            category: 'technical'
        },
        {
            q: "How do I contact support?",
            a: "Visit our Contact page or email Contacttickify@gmail.com. For urgent issues, use the in-app chat during business hours.",
            category: 'technical'
        },
    ];

    const filteredQuestions = activeCategory === 'all'
        ? questions
        : questions.filter(q => q.category === activeCategory);

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] pt-24 pb-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-6xl font-black uppercase text-[var(--color-text-primary)] mb-4">
                        Frequently Asked Questions
                    </h1>
                    <p className="text-xl font-bold text-[var(--color-text-secondary)]">
                        Can't find what you're looking for? <Link to="/contact" className="text-[var(--color-accent-primary)] underline">Contact us</Link>
                    </p>
                </div>

                {/* Category Filters */}
                <div className="flex flex-wrap gap-3 mb-10 justify-center">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => { setActiveCategory(cat.id); setActiveIndex(null); }}
                            className={`px-4 py-2 font-black uppercase text-sm border-2 border-[var(--color-text-primary)] transition-all ${activeCategory === cat.id
                                ? 'bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] shadow-none'
                                : 'bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] shadow-[4px_4px_0_var(--color-text-primary)] hover:shadow-[2px_2px_0_var(--color-text-primary)] hover:translate-x-[2px] hover:translate-y-[2px]'
                                }`}
                        >
                            <span className="mr-2">{cat.icon}</span>
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Accordion */}
                <div className="space-y-4">
                    {filteredQuestions.map((item, i) => (
                        <div key={i} className="neo-card bg-[var(--color-bg-surface)] border-4 border-[var(--color-text-primary)] shadow-[8px_8px_0_var(--color-text-primary)] overflow-hidden">
                            <button
                                onClick={() => setActiveIndex(activeIndex === i ? null : i)}
                                className="w-full text-left p-6 font-black uppercase text-lg flex justify-between items-center bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-secondary)] transition-colors"
                            >
                                <span className="pr-4">{item.q}</span>
                                <span className="text-2xl transform transition-transform duration-300 flex-shrink-0" style={{ transform: activeIndex === i ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                                    ▼
                                </span>
                            </button>
                            <div
                                className={`px-6 bg-[var(--color-bg-secondary)] border-t-2 border-[var(--color-text-primary)] transition-all duration-300 overflow-hidden ${activeIndex === i ? 'max-h-48 py-6' : 'max-h-0 py-0'}`}
                            >
                                <p className="font-bold text-[var(--color-text-secondary)] leading-relaxed">{item.a}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Still Need Help */}
                <div className="mt-16 text-center neo-card bg-[var(--color-bg-surface)] border-4 border-[var(--color-text-primary)] p-8 shadow-[12px_12px_0_var(--color-text-primary)]">
                    <h2 className="text-2xl font-black uppercase mb-4">Still have questions?</h2>
                    <p className="text-[var(--color-text-secondary)] font-bold mb-6">
                        Our support team is here to help you 24/7
                    </p>
                    <Link
                        to="/contact"
                        className="inline-block neo-btn bg-[var(--color-accent-primary)] text-white px-8 py-4 font-black uppercase text-lg border-2 border-[var(--color-text-primary)] shadow-[6px_6px_0_var(--color-text-primary)] hover:shadow-[8px_8px_0_var(--color-text-primary)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
                    >
                        Contact Support →
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default FAQ;
