import React from 'react';

const Newsletter = () => {
    return (
        <section className="py-20 bg-[var(--color-bg-primary)] border-t-4 border-black">
            <div className="container mx-auto px-4 text-center">
                <div className="max-w-4xl mx-auto bg-[var(--color-bg-surface)] rounded-2xl p-8 md:p-16 border-4 border-black shadow-[12px_12px_0_black] relative overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-accent-primary)] rounded-full border-4 border-black -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-[var(--color-accent-secondary)] rounded-full border-4 border-black translate-y-1/2 -translate-x-1/2"></div>

                    <h2 className="text-4xl md:text-6xl font-black mb-6 relative z-10 uppercase text-[var(--color-text-primary)]">
                        <span className="block dark:hidden" style={{ WebkitTextStroke: '2px black', color: 'white', textShadow: '4px 4px 0px #000' }}>Never Miss an Event</span>
                        <span className="hidden dark:block drop-shadow-[4px_4px_0_var(--color-accent-primary)]">Never Miss an Event</span>
                    </h2>
                    <p className="text-[var(--color-text-secondary)] font-bold text-xl mb-10 max-w-2xl mx-auto relative z-10">
                        Join 50,000+ subscribers and get exclusive access to presale tickets, artist meetups, and weekly event digests.
                    </p>

                    <form className="relative z-10 flex flex-col md:flex-row gap-4 max-w-lg mx-auto">
                        <input
                            type="email"
                            placeholder="ENTER YOUR EMAIL"
                            className="flex-1 bg-[var(--color-bg-secondary)] border-4 border-black rounded-xl px-6 py-4 outline-none focus:translate-x-[-4px] focus:translate-y-[-4px] focus:shadow-[6px_6px_0_black] transition-all font-bold uppercase placeholder-[var(--color-text-muted)] text-[var(--color-text-primary)]"
                        />
                        <button className="bg-[var(--color-accent-primary)] text-white font-black uppercase text-xl py-4 px-8 rounded-xl border-4 border-black shadow-[6px_6px_0_black] hover:shadow-[8px_8px_0_black] hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all">
                            Subscribe
                        </button>
                    </form>

                    <p className="mt-8 text-xs font-black text-[var(--color-text-muted)] uppercase relative z-10 tracking-widest">
                        No spam, ever. Unsubscribe anytime.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default Newsletter;
