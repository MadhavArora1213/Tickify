import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-[var(--color-bg-secondary)] pt-16 pb-8 border-t-4 border-black relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 border-2 border-black bg-[var(--color-accent-primary)] flex items-center justify-center text-white font-black text-2xl shadow-[4px_4px_0_black]">
                                T
                            </div>
                            <span className="text-2xl font-black uppercase tracking-tighter">Tickify</span>
                        </div>
                        <p className="text-[var(--color-text-secondary)] font-bold text-sm leading-relaxed mb-6 border-l-4 border-black pl-4">
                            The modern platform for discovering, creating, and managing events that people love.
                        </p>
                    </div>

                    {/* Links 1 */}
                    <div>
                        <h4 className="font-black mb-4 uppercase text-lg">
                            <span className="block dark:hidden" style={{ WebkitTextStroke: '1px black', color: 'white', textShadow: '2px 2px 0px #000' }}>Platform</span>
                            <span className="hidden dark:block drop-shadow-[2px_2px_0_var(--color-accent-secondary)]">Platform</span>
                        </h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:underline decoration-4 decoration-[var(--color-accent-primary)] transition-all text-sm uppercase">Browse Events</a></li>
                            <li><a href="#" className="font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:underline decoration-4 decoration-[var(--color-accent-primary)] transition-all text-sm uppercase">Create Event</a></li>
                            <li><a href="#" className="font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:underline decoration-4 decoration-[var(--color-accent-primary)] transition-all text-sm uppercase">Pricing</a></li>
                        </ul>
                    </div>

                    {/* Links 2 */}
                    <div>
                        <h4 className="font-black mb-4 uppercase text-lg">
                            <span className="block dark:hidden" style={{ WebkitTextStroke: '1px black', color: 'white', textShadow: '2px 2px 0px #000' }}>Company</span>
                            <span className="hidden dark:block drop-shadow-[2px_2px_0_var(--color-accent-secondary)]">Company</span>
                        </h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:underline decoration-4 decoration-[var(--color-accent-primary)] transition-all text-sm uppercase">About Us</a></li>
                            <li><a href="#" className="font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:underline decoration-4 decoration-[var(--color-accent-primary)] transition-all text-sm uppercase">Careers</a></li>
                            <li><a href="#" className="font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:underline decoration-4 decoration-[var(--color-accent-primary)] transition-all text-sm uppercase">Contact</a></li>
                        </ul>
                    </div>

                    {/* Links 3 */}
                    <div>
                        <h4 className="font-black mb-4 uppercase text-lg">
                            <span className="block dark:hidden" style={{ WebkitTextStroke: '1px black', color: 'white', textShadow: '2px 2px 0px #000' }}>Legal</span>
                            <span className="hidden dark:block drop-shadow-[2px_2px_0_var(--color-accent-secondary)]">Legal</span>
                        </h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:underline decoration-4 decoration-[var(--color-accent-primary)] transition-all text-sm uppercase">Terms of Service</a></li>
                            <li><a href="#" className="font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:underline decoration-4 decoration-[var(--color-accent-primary)] transition-all text-sm uppercase">Privacy Policy</a></li>
                            <li><a href="#" className="font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:underline decoration-4 decoration-[var(--color-accent-primary)] transition-all text-sm uppercase">Cookie Policy</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t-4 border-black pt-8 text-center text-[var(--color-text-muted)] font-bold text-sm uppercase tracking-wider">
                    &copy; {new Date().getFullYear()} Tickify. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
