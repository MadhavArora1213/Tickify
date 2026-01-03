import React from 'react';
import { Link } from 'react-router-dom';

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

                        {/* Social Links */}
                        <div className="flex gap-4 mb-6 pl-4">
                            <a href="https://www.linkedin.com/in/saransh-mittal-172556395/" target="_blank" rel="noopener noreferrer" className="text-2xl hover:scale-110 transition-transform" title="LinkedIn">👔</a>
                            <a href="https://www.instagram.com/ticki_fy/" target="_blank" rel="noopener noreferrer" className="text-2xl hover:scale-110 transition-transform" title="Instagram">📸</a>
                            <a href="https://x.com/Tickify134140" target="_blank" rel="noopener noreferrer" className="text-2xl hover:scale-110 transition-transform" title="X (Twitter)">🐦</a>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-2 text-sm font-bold text-[var(--color-text-secondary)] pl-4">
                            <a href="mailto:Contacttickify@gmail.com" className="block hover:text-[var(--color-text-primary)] hover:underline">📧 Contacttickify@gmail.com</a>
                            <a href="tel:9636573425" className="block hover:text-[var(--color-text-primary)] hover:underline">📱 +91 9636573425</a>
                            <a href="tel:9172289897" className="block hover:text-[var(--color-text-primary)] hover:underline">📱 +91 9172289897</a>
                        </div>
                    </div>

                    {/* Links 1 */}
                    <div>
                        <h4 className="font-black mb-4 uppercase text-lg">
                            <span className="block dark:hidden" style={{ WebkitTextStroke: '1px black', color: 'white', textShadow: '2px 2px 0px #000' }}>Platform</span>
                            <span className="hidden dark:block drop-shadow-[2px_2px_0_var(--color-accent-secondary)]">Platform</span>
                        </h4>
                        <ul className="space-y-2">
                            <li><Link to="/events" className="font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:underline decoration-4 decoration-[var(--color-accent-primary)] transition-all text-sm uppercase">Browse Events</Link></li>
                            <li><Link to="/organizer/events/create" className="font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:underline decoration-4 decoration-[var(--color-accent-primary)] transition-all text-sm uppercase">Create Event</Link></li>
                            <li><Link to="/pricing" className="font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:underline decoration-4 decoration-[var(--color-accent-primary)] transition-all text-sm uppercase">Pricing</Link></li>
                        </ul>
                    </div>

                    {/* Links 2 */}
                    <div>
                        <h4 className="font-black mb-4 uppercase text-lg">
                            <span className="block dark:hidden" style={{ WebkitTextStroke: '1px black', color: 'white', textShadow: '2px 2px 0px #000' }}>Company</span>
                            <span className="hidden dark:block drop-shadow-[2px_2px_0_var(--color-accent-secondary)]">Company</span>
                        </h4>
                        <ul className="space-y-2">
                            <li><Link to="/about" className="font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:underline decoration-4 decoration-[var(--color-accent-primary)] transition-all text-sm uppercase">About Us</Link></li>
                            <li><Link to="/careers" className="font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:underline decoration-4 decoration-[var(--color-accent-primary)] transition-all text-sm uppercase">Careers</Link></li>
                            <li><Link to="/contact" className="font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:underline decoration-4 decoration-[var(--color-accent-primary)] transition-all text-sm uppercase">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Links 3 */}
                    <div>
                        <h4 className="font-black mb-4 uppercase text-lg">
                            <span className="block dark:hidden" style={{ WebkitTextStroke: '1px black', color: 'white', textShadow: '2px 2px 0px #000' }}>Legal</span>
                            <span className="hidden dark:block drop-shadow-[2px_2px_0_var(--color-accent-secondary)]">Legal</span>
                        </h4>
                        <ul className="space-y-2">
                            <li><Link to="/terms" className="font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:underline decoration-4 decoration-[var(--color-accent-primary)] transition-all text-sm uppercase">Terms of Service</Link></li>
                            <li><Link to="/privacy" className="font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:underline decoration-4 decoration-[var(--color-accent-primary)] transition-all text-sm uppercase">Privacy Policy</Link></li>
                            <li><Link to="/cookie-policy" className="font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:underline decoration-4 decoration-[var(--color-accent-primary)] transition-all text-sm uppercase">Cookie Policy</Link></li>
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
