import React from 'react';
import SplitText from './react-bits/SplitText';
import ShinyText from './react-bits/ShinyText';
import BlurText from './react-bits/BlurText';
import Magnet from './react-bits/Magnet';
import LaserFlow from './react-bits/LaserFlow';
import TrueFocus from './react-bits/TrueFocus';




const Hero = () => {
    const [theme, setTheme] = React.useState('dark');

    React.useEffect(() => {
        // Initial check
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        setTheme(currentTheme);

        // Observer for theme changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                    setTheme(document.documentElement.getAttribute('data-theme'));
                }
            });
        });

        observer.observe(document.documentElement, { attributes: true });
        return () => observer.disconnect();
    }, []);

    // Color: Blue for Dark Mode (#2563EB), Dark Purple/Blue for Light Mode (#4F46E5) for visibility
    const laserColor = theme === 'dark' ? '#2563EB' : '#4F46E5';

    return (
        <section className="relative pt-24 md:pt-36 pb-12 md:pb-20 overflow-hidden bg-[var(--color-bg-primary)]">
            {/* LaserFlow Background */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
                <LaserFlow
                    color={laserColor}
                    flowSpeed={0.5}
                    wispDensity={1.2}
                />
            </div>

            <div className="container mx-auto px-4 text-center z-10 flex flex-col items-center relative">
                <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-6 leading-none text-[var(--color-text-primary)] uppercase transform -rotate-2">
                    {theme === 'dark' ? (
                        <div className="drop-shadow-[6px_6px_0_var(--color-accent-primary)]">
                            <ShinyText
                                text="Discover Events"
                                disabled={false}
                                speed={3}
                                className="inline-block"
                            />
                            <br />
                            <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent-secondary)] to-[var(--color-accent-primary)] animate-pulse stroke-black stroke-2" style={{ WebkitTextStroke: '2px black' }}>
                                That You'll Love
                            </span>
                        </div>
                    ) : (
                        <div className="drop-shadow-[4px_4px_0_#000]">
                            <span className="text-white" style={{ WebkitTextStroke: '3px black' }}>Discover Events</span>
                            <br />
                            <span className="text-[var(--color-accent-primary)]" style={{ WebkitTextStroke: '2px black' }}>
                                That You'll Love
                            </span>
                        </div>
                    )}
                </h1>

                <p className="text-xl md:text-2xl font-bold text-[var(--color-text-primary)] mb-10 max-w-3xl mx-auto leading-relaxed border-2 border-dashed border-[var(--color-text-muted)] p-4 rounded-xl rotate-1 bg-[var(--color-bg-surface)]/80 backdrop-blur-sm">
                    The most <span className="text-[var(--color-accent-secondary)] underline decoration-4 decoration-wavy">vibrant</span> platform to find concerts, workshops, and meetups.
                    Book tickets in seconds and create memories that last.
                </p>

                {/* Search Bar */}
                <div className="max-w-4xl w-full mx-auto relative group z-20">
                    <div className="neo-card bg-[var(--color-bg-surface)] p-4 flex flex-col md:flex-row items-center gap-4 border-4 border-black shadow-[12px_12px_0_black]">
                        <div className="flex-1 w-full md:w-auto flex items-center px-4 bg-[var(--color-bg-secondary)] border-2 border-black rounded-lg h-16 shadow-[4px_4px_0_rgba(0,0,0,0.2)]">
                            <svg className="w-8 h-8 text-[var(--color-text-primary)] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="SEARCH EVENTS..."
                                className="w-full bg-transparent border-none focus:ring-0 text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] h-full outline-none font-bold uppercase text-lg"
                            />
                        </div>
                        <div className="hidden md:flex flex-1 items-center px-4 w-1/3 bg-[var(--color-bg-secondary)] border-2 border-black rounded-lg h-16 shadow-[4px_4px_0_rgba(0,0,0,0.2)]">
                            <svg className="w-8 h-8 text-[var(--color-text-primary)] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="LOCATION"
                                className="w-full bg-transparent border-none focus:ring-0 text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] h-full outline-none font-bold uppercase text-lg"
                            />
                        </div>

                        <Magnet padding={50} magnetStrength={3}>
                            <button className="w-full md:w-auto px-8 py-4 bg-[var(--color-accent-primary)] text-white font-black text-xl rounded-lg border-2 border-black shadow-[6px_6px_0_black] hover:shadow-[8px_8px_0_black] hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all uppercase">
                                Search
                            </button>
                        </Magnet>

                    </div>
                </div>

                {/* Floating elements visualization */}
                <div className="mt-20 flex flex-wrap justify-center gap-8 md:gap-12">
                    <div className="neo-card bg-[var(--color-bg-secondary)] p-6 -rotate-3 hover:rotate-0 transition-transform">
                        <span className="block text-4xl md:text-5xl font-black text-[var(--color-accent-primary)] mb-2">10k+</span>
                        <span className="text-xl font-bold uppercase text-[var(--color-text-primary)]">Events</span>
                    </div>
                    <div className="neo-card bg-[var(--color-bg-secondary)] p-6 rotate-2 hover:rotate-0 transition-transform">
                        <span className="block text-4xl md:text-5xl font-black text-[var(--color-accent-secondary)] mb-2">50k+</span>
                        <span className="text-xl font-bold uppercase text-[var(--color-text-primary)]">Users</span>
                    </div>
                    <div className="neo-card bg-[var(--color-bg-secondary)] p-6 -rotate-2 hover:rotate-0 transition-transform">
                        <span className="block text-4xl md:text-5xl font-black text-[var(--color-success)] mb-2">1k+</span>
                        <span className="text-xl font-bold uppercase text-[var(--color-text-primary)]">Organizers</span>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
