import React from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center pt-24 pb-12 px-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-10">
                    <Link to="/" className="inline-block">
                        <div className="w-16 h-16 border-4 border-black bg-[var(--color-accent-primary)] flex items-center justify-center text-white font-black text-4xl shadow-[6px_6px_0_black] mb-4 mx-auto">T</div>
                    </Link>
                    <h1 className="text-4xl font-black text-[var(--color-text-primary)] uppercase">Welcome Back</h1>
                    <p className="text-[var(--color-text-secondary)] font-bold mt-2">Login to manage your events</p>
                </div>

                <div className="neo-card bg-[var(--color-bg-surface)] p-8 border-4 border-black shadow-[12px_12px_0_black] relative">
                    <form className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-[var(--color-text-secondary)]">Email Address</label>
                            <input type="email" placeholder="you@example.com" className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-black rounded-lg px-4 py-3 font-bold text-[var(--color-text-primary)]" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <label className="text-xs font-black uppercase text-[var(--color-text-secondary)]">Password</label>
                                <a href="#" className="text-xs font-black uppercase text-[var(--color-accent-primary)] hover:underline">Forgot?</a>
                            </div>
                            <input type="password" placeholder="••••••••" className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-black rounded-lg px-4 py-3 font-bold text-[var(--color-text-primary)]" />
                        </div>

                        <div className="flex items-center gap-3">
                            <input type="checkbox" id="remember" className="w-5 h-5 border-2 border-black rounded text-[var(--color-accent-primary)] focus:ring-0" />
                            <label htmlFor="remember" className="text-sm font-bold text-[var(--color-text-primary)] cursor-pointer">Remember me</label>
                        </div>

                        <button className="neo-btn w-full bg-[var(--color-accent-primary)] text-white py-4 text-xl shadow-[6px_6px_0_black] hover:shadow-[8px_8px_0_black] hover:translate-x-[-2px] hover:translate-y-[-2px]">
                            LOGIN
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t-2 border-dashed border-[var(--color-text-muted)] text-center">
                        <p className="font-bold text-[var(--color-text-secondary)] mb-4">Or continue with</p>
                        <div className="flex justify-center gap-4">
                            <button className="neo-btn bg-white text-black w-12 h-12 flex items-center justify-center text-xl shadow-[4px_4px_0_black]">G</button>
                            <button className="neo-btn bg-[#1877F2] text-white w-12 h-12 flex items-center justify-center text-xl shadow-[4px_4px_0_black]">F</button>
                            <button className="neo-btn bg-black text-white w-12 h-12 flex items-center justify-center text-xl shadow-[4px_4px_0_black]">X</button>
                        </div>
                        <p className="mt-6 font-bold text-[var(--color-text-secondary)]">
                            Don't have an account? <Link to="/register" className="text-[var(--color-accent-primary)] underline decoration-2">Register</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
