import React from 'react';

const Header = () => {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-bg-primary)]/80 backdrop-blur-md border-b border-[var(--color-text-secondary)]/10">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                {/* Logo handled by Bubble Menu */}
                <div className="flex items-center gap-2 opacity-0 pointer-events-none">
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-accent-primary)] flex items-center justify-center text-white font-bold text-xl shadow-lg transform rotate-3 hover:rotate-0 transition-all duration-300 cursor-pointer">
                        T
                    </div>
                    <span className="text-xl font-bold tracking-tight">Tickify</span>
                </div>

                {/* Navigation handled by Bubble Menu */}
                <div className="hidden md:block"></div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <button className="hidden md:block px-4 py-2 rounded-lg font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
                        Log in
                    </button>
                    <button className="px-5 py-2 rounded-lg bg-[var(--color-accent-primary)] text-white font-semibold shadow-[0px_4px_12px_rgba(37,99,235,0.3)] hover:shadow-[0px_6px_16px_rgba(37,99,235,0.4)] hover:-translate-y-0.5 transition-all duration-300">
                        Sign up
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
