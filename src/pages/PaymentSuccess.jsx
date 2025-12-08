import React from 'react';
import { Link } from 'react-router-dom';

const PaymentSuccess = () => {
    // Mock Order Data
    const orderDetails = {
        id: "ORD-2025-8839",
        amount: 690.00,
        email: "john@example.com",
        tickets: [
            { id: 1, event: "Neon Nights Music Festival", type: "General Admission", count: 2 },
            { id: 2, event: "Future Tech Summit 2025", type: "VIP Pass", count: 1 }
        ]
    };

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] pt-36 pb-20 flex items-center justify-center px-4">
            <div className="max-w-3xl w-full">
                {/* Success Card */}
                <div className="neo-card bg-[var(--color-bg-surface)] p-8 md:p-12 border-4 border-black shadow-[12px_12px_0_black] text-center relative overflow-hidden">
                    {/* Confetti Decoration (CSS or SVG) could go here */}
                    <div className="absolute top-0 left-0 w-full h-4 bg-[var(--color-success)] border-b-2 border-black"></div>

                    <div className="w-24 h-24 bg-[var(--color-success)] rounded-full border-4 border-black flex items-center justify-center mx-auto mb-8 shadow-[6px_6px_0_black]">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black text-[var(--color-text-primary)] uppercase mb-4">
                        Payment Successful!
                    </h1>
                    <p className="text-[var(--color-text-secondary)] font-bold text-lg mb-8 max-w-lg mx-auto">
                        You're going to have a blast! A confirmation email has been sent to <span className="text-[var(--color-accent-primary)] underline decoration-2">{orderDetails.email}</span>.
                    </p>

                    {/* Ticket Preview Card (Visual Only) */}
                    <div className="max-w-md mx-auto bg-white border-4 border-black rounded-xl overflow-hidden shadow-[8px_8px_0_black] mb-10 transform rotate-[-2deg] hover:rotate-0 transition-transform duration-300">
                        <div className="bg-[var(--color-accent-primary)] p-4 text-white border-b-4 border-black border-dashed">
                            <h3 className="font-black text-xl uppercase tracking-wider">Tickify Ticket</h3>
                            <span className="text-sm font-bold opacity-80">Order #{orderDetails.id}</span>
                        </div>
                        <div className="p-6 bg-white text-black text-left relative">
                            {/* Holes for "ticket" look */}
                            <div className="absolute top-1/2 -left-3 w-6 h-6 bg-[var(--color-bg-surface)] rounded-full border-r-4 border-black transform -translate-y-1/2"></div>
                            <div className="absolute top-1/2 -right-3 w-6 h-6 bg-[var(--color-bg-surface)] rounded-full border-l-4 border-black transform -translate-y-1/2"></div>

                            <div className="mb-4">
                                <span className="text-xs font-black uppercase text-gray-500 block">Event</span>
                                <span className="text-lg font-black uppercase leading-tight">{orderDetails.tickets[0].event}</span>
                                {orderDetails.tickets.length > 1 && <span className="text-xs font-bold text-gray-500 block mt-1">+ {orderDetails.tickets.length - 1} more events</span>}
                            </div>

                            <div className="flex flex-col items-center justify-center py-4 border-2 border-black rounded-lg bg-gray-100">
                                <span className="text-6xl">🏁</span>
                                <span className="text-xs font-black uppercase mt-2">Scan at Entry</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col md:flex-row gap-4 justify-center">
                        <button className="neo-btn bg-[var(--color-accent-secondary)] text-white px-8 py-3 text-lg shadow-[6px_6px_0_black] hover:shadow-[8px_8px_0_black]">
                            DOWNLOAD TICKETS
                        </button>
                        <Link to="/my-tickets" className="neo-btn bg-white text-black px-8 py-3 text-lg shadow-[6px_6px_0_black] hover:shadow-[8px_8px_0_black]">
                            VIEW MY TICKETS
                        </Link>
                    </div>

                    <div className="mt-8">
                        <Link to="/events" className="font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:underline decoration-2 uppercase text-sm">
                            &larr; Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
