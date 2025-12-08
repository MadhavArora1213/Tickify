import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center p-4">
            <div className="text-center">
                <h1 className="text-9xl font-black text-[var(--color-text-primary)] mb-4 text-stroke-3 text-stroke-black text-transparent bg-clip-text bg-gradient-to-br from-purple-500 to-pink-500">
                    404
                </h1>
                <h2 className="text-3xl md:text-5xl font-black uppercase text-[var(--color-text-primary)] mb-6">
                    Page Not Found
                </h2>
                <p className="text-xl font-bold text-[var(--color-text-secondary)] mb-8 max-w-md mx-auto">
                    Whoops! Looks like you took a wrong turn at the mosh pit. This page doesn't exist.
                </p>
                <Link to="/" className="inline-block neo-btn bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] px-8 py-4 font-black uppercase border-2 border-[var(--color-text-primary)] shadow-[6px_6px_0_var(--color-text-secondary)] hover:shadow-[8px_8px_0_var(--color-text-primary)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
                    Back to Home
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
