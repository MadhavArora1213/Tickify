import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    return (
        <div className="min-h-screen bg-gray-100 font-mono text-sm text-black">
            {/* Top Bar */}
            <div className="bg-black text-white p-4 border-b-4 border-gray-400 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-red-600 flex items-center justify-center font-black">A</div>
                    <span className="font-bold uppercase tracking-widest hidden md:block">System Administrator</span>
                </div>
                <div className="flex gap-4 text-xs font-bold items-center">
                    <span className="text-green-400">● System Operational</span>
                    <span className="opacity-50">|</span>
                    <span>v2.4.0-stable</span>
                    <Link to="/admin/login" className="uppercase underline hover:text-red-400 ml-4">Logout</Link>
                </div>
            </div>

            <div className="p-6 max-w-7xl mx-auto">
                <h1 className="text-3xl font-black uppercase mb-8 border-b-4 border-black pb-2 inline-block">Dashboard Overview</h1>

                {/* KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[
                        { label: 'Total Users', val: '142,302', change: '+124 today', color: 'bg-white' },
                        { label: 'Total Revenue', val: '$4.2M', change: '+8% this month', color: 'bg-green-100' },
                        { label: 'Active Events', val: '1,204', change: '85 pending', color: 'bg-blue-100' },
                        { label: 'Server Load', val: '42%', change: 'Stable', color: 'bg-yellow-100' },
                    ].map((stat, i) => (
                        <div key={i} className={`p-4 border-2 border-black shadow-[4px_4px_0_black] ${stat.color}`}>
                            <p className="text-xs font-bold uppercase text-gray-500 mb-1">{stat.label}</p>
                            <p className="text-2xl font-black">{stat.val}</p>
                            <p className="text-xs mt-2 border-t border-black/10 pt-2">{stat.change}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Pending Approvals */}
                    <div className="lg:col-span-2 border-2 border-black bg-white shadow-[6px_6px_0_black] p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black uppercase">Pending Event Approvals (5)</h2>
                            <button className="text-xs font-bold uppercase underline">View All</button>
                        </div>
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex justify-between items-center p-3 border border-black bg-gray-50 hover:bg-yellow-50 transition-colors">
                                    <div className="flex gap-4 items-center">
                                        <div className="w-12 h-12 bg-gray-300 border border-black shrink-0 flex items-center justify-center font-bold text-xs">IMG</div>
                                        <div>
                                            <p className="font-bold uppercase">Cyberpunk Rave 2077</p>
                                            <p className="text-xs text-gray-500">Org: Electric Dreams Co.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="px-3 py-1 bg-green-500 text-white font-bold text-xs border border-black hover:shadow-[2px_2px_0_black] transition-all">Approve</button>
                                        <button className="px-3 py-1 bg-red-500 text-white font-bold text-xs border border-black hover:shadow-[2px_2px_0_black] transition-all">Reject</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* System Health */}
                    <div className="border-2 border-black bg-black text-white shadow-[6px_6px_0_gray] p-6">
                        <h2 className="text-xl font-black uppercase mb-6 text-green-400">System Log</h2>
                        <div className="space-y-2 font-mono text-xs max-h-64 overflow-y-auto">
                            <p><span className="text-gray-500">[21:42:01]</span> User #8821 registered</p>
                            <p><span className="text-gray-500">[21:41:55]</span> Payment gateway latency: 24ms</p>
                            <p><span className="text-gray-500">[21:40:12]</span> <span className="text-red-400">WARN: High traffic on Node-3</span></p>
                            <p><span className="text-gray-500">[21:38:00]</span> Database backup completed</p>
                            <p><span className="text-gray-500">[21:35:22]</span> New organizer application rcvd</p>
                            <p><span className="text-gray-500">[21:32:10]</span> Cache cleared successfully</p>
                            <p><span className="text-gray-500">[21:15:00]</span> Daily cron job executed</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
