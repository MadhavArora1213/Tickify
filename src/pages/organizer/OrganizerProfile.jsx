import React, { useState } from 'react';

const OrganizerProfile = () => {
    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] pt-24 pb-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <h1 className="text-4xl md:text-5xl font-black uppercase text-[var(--color-text-primary)] mb-8">Organizer Profile</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Left Column: Avatar & Quick Info */}
                    <div className="space-y-6">
                        <div className="neo-card bg-[var(--color-bg-surface)] p-6 border-4 border-[var(--color-text-primary)] shadow-[8px_8px_0_var(--color-text-primary)] text-center">
                            <div className="w-32 h-32 mx-auto bg-gray-200 rounded-full border-4 border-black overflow-hidden mb-4 group relative cursor-pointer">
                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Organizer" alt="Avatar" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-white font-black uppercase text-xs">Change</span>
                                </div>
                            </div>
                            <h2 className="text-xl font-black uppercase">Electric Dreams Co.</h2>
                            <p className="text-sm font-bold text-[var(--color-text-secondary)]">Member since 2023</p>
                            <div className="mt-4 flex justify-center gap-2">
                                <span className="bg-blue-100 text-blue-800 text-xs font-black uppercase px-2 py-1 border border-black">Verified</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Forms */}
                    <div className="md:col-span-2 space-y-8 animate-fade-in-up">

                        {/* Company Info */}
                        <div className="neo-card bg-[var(--color-bg-surface)] p-8 border-4 border-[var(--color-text-primary)] shadow-[8px_8px_0_var(--color-text-primary)] relative">
                            <h3 className="text-2xl font-black uppercase mb-6 flex items-center gap-2">
                                🏢 Company Details
                            </h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">Company Name</label>
                                        <input type="text" defaultValue="Electric Dreams Co." className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] px-4 py-2 font-bold" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">Tax ID / VAT</label>
                                        <input type="text" defaultValue="US-8829102" className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] px-4 py-2 font-bold" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">Business Address</label>
                                    <input type="text" defaultValue="123 Innovation Dr, Tech City, CA" className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] px-4 py-2 font-bold" />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">Support Email</label>
                                    <input type="email" defaultValue="help@electricdreams.com" className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] px-4 py-2 font-bold" />
                                </div>
                            </div>
                        </div>

                        {/* Notification Settings */}
                        <div className="neo-card bg-[var(--color-bg-surface)] p-8 border-4 border-[var(--color-text-primary)] shadow-[8px_8px_0_var(--color-text-primary)]">
                            <h3 className="text-2xl font-black uppercase mb-6 flex items-center gap-2">
                                🔔 Notifications
                            </h3>
                            <div className="space-y-4">
                                {[
                                    "Email me when a ticket is sold",
                                    "Email me on event day w/ summary",
                                    "Send weekly payout reports",
                                    "Notify for new reviews"
                                ].map((setting, i) => (
                                    <label key={i} className="flex items-center gap-3 cursor-pointer group">
                                        <input type="checkbox" defaultChecked className="w-5 h-5 border-2 border-black rounded text-[var(--color-accent-primary)] focus:ring-0" />
                                        <span className="font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-primary)] transition-colors">{setting}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-4">
                            <button className="neo-btn bg-white border-2 border-[var(--color-text-primary)] text-[var(--color-text-primary)] px-6 py-3 font-black uppercase shadow-[4px_4px_0_var(--color-text-primary)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_var(--color-text-primary)]">
                                Cancel
                            </button>
                            <button className="neo-btn bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] px-8 py-3 font-black uppercase shadow-[6px_6px_0_var(--color-text-secondary)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0_var(--color-text-primary)]">
                                Save Changes
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrganizerProfile;
