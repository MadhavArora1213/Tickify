import React from 'react';
import { Link } from 'react-router-dom';

const HelpCenter = () => {
    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] pt-32 md:pt-40 pb-12 px-4">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-4xl md:text-6xl font-black uppercase text-[var(--color-text-primary)] mb-8 text-center">
                    Help Center
                </h1>

                <div className="flex justify-center mb-12">
                    <div className="w-full max-w-lg relative">
                        <input type="text" placeholder="What do you need help with?" className="w-full neo-input bg-[var(--color-bg-surface)] border-4 border-[var(--color-text-primary)] px-6 py-4 font-black uppercase text-xl shadow-[6px_6px_0_var(--color-text-primary)] focus:translate-x-[-2px] focus:translate-y-[-2px] focus:shadow-[8px_8px_0_var(--color-text-primary)] transition-all" />
                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl">🔍</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { icon: "🎟️", title: "Buying Tickets", desc: "Guides on purchasing, refunds, and transfers." },
                        { icon: "🎤", title: "Hosting Events", desc: "Setting up your first event, payouts, and analytics." },
                        { icon: "🔐", title: "Account & Security", desc: "Password resets, 2FA, and profile management." },
                    ].map((cat, i) => (
                        <div key={i} className="neo-card bg-[var(--color-bg-surface)] border-4 border-[var(--color-text-primary)] p-8 text-center shadow-[8px_8px_0_var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] cursor-pointer transition-colors group">
                            <div className="text-6xl mb-4 group-hover:scale-110 transition-transform inline-block">{cat.icon}</div>
                            <h3 className="text-2xl font-black uppercase mb-2">{cat.title}</h3>
                            <p className="font-bold text-[var(--color-text-secondary)]">{cat.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <p className="font-bold text-xl mb-4">Still stuck?</p>
                    <Link to="/contact" className="neo-btn bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] px-8 py-3 font-black uppercase border-2 border-transparent shadow-[4px_4px_0_var(--color-text-secondary)] hover:shadow-[6px_6px_0_var(--color-text-primary)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
                        Contact Support
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default HelpCenter;
