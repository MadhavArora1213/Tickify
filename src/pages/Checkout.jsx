import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Checkout = () => {
    // Mock Total
    const total = 690 + 69; // Subtotal + Tax logic similar to Cart

    return (
        <div className="pt-36 pb-24 min-h-screen bg-[var(--color-bg-primary)]">
            <div className="container mx-auto px-4">
                {/* Heading */}
                <h1 className="text-4xl md:text-6xl font-black mb-12 uppercase text-center text-[var(--color-text-primary)]">
                    <span className="block dark:hidden" style={{ WebkitTextStroke: '2px black', color: 'white', textShadow: '4px 4px 0px #000' }}>Checkout</span>
                    <span className="hidden dark:block drop-shadow-[4px_4px_0_var(--color-accent-primary)]">Checkout</span>
                </h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Column: Forms */}
                    <div className="w-full lg:w-2/3 space-y-8">

                        {/* 1. Contact Info */}
                        <div className="neo-card bg-[var(--color-bg-surface)] p-8 border-4 border-black shadow-[8px_8px_0_black] relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-black text-white px-4 py-1 font-black text-xl border-b-2 border-l-2 border-white">01</div>
                            <h3 className="text-2xl font-black text-[var(--color-text-primary)] mb-6 uppercase">Contact Information</h3>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase text-[var(--color-text-secondary)]">First Name</label>
                                        <input type="text" className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-black rounded-lg px-4 py-3 font-bold text-[var(--color-text-primary)]" placeholder="John" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase text-[var(--color-text-secondary)]">Last Name</label>
                                        <input type="text" className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-black rounded-lg px-4 py-3 font-bold text-[var(--color-text-primary)]" placeholder="Doe" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-[var(--color-text-secondary)]">Email Address</label>
                                    <input type="email" className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-black rounded-lg px-4 py-3 font-bold text-[var(--color-text-primary)]" placeholder="john@example.com" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-[var(--color-text-secondary)]">Phone Number</label>
                                    <input type="tel" className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-black rounded-lg px-4 py-3 font-bold text-[var(--color-text-primary)]" placeholder="+1 (555) 000-0000" />
                                </div>
                            </div>
                        </div>

                        {/* 2. Billing Address */}
                        <div className="neo-card bg-[var(--color-bg-surface)] p-8 border-4 border-black shadow-[8px_8px_0_black] relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-black text-white px-4 py-1 font-black text-xl border-b-2 border-l-2 border-white">02</div>
                            <h3 className="text-2xl font-black text-[var(--color-text-primary)] mb-6 uppercase">Billing Address</h3>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-[var(--color-text-secondary)]">Street Address</label>
                                    <input type="text" className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-black rounded-lg px-4 py-3 font-bold text-[var(--color-text-primary)]" placeholder="123 Cyberpunk Ave" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase text-[var(--color-text-secondary)]">City</label>
                                        <input type="text" className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-black rounded-lg px-4 py-3 font-bold text-[var(--color-text-primary)]" placeholder="Neo Tokyo" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase text-[var(--color-text-secondary)]">Postal Code</label>
                                        <input type="text" className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-black rounded-lg px-4 py-3 font-bold text-[var(--color-text-primary)]" placeholder="90210" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. Payment Method */}
                        <div className="neo-card bg-[var(--color-bg-surface)] p-8 border-4 border-black shadow-[8px_8px_0_black] relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-black text-white px-4 py-1 font-black text-xl border-b-2 border-l-2 border-white">03</div>
                            <h3 className="text-2xl font-black text-[var(--color-text-primary)] mb-6 uppercase">Payment Method</h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <label className="cursor-pointer">
                                    <input type="radio" name="payment" className="peer hidden" defaultChecked />
                                    <div className="neo-card p-4 border-2 border-black bg-[var(--color-bg-secondary)] peer-checked:bg-[var(--color-accent-primary)] peer-checked:text-white transition-all text-center h-full flex flex-col items-center justify-center gap-2">
                                        <span className="text-2xl">💳</span>
                                        <span className="font-black uppercase text-sm">Credit Card</span>
                                    </div>
                                </label>
                                <label className="cursor-pointer">
                                    <input type="radio" name="payment" className="peer hidden" />
                                    <div className="neo-card p-4 border-2 border-black bg-[var(--color-bg-secondary)] peer-checked:bg-[var(--color-accent-primary)] peer-checked:text-white transition-all text-center h-full flex flex-col items-center justify-center gap-2">
                                        <span className="text-2xl">🅿️</span>
                                        <span className="font-black uppercase text-sm">PayPal</span>
                                    </div>
                                </label>
                                <label className="cursor-pointer">
                                    <input type="radio" name="payment" className="peer hidden" />
                                    <div className="neo-card p-4 border-2 border-black bg-[var(--color-bg-secondary)] peer-checked:bg-[var(--color-accent-primary)] peer-checked:text-white transition-all text-center h-full flex flex-col items-center justify-center gap-2">
                                        <span className="text-2xl">🪙</span>
                                        <span className="font-black uppercase text-sm">Crypto</span>
                                    </div>
                                </label>
                            </div>

                            <div className="space-y-4 p-4 border-2 border-black rounded-xl bg-[var(--color-bg-secondary)]">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-[var(--color-text-secondary)]">Card Number</label>
                                    <input type="text" className="w-full neo-input bg-[var(--color-bg-surface)] border-2 border-black rounded-lg px-4 py-3 font-bold text-[var(--color-text-primary)]" placeholder="0000 0000 0000 0000" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase text-[var(--color-text-secondary)]">Expiry Date</label>
                                        <input type="text" className="w-full neo-input bg-[var(--color-bg-surface)] border-2 border-black rounded-lg px-4 py-3 font-bold text-[var(--color-text-primary)]" placeholder="MM/YY" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase text-[var(--color-text-secondary)]">CVC</label>
                                        <input type="text" className="w-full neo-input bg-[var(--color-bg-surface)] border-2 border-black rounded-lg px-4 py-3 font-bold text-[var(--color-text-primary)]" placeholder="123" />
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="w-full lg:w-1/3">
                        <div className="neo-card bg-[var(--color-bg-surface)] p-8 border-4 border-black shadow-[8px_8px_0_black] sticky top-32">
                            <h3 className="text-2xl font-black text-[var(--color-text-primary)] mb-6 uppercase border-b-4 border-black pb-4">In Your Bags</h3>

                            <ul className="space-y-4 mb-6">
                                <li className="flex justify-between items-start">
                                    <div>
                                        <span className="block font-black text-[var(--color-text-primary)] uppercase">Neon Nights</span>
                                        <span className="text-xs text-[var(--color-text-secondary)] font-bold">2 x General Admission</span>
                                    </div>
                                    <span className="font-black text-[var(--color-text-primary)]">$240.00</span>
                                </li>
                                <li className="flex justify-between items-start">
                                    <div>
                                        <span className="block font-black text-[var(--color-text-primary)] uppercase">Tech Summit</span>
                                        <span className="text-xs text-[var(--color-text-secondary)] font-bold">1 x VIP Pass</span>
                                    </div>
                                    <span className="font-black text-[var(--color-text-primary)]">$450.00</span>
                                </li>
                            </ul>

                            <div className="space-y-2 mb-8 pt-4 border-t-2 border-dashed border-[var(--color-text-muted)]">
                                <div className="flex justify-between font-bold text-[var(--color-text-secondary)]">
                                    <span>Subtotal</span>
                                    <span>$690.00</span>
                                </div>
                                <div className="flex justify-between font-bold text-[var(--color-text-secondary)]">
                                    <span>Tax</span>
                                    <span>$69.00</span>
                                </div>
                                <div className="flex justify-between font-black text-2xl text-[var(--color-text-primary)] pt-2">
                                    <span>Total</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                            </div>

                            <label className="flex items-start gap-3 mb-6 cursor-pointer group">
                                <input type="checkbox" className="w-5 h-5 border-2 border-black rounded focus:ring-0 mt-1" />
                                <span className="text-xs font-bold text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)]">
                                    I agree to the <a href="#" className="underline decoration-2">Terms and Conditions</a> and <a href="#" className="underline decoration-2">Privacy Policy</a>.
                                </span>
                            </label>

                            <button className="neo-btn w-full bg-[var(--color-success)] text-white text-xl py-4 shadow-[6px_6px_0_black] hover:shadow-[8px_8px_0_black] hover:translate-x-[-2px] hover:translate-y-[-2px]">
                                PAY ${total.toFixed(2)}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
