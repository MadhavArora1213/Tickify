import React from 'react';
import { Link } from 'react-router-dom';

const Pricing = () => {
    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] pt-24 pb-12 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-5xl md:text-7xl font-black uppercase text-[var(--color-text-primary)] mb-6">
                        Simple, Transparent Pricing
                    </h1>
                    <p className="text-xl md:text-2xl font-bold text-[var(--color-text-secondary)] max-w-3xl mx-auto">
                        No hidden fees. No credit card required to start. Choose the plan that fits your events.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {/* Free Plan */}
                    <div className="neo-card bg-[var(--color-bg-surface)] p-8 border-4 border-[var(--color-text-primary)] shadow-[8px_8px_0_var(--color-text-primary)] flex flex-col relative group hover:-translate-y-2 transition-transform duration-300">
                        <div className="mb-4">
                            <h3 className="text-2xl font-black uppercase mb-2">Starter</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-black">₹0</span>
                                <span className="font-bold text-[var(--color-text-secondary)]">/event</span>
                            </div>
                        </div>
                        <p className="font-bold text-[var(--color-text-secondary)] mb-8">Perfect for small meetups and free events.</p>

                        <ul className="space-y-4 mb-8 flex-grow font-bold">
                            <li className="flex items-center gap-3">
                                <span className="text-green-500 text-xl">✓</span> Unlimited Free Events
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-green-500 text-xl">✓</span> Basic Analytics
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-green-500 text-xl">✓</span> Standard Support
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-green-500 text-xl">✓</span> Secure Payments
                            </li>
                        </ul>

                        <Link to="/organizer/register" className="block text-center bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-primary-hover)] text-white font-black uppercase py-4 border-2 border-[var(--color-text-primary)] shadow-[4px_4px_0_var(--color-text-primary)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_var(--color-text-primary)] transition-all">
                            Get Started
                        </Link>
                    </div>

                    {/* Pro Plan */}
                    <div className="neo-card bg-black text-white p-8 border-4 border-[var(--color-text-primary)] shadow-[8px_8px_0_var(--color-text-primary)] flex flex-col relative transform md:-translate-y-4 z-10">
                        <div className="absolute top-0 right-0 bg-[var(--color-accent-secondary)] text-black font-black uppercase text-xs px-3 py-1 border-b-4 border-l-4 border-[var(--color-text-primary)]">
                            Most Popular
                        </div>
                        <div className="mb-4">
                            <h3 className="text-2xl font-black uppercase mb-2 text-[var(--color-accent-primary)]">Pro</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-black">2%</span>
                                <span className="font-bold text-gray-400">/ticket transaction</span>
                            </div>
                        </div>
                        <p className="font-bold text-gray-300 mb-8">For professional organizers growing their audience.</p>

                        <ul className="space-y-4 mb-8 flex-grow font-bold">
                            <li className="flex items-center gap-3">
                                <span className="text-[var(--color-accent-secondary)] text-xl">✓</span> Everything in Starter
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-[var(--color-accent-secondary)] text-xl">✓</span> Lower Transaction Fees
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-[var(--color-accent-secondary)] text-xl">✓</span> Priority Support
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-[var(--color-accent-secondary)] text-xl">✓</span> Advanced Analytics
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-[var(--color-accent-secondary)] text-xl">✓</span> Custom Branding
                            </li>
                        </ul>

                        <Link to="/organizer/register" className="block text-center bg-white text-black font-black uppercase py-4 border-2 border-white hover:bg-gray-200 transition-colors">
                            Start Free Trial
                        </Link>
                    </div>

                    {/* Enterprise Plan */}
                    <div className="neo-card bg-[var(--color-bg-surface)] p-8 border-4 border-[var(--color-text-primary)] shadow-[8px_8px_0_var(--color-text-primary)] flex flex-col relative group hover:-translate-y-2 transition-transform duration-300">
                        <div className="mb-4">
                            <h3 className="text-2xl font-black uppercase mb-2">Custom</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-black">Let's Talk</span>
                            </div>
                        </div>
                        <p className="font-bold text-[var(--color-text-secondary)] mb-8">Tailored solutions for large scale events.</p>

                        <ul className="space-y-4 mb-8 flex-grow font-bold">
                            <li className="flex items-center gap-3">
                                <span className="text-green-500 text-xl">✓</span> Volume Discounts
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-green-500 text-xl">✓</span> Dedicated Account Manager
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-green-500 text-xl">✓</span> API Access
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-green-500 text-xl">✓</span> On-site Support
                            </li>
                        </ul>

                        <Link to="/contact" className="block text-center bg-transparent hover:bg-[var(--color-bg-hover)] text-[var(--color-text-primary)] font-black uppercase py-4 border-2 border-[var(--color-text-primary)] shadow-[4px_4px_0_var(--color-text-primary)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_var(--color-text-primary)] transition-all">
                            Contact Sales
                        </Link>
                    </div>
                </div>

                <div className="neo-card bg-[var(--color-accent-secondary)]/10 p-8 border-4 border-[var(--color-text-primary)] text-center">
                    <h2 className="text-3xl font-black uppercase mb-4">Refund Policy</h2>
                    <p className="font-bold text-lg mb-4">
                        We understand things change. Tickify facilitates refunds according to the organizer's specified policy for each event.
                    </p>
                    <Link to="/terms" className="text-[var(--color-accent-primary)] font-black uppercase hover:underline">Read full terms</Link>
                </div>
            </div>
        </div>
    );
};

export default Pricing;
