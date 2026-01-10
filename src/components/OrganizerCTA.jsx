import React from 'react';
import { Link } from 'react-router-dom';

const OrganizerCTA = () => {
    return (
        <section className="py-16 md:py-24 bg-gradient-to-br from-black via-gray-900 to-black text-white relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -left-20 w-60 md:w-96 h-60 md:h-96 bg-[var(--color-accent-primary)]/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-20 -right-20 w-60 md:w-96 h-60 md:h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-10">
                    <div className="grid grid-cols-6 md:grid-cols-12 gap-4 w-full h-full p-4">
                        {[...Array(48)].map((_, i) => (
                            <div key={i} className="bg-white/5 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
                    {/* Left Content */}
                    <div className="flex-1 text-center lg:text-left">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            <span className="text-xs font-bold uppercase tracking-wider">Now Accepting Applications</span>
                        </div>

                        {/* Headline */}
                        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase leading-tight mb-4 md:mb-6">
                            Host Events
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent-primary)] to-purple-400">
                                That Sell Out
                            </span>
                        </h2>

                        {/* Description */}
                        <p className="text-base md:text-lg text-gray-300 mb-6 md:mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                            Join Tickify as a verified organizer. Access powerful tools for ticketing,
                            real-time analytics, marketing automation, and seamless payouts.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <Link
                                to="/organizer/register"
                                className="group relative inline-flex items-center justify-center gap-2 bg-[var(--color-accent-primary)] text-black px-6 md:px-8 py-3 md:py-4 font-black uppercase text-sm md:text-base border-2 border-[var(--color-accent-primary)] overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(var(--color-accent-primary-rgb),0.5)]"
                            >
                                <span className="relative z-10">Apply as Organizer</span>
                                <svg className="w-5 h-5 relative z-10 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>
                            <Link
                                to="/organizer/login"
                                className="inline-flex items-center justify-center gap-2 bg-transparent text-white px-6 md:px-8 py-3 md:py-4 font-bold uppercase text-sm md:text-base border-2 border-white/30 hover:border-white hover:bg-white/10 transition-all duration-300"
                            >
                                Already a Host? Login
                            </Link>
                        </div>
                    </div>

                    {/* Right: Features Grid */}
                    <div className="flex-1 w-full max-w-lg lg:max-w-none">
                        <div className="grid grid-cols-2 gap-3 md:gap-4">
                            {[
                                { icon: '🎫', title: 'Custom Tickets', desc: 'Design branded passes', color: 'from-blue-500/20 to-blue-600/10' },
                                { icon: '📊', title: 'Live Analytics', desc: 'Real-time insights', color: 'from-green-500/20 to-green-600/10' },
                                { icon: '💳', title: 'Fast Payouts', desc: 'Direct bank transfer', color: 'from-yellow-500/20 to-yellow-600/10' },
                                { icon: '🛡️', title: 'Fraud Shield', desc: 'AI-powered security', color: 'from-purple-500/20 to-purple-600/10' }
                            ].map((feature, idx) => (
                                <div
                                    key={idx}
                                    className={`group bg-gradient-to-br ${feature.color} backdrop-blur-sm border border-white/10 p-4 md:p-6 rounded-xl hover:border-white/30 hover:scale-105 transition-all duration-300 cursor-default`}
                                >
                                    <span className="text-2xl md:text-3xl mb-2 md:mb-3 block group-hover:scale-110 transition-transform">{feature.icon}</span>
                                    <h3 className="text-sm md:text-base font-black uppercase mb-1 text-white">{feature.title}</h3>
                                    <p className="text-xs text-gray-400 font-medium">{feature.desc}</p>
                                </div>
                            ))}
                        </div>

                        {/* Stats Row */}
                        <div className="mt-4 md:mt-6 grid grid-cols-3 gap-3 md:gap-4">
                            {[
                                { value: '500+', label: 'Organizers' },
                                { value: '2M+', label: 'Tickets Sold' },
                                { value: '₹50Cr+', label: 'Payouts Made' }
                            ].map((stat, idx) => (
                                <div key={idx} className="text-center py-3 md:py-4 bg-white/5 rounded-lg border border-white/10">
                                    <div className="text-lg md:text-2xl font-black text-[var(--color-accent-primary)]">{stat.value}</div>
                                    <div className="text-[10px] md:text-xs text-gray-400 uppercase font-bold tracking-wider">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Gradient Line */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--color-accent-primary)] to-transparent"></div>
        </section>
    );
};

export default OrganizerCTA;
