import React from 'react';
import { Link } from 'react-router-dom';

const Careers = () => {
    const openings = [
        { title: "Senior Frontend Developer", type: "Full-time", location: "Remote", department: "Engineering" },
        { title: "Product Designer", type: "Full-time", location: "Hybrid", department: "Design" },
        { title: "Marketing Specialist", type: "Contract", location: "Remote", department: "Marketing" }
    ];

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] pt-24 pb-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-5xl md:text-7xl font-black uppercase text-[var(--color-text-primary)] mb-6">
                        Join the Revolution
                    </h1>
                    <p className="text-xl md:text-2xl font-bold text-[var(--color-text-secondary)] max-w-2xl mx-auto">
                        We're building the future of event experiences. Come help us shape how the world connects.
                    </p>
                </div>

                <div className="mb-16">
                    <h2 className="text-3xl font-black uppercase border-b-4 border-[var(--color-text-primary)] pb-4 mb-8">
                        Why Work With Us?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-[var(--color-bg-surface)] p-6 border-4 border-black shadow-[4px_4px_0_black]">
                            <h3 className="text-xl font-black mb-2">🚀 Fast-paced Growth</h3>
                            <p className="font-bold text-[var(--color-text-secondary)]">Join a team that pushes boundaries and ships fast.</p>
                        </div>
                        <div className="bg-[var(--color-bg-surface)] p-6 border-4 border-black shadow-[4px_4px_0_black]">
                            <h3 className="text-xl font-black mb-2">🌍 Remote First</h3>
                            <p className="font-bold text-[var(--color-text-secondary)]">Work from anywhere. We value output over hours.</p>
                        </div>
                        <div className="bg-[var(--color-bg-surface)] p-6 border-4 border-black shadow-[4px_4px_0_black]">
                            <h3 className="text-xl font-black mb-2">💡 Creative Freedom</h3>
                            <p className="font-bold text-[var(--color-text-secondary)]">Your ideas matter. We encourage experimentation.</p>
                        </div>
                        <div className="bg-[var(--color-bg-surface)] p-6 border-4 border-black shadow-[4px_4px_0_black]">
                            <h3 className="text-xl font-black mb-2">🏥 Comprehensive Benefits</h3>
                            <p className="font-bold text-[var(--color-text-secondary)]">Healthcare, equity, and unlimited PTO.</p>
                        </div>
                    </div>
                </div>

                <div>
                    <h2 className="text-3xl font-black uppercase border-b-4 border-[var(--color-text-primary)] pb-4 mb-8">
                        Open Positions
                    </h2>
                    <div className="space-y-4">
                        {openings.map((job, index) => (
                            <div key={index} className="flex flex-col md:flex-row items-start md:items-center justify-between bg-[var(--color-bg-surface)] p-6 border-4 border-[var(--color-text-primary)] hover:shadow-[4px_4px_0_var(--color-text-primary)] transition-all cursor-pointer group">
                                <div>
                                    <h3 className="text-xl font-black group-hover:text-[var(--color-accent-primary)] transition-colors">{job.title}</h3>
                                    <p className="font-bold text-[var(--color-text-secondary)] mt-1">
                                        {job.department} • {job.type} • {job.location}
                                    </p>
                                </div>
                                <button className="mt-4 md:mt-0 font-black uppercase bg-black text-white px-6 py-2 border-2 border-transparent hover:bg-[var(--color-accent-primary)] hover:border-black transition-all">
                                    Apply Now
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 text-center font-bold text-[var(--color-text-secondary)]">
                        Don't see a fit? <a href="mailto:careers@tickify.com" className="text-[var(--color-text-primary)] underline">Email us</a> your resume anyway.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Careers;
