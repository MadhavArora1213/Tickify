import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const CreateEvent = () => {
    const [step, setStep] = useState(1);

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-6 animate-fade-in-up">
                        <h2 className="text-2xl font-black uppercase text-[var(--color-text-primary)]">Step 1: The Basics</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">Event Title</label>
                                <input type="text" placeholder="e.g. Neon Nights Festival" className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] px-4 py-3 font-bold" />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">Category</label>
                                <select className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] px-4 py-3 font-bold">
                                    <option>Music</option>
                                    <option>Tech</option>
                                    <option>Art</option>
                                    <option>Workshop</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">Date</label>
                                    <input type="date" className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] px-4 py-3 font-bold" />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">Time</label>
                                    <input type="time" className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] px-4 py-3 font-bold" />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6 animate-fade-in-up">
                        <h2 className="text-2xl font-black uppercase text-[var(--color-text-primary)]">Step 2: Venue & Location</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">Venue Name</label>
                                <input type="text" placeholder="e.g. Madison Square Garden" className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] px-4 py-3 font-bold" />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">Address</label>
                                <input type="text" placeholder="123 Cyberpunk Ave" className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] px-4 py-3 font-bold" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">City</label>
                                    <input type="text" className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] px-4 py-3 font-bold" />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">Zip Code</label>
                                    <input type="text" className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] px-4 py-3 font-bold" />
                                </div>
                            </div>
                            <div className="pt-2">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" className="w-5 h-5 border-2 border-black rounded text-[var(--color-accent-primary)] focus:ring-0" />
                                    <span className="text-sm font-bold text-[var(--color-text-primary)]">This is an online event</span>
                                </label>
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6 animate-fade-in-up">
                        <h2 className="text-2xl font-black uppercase text-[var(--color-text-primary)]">Step 3: Tickets & Pricing</h2>
                        <div className="neo-card bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] p-4 relative mb-4">
                            <span className="absolute -top-3 -right-3 bg-red-500 text-white text-xs font-black px-2 py-1 border border-black transform rotate-12">BEST VALUE</span>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">Type Name</label>
                                    <input type="text" placeholder="General Admission" className="w-full neo-input bg-[var(--color-bg-surface)] border-2 border-[var(--color-text-primary)] px-3 py-2 font-bold" />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">Quantity</label>
                                    <input type="number" placeholder="100" className="w-full neo-input bg-[var(--color-bg-surface)] border-2 border-[var(--color-text-primary)] px-3 py-2 font-bold" />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">Price ($)</label>
                                    <input type="number" placeholder="0.00" className="w-full neo-input bg-[var(--color-bg-surface)] border-2 border-[var(--color-text-primary)] px-3 py-2 font-bold" />
                                </div>
                            </div>
                        </div>
                        <button className="w-full py-3 border-2 border-dashed border-[var(--color-text-primary)] text-[var(--color-text-primary)] font-black uppercase hover:bg-[var(--color-bg-secondary)] transition-colors">
                            + Add Ticket Type
                        </button>
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-6 animate-fade-in-up">
                        <h2 className="text-2xl font-black uppercase text-[var(--color-text-primary)]">Step 4: Media</h2>
                        <div className="border-4 border-dashed border-[var(--color-text-primary)] bg-[var(--color-bg-secondary)] h-64 flex flex-col items-center justify-center cursor-pointer hover:bg-[var(--color-bg-surface)] transition-colors">
                            <span className="text-4xl mb-2">📷</span>
                            <p className="font-black uppercase text-[var(--color-text-primary)]">Click to Upload Cover Image</p>
                            <p className="text-xs font-bold text-[var(--color-text-secondary)] mt-2">Recommended: 1200x600px</p>
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">Event Description</label>
                            <textarea rows="4" className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] px-4 py-3 font-bold" placeholder="Tell people what makes your event special..."></textarea>
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className="space-y-6 animate-fade-in-up">
                        <h2 className="text-2xl font-black uppercase text-[var(--color-text-primary)]">Step 5: Review</h2>
                        <div className="neo-card bg-[var(--color-bg-surface)] border-4 border-[var(--color-text-primary)] p-6">
                            <h3 className="text-xl font-black uppercase mb-2">Neon Nights Festival</h3>
                            <p className="font-bold text-[var(--color-text-secondary)] mb-4">📅 Dec 31, 2025 • 📍 Madison Square Garden</p>

                            <hr className="border-dashed border-[var(--color-text-primary)] my-4" />

                            <h4 className="font-black uppercase text-sm mb-2">Tickets</h4>
                            <ul className="space-y-2 text-sm font-bold">
                                <li className="flex justify-between">
                                    <span>General Admission</span>
                                    <span>$50.00 (100 qty)</span>
                                </li>
                            </ul>

                            <hr className="border-dashed border-[var(--color-text-primary)] my-4" />
                            <p className="text-xs font-bold text-[var(--color-warning)] uppercase">
                                ⚠ This event will be published immediately.
                            </p>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] pt-24 pb-12">
            <div className="container mx-auto px-4 max-w-3xl">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <Link to="/organizer/dashboard" className="font-black underline uppercase text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
                        &larr; Back to Dashboard
                    </Link>
                    <p className="font-black uppercase text-[var(--color-text-primary)]">Create New Event</p>
                </div>

                <div className="neo-card bg-[var(--color-bg-surface)] p-8 border-4 border-[var(--color-text-primary)] shadow-[12px_12px_0_var(--color-text-primary)]">

                    {/* Progress Bar */}
                    <div className="flex justify-between items-center mb-10 relative">
                        <div className="absolute top-1/2 left-0 right-0 h-2 bg-[var(--color-bg-secondary)] -z-10 transform -translate-y-1/2"></div>
                        {[1, 2, 3, 4, 5].map(s => (
                            <div
                                key={s}
                                className={`w-10 h-10 flex items-center justify-center font-black border-2 border-[var(--color-text-primary)] rounded-full transition-colors duration-300
                                ${step >= s ? 'bg-[var(--color-accent-primary)] text-white' : 'bg-[var(--color-bg-surface)] text-[var(--color-text-primary)]'}`}
                            >
                                {s}
                            </div>
                        ))}
                    </div>

                    {renderStepContent()}

                    {/* Actions */}
                    <div className="flex justify-between mt-10 pt-6 border-t-2 border-dashed border-[var(--color-text-primary)]">
                        <button
                            onClick={prevStep}
                            disabled={step === 1}
                            className={`neo-btn px-6 py-3 font-black uppercase text-[var(--color-text-primary)] border-2 border-[var(--color-text-primary)] shadow-[4px_4px_0_var(--color-text-primary)] disabled:opacity-50 disabled:shadow-none bg-white`}
                        >
                            Previous
                        </button>

                        {step < 5 ? (
                            <button
                                onClick={nextStep}
                                className="neo-btn px-6 py-3 font-black uppercase text-white bg-[var(--color-text-primary)] shadow-[4px_4px_0_var(--color-text-primary)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_var(--color-text-primary)]"
                            >
                                Next Step
                            </button>
                        ) : (
                            <button
                                className="neo-btn px-8 py-3 font-black uppercase text-white bg-[var(--color-success)] shadow-[6px_6px_0_var(--color-text-primary)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0_var(--color-text-primary)]"
                            >
                                Publish Event
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateEvent;
