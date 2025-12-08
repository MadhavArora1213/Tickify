import React from 'react';

const Contact = () => {
    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] pt-24 pb-12 px-4">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">

                {/* Left: Info */}
                <div className="space-y-8">
                    <h1 className="text-6xl font-black uppercase text-[var(--color-text-primary)] leading-none">
                        Let's <br />
                        <span className="text-yellow-400 text-stroke-3 text-stroke-black">Talk.</span>
                    </h1>
                    <p className="text-xl font-bold text-[var(--color-text-secondary)]">
                        Got a question? Found a bug? Just want to say hi? We're all ears.
                    </p>

                    <div className="space-y-6">
                        <div className="neo-card bg-[var(--color-bg-surface)] border-4 border-[var(--color-text-primary)] p-6 flex items-center gap-6 shadow-[8px_8px_0_var(--color-text-primary)]">
                            <div className="w-12 h-12 bg-blue-500 border-2 border-black flex items-center justify-center text-2xl">📧</div>
                            <div>
                                <p className="text-xs font-black uppercase text-[var(--color-text-secondary)]">Email Us</p>
                                <p className="text-xl font-black text-[var(--color-text-primary)]">hello@tickify.com</p>
                            </div>
                        </div>

                        <div className="neo-card bg-[var(--color-bg-surface)] border-4 border-[var(--color-text-primary)] p-6 flex items-center gap-6 shadow-[8px_8px_0_var(--color-text-primary)]">
                            <div className="w-12 h-12 bg-green-500 border-2 border-black flex items-center justify-center text-2xl">📱</div>
                            <div>
                                <p className="text-xs font-black uppercase text-[var(--color-text-secondary)]">Call Us</p>
                                <p className="text-xl font-black text-[var(--color-text-primary)]">+1 (555) 000-TICK</p>
                            </div>
                        </div>

                        <div className="neo-card bg-[var(--color-bg-surface)] border-4 border-[var(--color-text-primary)] p-6 flex items-center gap-6 shadow-[8px_8px_0_var(--color-text-primary)]">
                            <div className="w-12 h-12 bg-red-500 border-2 border-black flex items-center justify-center text-2xl">📍</div>
                            <div>
                                <p className="text-xs font-black uppercase text-[var(--color-text-secondary)]">Visit Us</p>
                                <p className="text-xl font-black text-[var(--color-text-primary)]">123 Event Horizon Blvd, NY</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Form */}
                <div className="neo-card bg-[var(--color-bg-surface)] border-4 border-[var(--color-text-primary)] p-8 shadow-[16px_16px_0_var(--color-text-primary)] relative">
                    <form className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">First Name</label>
                                <input type="text" className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] px-4 py-3 font-bold" />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">Last Name</label>
                                <input type="text" className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] px-4 py-3 font-bold" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">Email</label>
                            <input type="email" className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] px-4 py-3 font-bold" />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">Topic</label>
                            <select className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] px-4 py-3 font-bold">
                                <option>General Inquiry</option>
                                <option>Support</option>
                                <option>Sales</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">Message</label>
                            <textarea rows="4" className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] px-4 py-3 font-bold"></textarea>
                        </div>
                        <button className="w-full py-4 bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] font-black uppercase text-xl border-2 border-transparent hover:bg-[var(--color-accent-primary)] hover:text-white shadow-[6px_6px_0_var(--color-text-secondary)] transition-all">
                            Send Message &rarr;
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
};

export default Contact;
