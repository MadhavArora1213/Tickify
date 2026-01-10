import React, { useState, useEffect, useRef } from 'react';
import SpotlightCard from './react-bits/SpotlightCard';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { gsap } from 'gsap';

const categories = [
    { id: 'All', name: 'All Events', icon: '🔥' },
    { id: 'Music', name: 'Music', icon: '🎵' },
    { id: 'Technology', name: 'Technology', icon: '💻' },
    { id: 'Arts', name: 'Arts & Theater', icon: '🎭' },
    { id: 'Food', name: 'Food & Drink', icon: '🍔' },
    { id: 'Sports', name: 'Sports', icon: '⚽' },
    { id: 'Business', name: 'Business', icon: '💼' },
    { id: 'Wellness', name: 'Wellness', icon: '🧘' },
];

const CategoryFilters = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const activeCategory = searchParams.get('cat') || 'All';
    const containerRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    gsap.fromTo(
                        '.category-card',
                        { y: 50, opacity: 0 },
                        {
                            y: 0,
                            opacity: 1,
                            duration: 0.5,
                            stagger: 0.1,
                            ease: 'power3.out',
                            overwrite: 'auto'
                        }
                    );
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <section ref={containerRef} className="container mx-auto px-4 mb-20">
            <div className="flex flex-col items-center mb-12 text-center">
                <span className="text-[var(--color-accent-primary)] font-black tracking-widest uppercase text-sm mb-2 border-2 border-black bg-white px-2 py-1 shadow-[2px_2px_0_black]">Explore by Interest</span>
                <h2 className="text-4xl md:text-6xl font-black text-[var(--color-text-primary)] uppercase">
                    <span className="block dark:hidden" style={{ WebkitTextStroke: '2px black', color: 'white', textShadow: '4px 4px 0px #000' }}>Find Your Vibe</span>
                    <span className="hidden dark:block drop-shadow-[4px_4px_0_var(--color-accent-secondary)]">Find Your Vibe</span>
                </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {categories.map((cat) => (
                    <div
                        key={cat.id}
                        onClick={() => navigate(`/events?cat=${cat.id}`)}
                        className={`
                          category-card cursor-pointer group flex flex-col items-center justify-center p-4 min-h-[120px] transition-all duration-200 border-2 border-black rounded-xl
                          ${activeCategory === cat.id
                                ? 'bg-[var(--color-accent-primary)] text-white shadow-[4px_4px_0_black] translate-y-[-2px] translate-x-[-2px]'
                                : 'bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-secondary)] shadow-[4px_4px_0_black] hover:translate-y-[-4px] hover:translate-x-[-4px] hover:shadow-[6px_6px_0_black]'}
                        `}
                    >
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <span
                                className={`text-4xl mb-2 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12 ${activeCategory === cat.id ? 'animate-bounce' : ''}`}
                            >
                                {cat.icon}
                            </span>
                            <span className={`text-sm font-black tracking-tight uppercase transition-colors duration-300 ${activeCategory === cat.id ? 'text-white' : 'text-[var(--color-text-primary)]'}`}>
                                {cat.name}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default CategoryFilters;
