import React from 'react';
import { Link } from 'react-router-dom';

const AdminAnalytics = () => {
    return (
        <div className="min-h-screen bg-gray-100 font-mono text-sm text-black">
            {/* Header */}
            <div className="bg-black text-white p-4 border-b-4 border-gray-400 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <Link to="/admin/dashboard" className="w-8 h-8 bg-gray-700 flex items-center justify-center font-black text-white border border-gray-500 hover:bg-red-600 transition-colors">&larr;</Link>
                    <span className="font-bold uppercase tracking-widest">Platform Analytics</span>
                </div>
                <button className="bg-green-600 text-white px-4 py-1 text-xs font-black uppercase border border-white hover:bg-green-500">
                    Export CSV
                </button>
            </div>

            <div className="p-6 max-w-7xl mx-auto space-y-6">

                {/* Big Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0_black]">
                        <h3 className="text-xl font-black uppercase mb-4">Revenue Growth</h3>
                        <div className="h-48 flex items-end gap-2 border-b-2 border-black pb-2 px-2">
                            {[20, 35, 40, 30, 55, 60, 45, 75, 80, 70, 90, 100].map((h, i) => (
                                <div key={i} className="flex-1 bg-green-500 hover:bg-green-400 transition-colors border border-black relative group" style={{ height: `${h}%` }}>
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white px-2 py-1 text-[10px] hidden group-hover:block z-10">
                                        ${h}k
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-2 text-xs font-bold text-gray-500 uppercase">
                            <span>Jan</span>
                            <span>Dec</span>
                        </div>
                    </div>

                    <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0_black]">
                        <h3 className="text-xl font-black uppercase mb-4">User Demographics</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-yellow-100 border-2 border-black text-center">
                                <span className="block text-3xl font-black">68%</span>
                                <span className="text-xs uppercase font-bold text-gray-500">Mobile Users</span>
                            </div>
                            <div className="p-4 bg-blue-100 border-2 border-black text-center">
                                <span className="block text-3xl font-black">24-30</span>
                                <span className="text-xs uppercase font-bold text-gray-500">Avg Age</span>
                            </div>
                            <div className="col-span-2 p-4 bg-gray-100 border-2 border-black">
                                <div className="flex justify-between text-xs font-bold uppercase mb-1">
                                    <span>North America</span>
                                    <span>45%</span>
                                </div>
                                <div className="w-full bg-gray-300 h-2 border border-black mb-2">
                                    <div className="bg-black h-full w-[45%]"></div>
                                </div>

                                <div className="flex justify-between text-xs font-bold uppercase mb-1">
                                    <span>Europe</span>
                                    <span>30%</span>
                                </div>
                                <div className="w-full bg-gray-300 h-2 border border-black mb-2">
                                    <div className="bg-black h-full w-[30%]"></div>
                                </div>

                                <div className="flex justify-between text-xs font-bold uppercase mb-1">
                                    <span>Asia</span>
                                    <span>25%</span>
                                </div>
                                <div className="w-full bg-gray-300 h-2 border border-black">
                                    <div className="bg-black h-full w-[25%]"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* KPI Text Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {['Avg Ticket Price: $45', 'Conversion Rate: 3.2%', 'Refund Rate: 0.5%', 'Churn: 1.2%'].map((kpi, i) => (
                        <div key={i} className="bg-black text-white p-4 border-2 border-gray-500 font-bold uppercase text-center hover:bg-gray-900 transition-colors">
                            {kpi}
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default AdminAnalytics;
