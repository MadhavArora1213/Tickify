import React, { useState } from 'react';

const Profile = () => {
    const [activeTab, setActiveTab] = useState('info');

    const renderContent = () => {
        switch (activeTab) {
            case 'info':
                return (
                    <div className="space-y-6 animate-fade-in-up">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-[var(--color-text-secondary)]">First Name</label>
                                <input type="text" defaultValue="John" className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-black rounded-lg px-4 py-3 font-bold text-[var(--color-text-primary)]" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-[var(--color-text-secondary)]">Last Name</label>
                                <input type="text" defaultValue="Doe" className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-black rounded-lg px-4 py-3 font-bold text-[var(--color-text-primary)]" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-[var(--color-text-secondary)]">Email Address</label>
                            <input type="email" defaultValue="john.doe@example.com" className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-black rounded-lg px-4 py-3 font-bold text-[var(--color-text-primary)]" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-[var(--color-text-secondary)]">Bio</label>
                            <textarea defaultValue="Music lover, tech enthusiast, and weekend traveler." rows="4" className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-black rounded-lg px-4 py-3 font-bold text-[var(--color-text-primary)]"></textarea>
                        </div>
                        <button className="neo-btn bg-[var(--color-accent-primary)] text-white px-6 py-3 shadow-[4px_4px_0_black]">SAVE CHANGES</button>
                    </div>
                );
            case 'security':
                return (
                    <div className="space-y-6 animate-fade-in-up">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-[var(--color-text-secondary)]">Current Password</label>
                            <input type="password" className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-black rounded-lg px-4 py-3 font-bold text-[var(--color-text-primary)]" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-[var(--color-text-secondary)]">New Password</label>
                            <input type="password" className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-black rounded-lg px-4 py-3 font-bold text-[var(--color-text-primary)]" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-[var(--color-text-secondary)]">Confirm New Password</label>
                            <input type="password" className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-black rounded-lg px-4 py-3 font-bold text-[var(--color-text-primary)]" />
                        </div>
                        <button className="neo-btn bg-[var(--color-warning)] text-white px-6 py-3 shadow-[4px_4px_0_black]">UPDATE PASSWORD</button>
                    </div>
                );
            case 'history':
                return (
                    <div className="space-y-4 animate-fade-in-up">
                        {[1, 2, 3].map((order) => (
                            <div key={order} className="neo-card p-4 border-2 border-black bg-[var(--color-bg-secondary)] flex justify-between items-center group hover:translate-x-1 transition-transform">
                                <div>
                                    <h4 className="font-black text-[var(--color-text-primary)] uppercase">Order #ORD-{202400 + order}</h4>
                                    <p className="text-xs font-bold text-[var(--color-text-secondary)]">2 Items • March {10 + order}, 2025</p>
                                </div>
                                <span className="font-black text-[var(--color-accent-primary)]">$120.00</span>
                            </div>
                        ))}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] pt-36 pb-24">
            <div className="container mx-auto px-4">
                <h1 className="text-4xl md:text-6xl font-black mb-12 uppercase text-center text-[var(--color-text-primary)]">
                    <span className="block dark:hidden" style={{ WebkitTextStroke: '2px black', color: 'white', textShadow: '4px 4px 0px #000' }}>My Profile</span>
                    <span className="hidden dark:block drop-shadow-[4px_4px_0_var(--color-accent-primary)]">My Profile</span>
                </h1>

                <div className="flex flex-col lg:flex-row gap-8 max-w-5xl mx-auto">
                    {/* Sidebar */}
                    <div className="w-full lg:w-1/4">
                        <div className="neo-card bg-[var(--color-bg-surface)] p-6 border-4 border-black shadow-[8px_8px_0_black]">
                            <div className="flex flex-col items-center mb-6">
                                <div className="w-24 h-24 rounded-full border-4 border-black bg-[var(--color-accent-secondary)] mb-3 overflow-hidden">
                                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=John" alt="Avatar" className="w-full h-full object-cover" />
                                </div>
                                <h2 className="font-black text-xl text-[var(--color-text-primary)] uppercase">John Doe</h2>
                                <p className="text-xs font-bold text-[var(--color-text-secondary)]">Member since 2024</p>
                            </div>

                            <nav className="space-y-2">
                                {[
                                    { id: 'info', label: 'Personal Info', icon: '👤' },
                                    { id: 'security', label: 'Security', icon: '🔒' },
                                    { id: 'notifications', label: 'Notifications', icon: '🔔' },
                                    { id: 'history', label: 'Order History', icon: '📜' },
                                    { id: 'saved', label: 'Saved Events', icon: '❤️' },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full text-left px-4 py-3 font-black uppercase text-sm border-2 border-black transition-all flex items-center gap-3
                                        ${activeTab === tab.id
                                                ? 'bg-[var(--color-accent-primary)] text-white shadow-[4px_4px_0_black] translate-x-[-2px] translate-y-[-2px]'
                                                : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-primary)]'}`}
                                    >
                                        <span>{tab.icon}</span> {tab.label}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="w-full lg:w-3/4">
                        <div className="neo-card bg-[var(--color-bg-surface)] p-8 border-4 border-black shadow-[8px_8px_0_black] min-h-[500px]">
                            <h3 className="text-2xl font-black text-[var(--color-text-primary)] mb-6 uppercase border-b-4 border-black pb-4">
                                {activeTab.replace('-', ' ')}
                            </h3>
                            {renderContent()}

                            {/* Placeholder for unimplemented tabs */}
                            {['notifications', 'saved'].includes(activeTab) && (
                                <div className="text-center py-10">
                                    <span className="text-4xl">🚧</span>
                                    <p className="font-bold text-[var(--color-text-secondary)] mt-4">This section is under construction.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
