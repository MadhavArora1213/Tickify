import React from 'react';

const About = () => {
    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] pt-24 pb-12 px-4">
            <div className="max-w-4xl mx-auto space-y-12">

                {/* Hero Section */}
                <div className="text-center space-y-6">
                    <h1 className="text-5xl md:text-7xl font-black uppercase text-[var(--color-text-primary)] tracking-tighter">
                        We Are <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">Tickify.</span>
                    </h1>
                    <p className="text-xl md:text-2xl font-bold text-[var(--color-text-secondary)] max-w-2xl mx-auto">
                        Disrupting the event industry with bold design, seamless tech, and zero hidden fees.
                    </p>
                </div>

                {/* Mission Card */}
                <div className="neo-card bg-[var(--color-bg-surface)] border-4 border-[var(--color-text-primary)] p-8 md:p-12 shadow-[12px_12px_0_var(--color-text-primary)] transform hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[16px_16px_0_var(--color-text-primary)] transition-all">
                    <h2 className="text-3xl font-black uppercase mb-6 flex items-center gap-4">
                        <span className="text-4xl text-[var(--color-accent-primary)]">🚀</span>
                        Our Mission
                    </h2>
                    <p className="text-lg font-medium leading-relaxed mb-6">
                        We believe buying tickets shouldn't be a headache. It should be the start of the excitement.
                        Tickify was born from the frustration of clunky interfaces, hidden service charges, and boring designs.
                    </p>
                    <p className="text-lg font-medium leading-relaxed">
                        We're here to give control back to organizers and joy back to attendees.
                        <span className="font-black bg-yellow-300 px-1 mx-1 text-black">No BS. Just Tickets.</span>
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { label: "Events Hosted", value: "10K+", color: "bg-blue-400" },
                        { label: "Happy Users", value: "2M+", color: "bg-green-400" },
                        { label: "Countries", value: "45", color: "bg-purple-400" }
                    ].map((stat, i) => (
                        <div key={i} className={`${stat.color} border-4 border-black p-6 text-center transform rotate-1 hover:rotate-0 transition-transform`}>
                            <h3 className="text-5xl font-black text-black mb-2">{stat.value}</h3>
                            <p className="font-bold uppercase text-black tracking-widest">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Team Section */}
                <div>
                    <h2 className="text-4xl font-black uppercase text-center mb-10 text-[var(--color-text-primary)]">The Squad</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((member) => (
                            <div key={member} className="neo-card bg-[var(--color-bg-surface)] border-4 border-[var(--color-text-primary)] p-4 text-center group">
                                <div className="w-full h-40 bg-gray-200 border-2 border-[var(--color-text-primary)] mb-4 overflow-hidden relative">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Member${member}`} alt="Team" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                </div>
                                <h3 className="font-black uppercase text-lg text-[var(--color-text-primary)]">Dev {member}</h3>
                                <p className="text-xs font-bold text-[var(--color-text-secondary)] uppercase">Core Engineer</p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default About;
