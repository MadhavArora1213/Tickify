import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const AdminEventApproval = () => {
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [rejectMode, setRejectMode] = useState(false);

    // Mock Pending Events
    const events = [
        { id: 1, title: 'Cyberpunk Rave 2077', organizer: 'Electric Dreams Co.', date: 'Dec 31, 2025', status: 'pending', description: 'A futuristic rave experience.' },
        { id: 2, title: 'Tech Startups Summit', organizer: 'Innovate Hub', date: 'Jan 15, 2026', status: 'pending', description: 'Networking for founders.' },
        { id: 3, title: 'Indie Art Fair', organizer: 'Art Collective', date: 'Feb 10, 2026', status: 'pending', description: 'Local artists showcasing work.' },
    ];

    return (
        <div className="min-h-screen bg-gray-100 font-mono text-sm text-black">
            {/* Header */}
            <div className="bg-black text-white p-4 border-b-4 border-gray-400 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <Link to="/admin/dashboard" className="w-8 h-8 bg-gray-700 flex items-center justify-center font-black text-white border border-gray-500 hover:bg-red-600 transition-colors">&larr;</Link>
                    <span className="font-bold uppercase tracking-widest">Event Approvals</span>
                </div>
                <div className="text-xs font-bold text-yellow-400">Queue: {events.length} Pending</div>
            </div>

            {/* Mobile View Toggle Logic */}
            <div className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 relative">

                {/* List Column */}
                <div className={`lg:col-span-1 space-y-4 ${selectedEvent ? 'hidden lg:block' : 'block'}`}>
                    <h2 className="lg:hidden text-xl font-black uppercase mb-4">Pending Events</h2>
                    {events.map(event => (
                        <div
                            key={event.id}
                            onClick={() => { setSelectedEvent(event); setRejectMode(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            className={`p-4 border-2 cursor-pointer transition-all hover:bg-yellow-50
                            ${selectedEvent?.id === event.id ? 'bg-yellow-100 border-black shadow-[4px_4px_0_black]' : 'bg-white border-gray-400'}`}
                        >
                            <p className="font-bold uppercase text-xs text-gray-500 mb-1">{event.date}</p>
                            <h3 className="font-black uppercase text-lg leading-tight mb-2">{event.title}</h3>
                            <p className="text-xs font-bold">{event.organizer}</p>
                        </div>
                    ))}
                    {events.length === 0 && <p className="text-gray-500 italic">No pending events.</p>}
                </div>

                {/* Detail Column */}
                <div className={`lg:col-span-2 ${!selectedEvent ? 'hidden lg:block' : 'block'}`}>
                    {selectedEvent ? (
                        <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0_gray] relative animate-fade-in">
                            {/* Mobile Back Button */}
                            <button
                                onClick={() => setSelectedEvent(null)}
                                className="lg:hidden mb-4 flex items-center gap-2 text-sm font-black uppercase underline"
                            >
                                &larr; Back to List
                            </button>

                            <div className="absolute top-0 right-0 bg-yellow-400 text-black px-4 py-1 text-xs font-black uppercase border-b-2 border-l-2 border-black">
                                Reviewing ID: #{selectedEvent.id}
                            </div>

                            <h2 className="text-3xl font-black uppercase mb-4 mt-4 lg:mt-0">{selectedEvent.title}</h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 border-b-2 border-gray-200 pb-6">
                                <div>
                                    <span className="block text-xs font-bold uppercase text-gray-500">Organizer</span>
                                    <span className="text-lg font-bold">{selectedEvent.organizer}</span>
                                </div>
                                <div>
                                    <span className="block text-xs font-bold uppercase text-gray-500">Event Date</span>
                                    <span className="text-lg font-bold">{selectedEvent.date}</span>
                                </div>
                            </div>

                            <div className="mb-8">
                                <span className="block text-xs font-bold uppercase text-gray-500 mb-2">Description</span>
                                <p className="bg-gray-100 p-4 border-2 border-gray-300 font-medium">
                                    {selectedEvent.description}
                                </p>
                            </div>

                            {/* Actions */}
                            {!rejectMode ? (
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button className="flex-1 py-4 bg-green-600 text-white font-black uppercase border-2 border-black hover:bg-green-500 shadow-[4px_4px_0_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_black] transition-all">
                                        Approve Event
                                    </button>
                                    <button
                                        onClick={() => setRejectMode(true)}
                                        className="flex-1 py-4 bg-red-600 text-white font-black uppercase border-2 border-black hover:bg-red-500 shadow-[4px_4px_0_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_black] transition-all"
                                    >
                                        Reject...
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-red-50 p-4 border-2 border-red-500 animate-fade-in-up">
                                    <h4 className="font-black uppercase text-red-600 mb-2">Reason for Rejection</h4>
                                    <textarea className="w-full border-2 border-black p-2 mb-4 font-bold" rows="3" placeholder="Violation of content policy..."></textarea>
                                    <div className="flex gap-2">
                                        <button className="px-4 py-2 bg-red-600 text-white font-black uppercase border border-black hover:bg-red-500">Confirm Rejection</button>
                                        <button onClick={() => setRejectMode(false)} className="px-4 py-2 bg-gray-200 text-black font-black uppercase border border-black hover:bg-gray-300">Cancel</button>
                                    </div>
                                </div>
                            )}

                        </div>
                    ) : (
                        <div className="h-full hidden lg:flex items-center justify-center border-4 border-dashed border-gray-300 text-gray-400 font-bold uppercase min-h-[400px]">
                            Select an event to review
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminEventApproval;
