import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ScannerLogin = () => {
    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center p-4">
            <div className="w-full max-w-sm">

                {/* Logo */}
                <div className="text-center mb-10">
                    <div className="w-20 h-20 mx-auto bg-black text-white flex items-center justify-center border-4 border-[var(--color-accent-primary)] shadow-[6px_6px_0_var(--color-accent-primary)] mb-4">
                        <span className="text-4xl">📷</span>
                    </div>
                    <h1 className="text-3xl font-black uppercase text-[var(--color-text-primary)]">Tickify Scanner</h1>
                    <p className="font-bold text-[var(--color-text-secondary)]">Staff Access Portal</p>
                </div>

                <div className="neo-card bg-[var(--color-bg-surface)] p-6 border-4 border-black shadow-[8px_8px_0_black]">
                    <form className="space-y-6">
                        <div>
                            <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">Access Code</label>
                            <input type="password" placeholder="••••-••••" className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-black px-4 py-3 font-black text-center text-xl tracking-widest uppercase placeholder-[var(--color-text-secondary)]" />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">Event PIN (Optional)</label>
                            <input type="text" placeholder="123456" className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-black px-4 py-3 font-black text-center text-xl tracking-widest placeholder-[var(--color-text-secondary)]" />
                        </div>

                        <div className="flex items-center gap-3 justify-center">
                            <input type="checkbox" id="remember" className="w-5 h-5 border-2 border-black rounded text-[var(--color-accent-primary)] focus:ring-0" />
                            <label htmlFor="remember" className="text-sm font-bold text-[var(--color-text-primary)] cursor-pointer">Remember this device</label>
                        </div>

                        <button className="neo-btn w-full bg-[var(--color-accent-primary)] text-white py-4 text-xl font-black uppercase shadow-[4px_4px_0_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_black]">
                            Connect
                        </button>
                    </form>

                    <div className="mt-8 text-center border-t-2 border-dashed border-black pt-4">
                        <Link to="/" className="text-xs font-black uppercase text-[var(--color-text-secondary)] hover:text-black">
                            &larr; Back to Home
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ScannerLogin;
