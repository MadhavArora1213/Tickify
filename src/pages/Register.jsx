import React from 'react';
import { Link } from 'react-router-dom';

const Register = () => {
    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center pt-24 pb-12 px-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-10">
                    <Link to="/" className="inline-block">
                        <div className="w-16 h-16 border-4 border-black bg-[var(--color-success)] flex items-center justify-center text-white font-black text-4xl shadow-[6px_6px_0_black] mb-4 mx-auto">T</div>
                    </Link>
                    <h1 className="text-4xl font-black text-[var(--color-text-primary)] uppercase">Join Tickify</h1>
                    <p className="text-[var(--color-text-secondary)] font-bold mt-2">Start your journey today</p>
                </div>

                <div className="neo-card bg-[var(--color-bg-surface)] p-8 border-4 border-black shadow-[12px_12px_0_black] relative">
                    <form className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-[var(--color-text-secondary)]">First Name</label>
                                <input type="text" placeholder="John" className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-black rounded-lg px-4 py-3 font-bold text-[var(--color-text-primary)]" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-[var(--color-text-secondary)]">Last Name</label>
                                <input type="text" placeholder="Doe" className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-black rounded-lg px-4 py-3 font-bold text-[var(--color-text-primary)]" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-[var(--color-text-secondary)]">Email Address</label>
                            <input type="email" placeholder="you@example.com" className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-black rounded-lg px-4 py-3 font-bold text-[var(--color-text-primary)]" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-[var(--color-text-secondary)]">Password</label>
                            <input type="password" placeholder="Create a password" className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-black rounded-lg px-4 py-3 font-bold text-[var(--color-text-primary)]" />
                        </div>

                        <div className="flex items-start gap-3">
                            <input type="checkbox" id="terms" className="w-5 h-5 border-2 border-black rounded text-[var(--color-success)] focus:ring-0 mt-1" />
                            <label htmlFor="terms" className="text-xs font-bold text-[var(--color-text-secondary)] cursor-pointer">
                                I agree to the <a href="#" className="underline text-[var(--color-text-primary)]">Terms of Service</a> and <a href="#" className="underline text-[var(--color-text-primary)]">Privacy Policy</a>
                            </label>
                        </div>

                        <button className="neo-btn w-full bg-[var(--color-success)] text-white py-4 text-xl shadow-[6px_6px_0_black] hover:shadow-[8px_8px_0_black] hover:translate-x-[-2px] hover:translate-y-[-2px]">
                            CREATE ACCOUNT
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t-2 border-dashed border-[var(--color-text-muted)] text-center">
                        <p className="mt-2 font-bold text-[var(--color-text-secondary)]">
                            Already have an account? <Link to="/login" className="text-[var(--color-accent-primary)] underline decoration-2">Login</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
