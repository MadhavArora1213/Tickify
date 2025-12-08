import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const OrganizerDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');

    // --- Mock Data for Analytics ---
    const stats = [
        { label: 'Total Sales', value: '$124,500', change: '+12%', color: 'bg-green-400', textColor: 'text-black' },
        { label: 'Tickets Sold', value: '8,432', change: '+5%', color: 'bg-purple-400', textColor: 'text-white' },
        { label: 'Active Events', value: '3', change: '0', color: 'bg-yellow-400', textColor: 'text-black' },
        { label: 'Page Views', value: '45.2k', change: '+28%', color: 'bg-blue-400', textColor: 'text-white' },
    ];

    // --- Tab Content Renderers ---
    const renderOverview = () => (
        <div className="space-y-8 animate-fade-in-up">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className={`p-6 border-4 border-black shadow-[8px_8px_0_black] transition-transform hover:-translate-y-1 ${stat.color} relative overflow-hidden group`}>
                        <h3 className={`text-4xl font-black mb-2 ${stat.textColor}`}>{stat.value}</h3>
                        <p className={`font-black uppercase text-sm ${stat.textColor} opacity-80`}>{stat.label}</p>
                    </div>
                ))}
            </div>

            <div className="bg-[var(--color-bg-surface)] p-6 border-4 border-[var(--color-text-primary)] shadow-[8px_8px_0_var(--color-text-primary)]">
                <h3 className="text-xl font-black uppercase mb-6 text-[var(--color-text-primary)]">Recent Activity</h3>
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex justify-between items-center p-3 border-2 border-[var(--color-text-secondary)]/20">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-green-400 border-2 border-black rounded-full flex items-center justify-center font-bold text-xs">S</div>
                                <div>
                                    <p className="font-bold text-sm text-[var(--color-text-primary)]">New Ticket Sold</p>
                                    <p className="text-xs text-[var(--color-text-secondary)]">Neon Nights Festival • General Admission</p>
                                </div>
                            </div>
                            <span className="font-black text-green-500">+$120</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderEvents = () => (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-black uppercase text-[var(--color-text-primary)]">My Events</h2>
                <button className="neo-btn bg-[var(--color-accent-primary)] text-white px-4 py-2 shadow-[4px_4px_0_black]">Create New +</button>
            </div>

            {[1, 2, 3].map((event) => (
                <div key={event} className="neo-card bg-[var(--color-bg-surface)] p-6 border-4 border-[var(--color-text-primary)] shadow-[6px_6px_0_var(--color-text-primary)] flex flex-col md:flex-row gap-6 relative">
                    <div className="w-full md:w-48 h-32 bg-gray-300 border-2 border-black relative overflow-hidden group">
                        <img src={`https://picsum.photos/seed/${event}/300/200`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" alt="Event" />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <h3 className="text-2xl font-black uppercase text-[var(--color-text-primary)]">Neon Nights Festival {2025 + event}</h3>
                            <span className="bg-green-100 text-green-800 text-xs font-black uppercase px-2 py-1 border border-black">Live</span>
                        </div>
                        <p className="text-sm font-bold text-[var(--color-text-secondary)] mt-1">March 15, 2025 • Cyber Arena, NY</p>

                        <div className="mt-4 w-full bg-[var(--color-bg-secondary)] h-4 border-2 border-black rounded-full overflow-hidden relative">
                            <div className="bg-[var(--color-accent-primary)] h-full w-3/4 absolute top-0 left-0"></div>
                            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white mix-blend-difference">75% SOLD OUT</div>
                        </div>

                        <div className="flex gap-2 mt-4">
                            <button className="text-xs font-black uppercase bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] border-2 border-[var(--color-text-primary)] px-3 py-1 hover:bg-[var(--color-text-primary)] hover:text-[var(--color-bg-primary)] transition-colors">Edit</button>
                            <Link to={`/organizer/events/${event}/analytics`} className="text-xs font-black uppercase bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] border-2 border-[var(--color-text-primary)] px-3 py-1 hover:bg-[var(--color-text-primary)] hover:text-[var(--color-bg-primary)] transition-colors">Analytics</Link>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderAttendees = () => (
        <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-3xl font-black uppercase text-[var(--color-text-primary)] mb-6">Attendees</h2>
            <div className="flex gap-4 mb-6">
                <input type="text" placeholder="Search by name or ticket ID..." className="flex-1 neo-input bg-[var(--color-bg-surface)] border-2 border-[var(--color-text-primary)] px-4 py-2 font-bold" />
                <button className="neo-btn bg-[var(--color-bg-surface)] border-2 border-[var(--color-text-primary)] px-6 font-black uppercase">Filter</button>
            </div>

            <div className="neo-card bg-[var(--color-bg-surface)] border-4 border-[var(--color-text-primary)] overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-[var(--color-bg-secondary)] border-b-4 border-[var(--color-text-primary)]">
                        <tr>
                            <th className="p-4 font-black uppercase">Name</th>
                            <th className="p-4 font-black uppercase">Ticket Type</th>
                            <th className="p-4 font-black uppercase">Status</th>
                            <th className="p-4 font-black uppercase text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-[var(--color-text-secondary)]/20">
                        {[1, 2, 3, 4, 5].map(i => (
                            <tr key={i} className="hover:bg-[var(--color-bg-secondary)]/50 transition-colors">
                                <td className="p-4 font-bold text-[var(--color-text-primary)]">User {i}</td>
                                <td className="p-4 font-medium text-[var(--color-text-secondary)]">VIP Pass</td>
                                <td className="p-4"><span className="text-xs font-black bg-green-200 text-green-900 border border-green-900 px-2 py-1">Checked In</span></td>
                                <td className="p-4 text-right"><button className="text-xs font-black uppercase underline">View</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderAnalytics = () => (
        <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-3xl font-black uppercase text-[var(--color-text-primary)] mb-6">Analytics & Reports</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-64">
                <div className="neo-card bg-[var(--color-bg-surface)] border-4 border-[var(--color-text-primary)] p-6 flex flex-col items-center justify-center shadow-[6px_6px_0_var(--color-text-primary)]">
                    <h3 className="uppercase font-black text-[var(--color-text-secondary)] mb-4">Traffic Source</h3>
                    <div className="flex gap-2 items-end h-32 w-full justify-center">
                        <div className="w-8 bg-blue-500 h-[40%] border-2 border-black" title="Social"></div>
                        <div className="w-8 bg-yellow-500 h-[80%] border-2 border-black" title="Direct"></div>
                        <div className="w-8 bg-green-500 h-[60%] border-2 border-black" title="Email"></div>
                    </div>
                    <div className="flex gap-6 mt-2 text-xs font-bold uppercase">
                        <span>Social</span><span>Direct</span><span>Email</span>
                    </div>
                </div>
                <div className="neo-card bg-[var(--color-bg-surface)] border-4 border-[var(--color-text-primary)] p-6 flex flex-col items-center justify-center shadow-[6px_6px_0_var(--color-text-primary)]">
                    <h3 className="uppercase font-black text-[var(--color-text-secondary)] mb-4">Sales Timeline</h3>
                    <div className="w-full h-32 border-b-2 border-l-2 border-black relative">
                        {/* Mock Line Chart */}
                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <polyline points="0,100 20,80 40,60 60,90 80,40 100,20" fill="none" stroke="var(--color-accent-primary)" strokeWidth="3" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderFinances = () => (
        <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-3xl font-black uppercase text-[var(--color-text-primary)] mb-6">Finances</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 bg-white border-4 border-black shadow-[6px_6px_0_black]">
                    <p className="text-sm font-black uppercase text-gray-500">Available Balance</p>
                    <h3 className="text-4xl font-black text-black">$8,240.00</h3>
                    <button className="mt-4 text-xs font-black uppercase bg-black text-white px-3 py-1">Withdraw</button>
                </div>
                <div className="p-6 bg-gray-100 border-4 border-black text-gray-400">
                    <p className="text-sm font-black uppercase">Pending Clearance</p>
                    <h3 className="text-4xl font-black">$1,200.00</h3>
                </div>
            </div>

            <h3 className="text-xl font-black uppercase text-[var(--color-text-primary)] mb-4">Recent Payouts</h3>
            <div className="space-y-2">
                <div className="flex justify-between p-4 bg-[var(--color-bg-surface)] border-2 border-[var(--color-text-primary)]">
                    <span className="font-bold">Payout to Bank ****4432</span>
                    <span className="font-black text-green-500">-$4,500.00</span>
                </div>
                <div className="flex justify-between p-4 bg-[var(--color-bg-surface)] border-2 border-[var(--color-text-primary)]">
                    <span className="font-bold">Payout to PayPal</span>
                    <span className="font-black text-green-500">-$2,100.00</span>
                </div>
            </div>
        </div>
    );

    const renderSettings = () => (
        <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-3xl font-black uppercase text-[var(--color-text-primary)] mb-6">Organizer Settings</h2>
            <div className="neo-card bg-[var(--color-bg-surface)] p-8 border-4 border-[var(--color-text-primary)] shadow-[8px_8px_0_var(--color-text-primary)] max-w-2xl">
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">Organizer Name</label>
                        <input type="text" defaultValue="Electric Dreams Co." className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] px-4 py-2 font-bold" />
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">Support Email</label>
                        <input type="email" defaultValue="help@electricdreams.com" className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] px-4 py-2 font-bold" />
                    </div>
                    <div className="pt-4">
                        <button className="neo-btn bg-[var(--color-accent-primary)] text-white px-6 py-3 uppercase shadow-[4px_4px_0_black]">Save Changes</button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'events': return renderEvents();
            case 'attendees': return renderAttendees();
            case 'analytics': return renderAnalytics();
            case 'finances': return renderFinances();
            case 'settings': return renderSettings();
            default: return renderOverview();
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] pt-24 pb-12 transition-colors duration-300">
            {/* Top Bar */}
            <nav className="fixed top-0 left-0 right-0 h-20 bg-[var(--color-bg-surface)] border-b-4 border-[var(--color-text-primary)] z-40 px-8 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] flex items-center justify-center font-black text-xl border-2 border-[var(--color-bg-primary)]">O</div>
                    <span className="font-black text-xl uppercase tracking-tighter hidden md:block">Organizer Panel</span>
                </div>
                <div className="flex items-center gap-6">
                    <button className="font-bold uppercase hover:underline text-[var(--color-text-primary)]">Help</button>
                    <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-[var(--color-text-primary)] overflow-hidden">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Organizer" alt="Profile" />
                    </div>
                </div>
            </nav>

            <div className="container mx-auto px-4 mt-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="w-full lg:w-64 flex-shrink-0">
                        <div className="bg-[var(--color-bg-surface)] border-4 border-[var(--color-text-primary)] shadow-[8px_8px_0_var(--color-text-primary)] p-4 sticky top-28">
                            <nav className="space-y-2">
                                {['Overview', 'Events', 'Attendees', 'Analytics', 'Finances', 'Settings'].map((item) => (
                                    <button
                                        key={item}
                                        onClick={() => setActiveTab(item.toLowerCase())}
                                        className={`w-full text-left px-4 py-3 font-black uppercase border-2 border-transparent hover:border-[var(--color-text-primary)] hover:bg-[var(--color-accent-secondary)] hover:text-white transition-all flex justify-between items-center group
                                        ${activeTab === item.toLowerCase() ? 'bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] border-[var(--color-text-primary)] shadow-[4px_4px_0_gray]' : 'text-[var(--color-text-secondary)]'}`}
                                    >
                                        {item}
                                        <span className={`opacity-0 group-hover:opacity-100 ${activeTab === item.toLowerCase() ? 'opacity-100' : ''}`}>&rarr;</span>
                                    </button>
                                ))}
                            </nav>

                            <div className="mt-8 pt-8 border-t-4 border-[var(--color-text-primary)]">
                                <button className="w-full py-3 bg-red-500 text-white font-black uppercase border-2 border-[var(--color-text-primary)] shadow-[4px_4px_0_var(--color-text-primary)] hover:shadow-[6px_6px_0_var(--color-text-primary)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
                                    Create Event +
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1">
                        {renderContent()}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default OrganizerDashboard;
