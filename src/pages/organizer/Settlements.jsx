import React, { useState } from 'react';

const Settlements = () => {
    // Mock Data
    const settlements = [
        { id: "SET-8821", date: "May 15, 2025", amount: "$12,450.00", status: "completed", method: "Bank Transfer •••• 4421" },
        { id: "SET-8902", date: "Jun 01, 2025", amount: "$4,200.00", status: "processing", method: "PayPal" },
        { id: "SET-9100", date: "Jul 10, 2025", amount: "$8,150.00", status: "pending", method: "Bank Transfer •••• 4421" },
    ];

    const getStatusBadge = (status) => {
        const styles = {
            completed: "bg-green-400 text-black border-black",
            processing: "bg-yellow-300 text-black border-yellow-600",
            pending: "bg-gray-300 text-gray-700 border-gray-500",
            failed: "bg-red-400 text-white border-red-800"
        };
        return (
            <span className={`px-2 py-1 text-xs font-black uppercase border-2 ${styles[status]}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] pt-24 pb-12">
            <div className="container mx-auto px-4">
                <h1 className="text-4xl md:text-5xl font-black uppercase text-[var(--color-text-primary)] mb-8">Settlements</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Content: History */}
                    <div className="lg:col-span-2 space-y-8 animate-fade-in-up">

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="neo-card bg-[var(--color-bg-surface)] p-6 border-4 border-[var(--color-text-primary)] shadow-[6px_6px_0_var(--color-text-primary)]">
                                <p className="text-sm font-black uppercase text-[var(--color-text-secondary)]">Available to Withdraw</p>
                                <h2 className="text-4xl font-black text-[var(--color-text-primary)]">$8,150.00</h2>
                            </div>
                            <div className="neo-card bg-[var(--color-bg-surface)] p-6 border-4 border-[var(--color-text-primary)] shadow-[6px_6px_0_var(--color-text-primary)]">
                                <p className="text-sm font-black uppercase text-[var(--color-text-secondary)]">Total Payouts</p>
                                <h2 className="text-4xl font-black text-[var(--color-success)]">$45,200.00</h2>
                            </div>
                        </div>

                        {/* Recent Settlements List */}
                        <div className="neo-card bg-[var(--color-bg-surface)] p-6 border-4 border-[var(--color-text-primary)] shadow-[8px_8px_0_var(--color-text-primary)]">
                            <h3 className="text-xl font-black uppercase mb-6 border-b-2 border-black pb-2">Settlement History</h3>
                            <div className="space-y-4">
                                {settlements.map((s) => (
                                    <div key={s.id} className="flex flex-col md:flex-row justify-between items-center p-4 border-2 border-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] transition-colors">
                                        <div className="mb-2 md:mb-0">
                                            <div className="flex items-center gap-3">
                                                <span className="font-black text-lg text-[var(--color-text-primary)]">{s.id}</span>
                                                {getStatusBadge(s.status)}
                                            </div>
                                            <p className="text-xs font-bold text-[var(--color-text-secondary)]">{s.date} • {s.method}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-xl font-black text-[var(--color-text-primary)]">{s.amount}</span>
                                            {s.status === 'completed' && <span className="text-[10px] font-bold text-green-600 block">PAID</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-6 py-2 bg-[var(--color-bg-secondary)] border-2 border-dashed border-[var(--color-text-primary)] font-black uppercase hover:bg-[var(--color-text-primary)] hover:text-[var(--color-bg-primary)] transition-colors">
                                View Full History
                            </button>
                        </div>
                    </div>

                    {/* Sidebar: Request & Methods */}
                    <div className="space-y-8 animate-fade-in-up animation-delay-200">
                        {/* Request Settlement */}
                        <div className="neo-card bg-[var(--color-accent-secondary)] p-6 border-4 border-black shadow-[8px_8px_0_black] text-white">
                            <h3 className="text-xl font-black uppercase mb-4">Request Payout</h3>
                            <p className="font-bold text-sm mb-6 opacity-90">
                                Funds become available for withdrawal 3 days after event completion.
                            </p>
                            <div className="mb-4">
                                <label className="block text-xs font-black uppercase mb-1">Amount</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black font-black">$</span>
                                    <input type="number" defaultValue="8150.00" className="w-full pl-8 pr-4 py-3 bg-white text-black font-black border-2 border-black" />
                                </div>
                            </div>
                            <button className="w-full py-3 bg-black text-white font-black uppercase border-2 border-white hover:bg-white hover:text-black hover:border-black transition-colors shadow-[4px_4px_0_black]">
                                Withdraw Funds
                            </button>
                        </div>

                        {/* Bank Accounts */}
                        <div className="neo-card bg-[var(--color-bg-surface)] p-6 border-4 border-[var(--color-text-primary)] shadow-[8px_8px_0_var(--color-text-primary)]">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-black uppercase">Payout Methods</h3>
                                <button className="text-xs font-black uppercase underline">Edit</button>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 border-2 border-black bg-gray-100">
                                    <span className="text-2xl">🏦</span>
                                    <div className="flex-1">
                                        <p className="font-black text-sm">Chase Bank</p>
                                        <p className="text-xs font-bold text-gray-500">Checking •••• 4421</p>
                                    </div>
                                    <span className="text-xs font-black bg-black text-white px-2 py-0.5">Primary</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 border-2 border-dashed border-gray-400 text-gray-400 hover:border-black hover:text-black cursor-pointer transition-colors">
                                    <span className="text-2xl">+</span>
                                    <span className="font-black text-sm uppercase">Add Method</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Settlements;
