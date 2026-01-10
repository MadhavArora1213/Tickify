import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { sendJobApplicationEmail } from '../services/brevoService';
import toast from 'react-hot-toast';

const jobs = [
    {
        id: 'marketing-manager-01',
        title: 'Marketing Manager',
        department: 'Marketing',
        location: 'Remote / Mumbai, India',
        type: 'Full-Time',
        salary: '₹8L - ₹15L per annum',
        posted: '2026-01-08',
        description: 'We are looking for a creative and data-driven Marketing Manager to lead our brand campaigns, grow our user base, and establish Tickify as the go-to platform for event discovery in India.',
        responsibilities: [
            'Develop and execute multi-channel marketing strategies (digital, social, influencer).',
            'Manage paid advertising campaigns across Google, Meta, and programmatic platforms.',
            'Collaborate with design and content teams to produce compelling campaigns.',
            'Analyze campaign performance and optimize for ROI.',
            'Build partnerships with event organizers, artists, and brands.',
            'Lead a team of marketing associates and interns.'
        ],
        requirements: [
            "4+ years of experience in digital marketing, preferably in events, entertainment, or tech.",
            "Proven track record of running successful growth campaigns.",
            "Strong analytical skills with experience in GA4, Mixpanel, or similar.",
            "Excellent communication and leadership abilities.",
            "Bachelor's degree in Marketing, Business, or related field."
        ]
    }
];

const Careers = () => {
    const [selectedJob, setSelectedJob] = useState(null);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        linkedIn: '',
        resumeUrl: '',
        coverLetter: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const [applicationSuccess, setApplicationSuccess] = useState(false);

    const handleApply = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.phone) {
            toast.error("Please fill in all required fields.");
            return;
        }

        setIsSubmitting(true);
        try {
            // 1. Save to Firebase
            await addDoc(collection(db, 'job_applications'), {
                jobId: selectedJob.id,
                jobTitle: selectedJob.title,
                ...formData,
                appliedAt: serverTimestamp(),
                status: 'new'
            });

            // 2. Send Email Notification via Brevo
            try {
                await sendJobApplicationEmail({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    jobTitle: selectedJob.title,
                    linkedIn: formData.linkedIn,
                    resumeUrl: formData.resumeUrl,
                    coverLetter: formData.coverLetter
                });
            } catch (emailError) {
                console.warn("Email notification failed:", emailError);
                // Don't block success if email fails
            }

            toast.success("Application submitted successfully!");
            setApplicationSuccess(true);
            setFormData({ name: '', email: '', phone: '', linkedIn: '', resumeUrl: '', coverLetter: '' });
        } catch (error) {
            console.error("Application Error:", error);
            toast.error("Failed to submit application. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] pt-36 pb-24">
            <div className="container mx-auto px-4">
                {/* Hero */}
                <div className="text-center mb-16">
                    <span className="inline-block bg-[var(--color-accent-primary)] badge-accent text-gray-900 px-4 py-1 font-black uppercase text-xs mb-4 border-2 border-[var(--color-text-primary)] shadow-[4px_4px_0_var(--color-text-primary)]">
                        Join Our Team
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black mb-4 uppercase text-[var(--color-text-primary)]">
                        <span className="block dark:hidden" style={{ WebkitTextStroke: '2px black', color: 'white', textShadow: '4px 4px 0px #000' }}>Careers at Tickify</span>
                        <span className="hidden dark:block drop-shadow-[4px_4px_0_var(--color-accent-primary)]">Careers at Tickify</span>
                    </h1>
                    <p className="text-lg font-bold text-[var(--color-text-secondary)] max-w-2xl mx-auto">
                        Help us build the future of live events. We're a team of passionate builders, dreamers, and event lovers.
                    </p>
                </div>

                {/* Why Join Us */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
                    {[
                        { icon: '🚀', title: 'Fast Growth', desc: 'Join a rapidly scaling startup backed by top investors.' },
                        { icon: '🏡', title: 'Remote First', desc: 'Work from anywhere. We value output over hours logged.' },
                        { icon: '🎉', title: 'Event Perks', desc: 'Free passes to the best concerts, festivals, and shows.' }
                    ].map((perk, idx) => (
                        <div key={idx} className="neo-card bg-[var(--color-bg-surface)] p-8 border-4 border-black shadow-[8px_8px_0_black] text-center">
                            <span className="text-5xl mb-4 block">{perk.icon}</span>
                            <h3 className="text-xl font-black uppercase mb-2 text-[var(--color-text-primary)]">{perk.title}</h3>
                            <p className="text-sm font-bold text-[var(--color-text-secondary)]">{perk.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Open Positions */}
                <h2 className="text-3xl font-black uppercase mb-8 text-[var(--color-text-primary)] border-b-4 border-black pb-4">
                    Open Positions ({jobs.length})
                </h2>

                <div className="space-y-6">
                    {jobs.map(job => (
                        <div key={job.id} className="neo-card bg-[var(--color-bg-surface)] border-4 border-black shadow-[8px_8px_0_black] overflow-hidden">
                            <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        <span className="bg-purple-100 text-purple-800 text-[10px] font-black uppercase px-2 py-0.5 border border-black">{job.department}</span>
                                        <span className="bg-green-100 text-green-800 text-[10px] font-black uppercase px-2 py-0.5 border border-black">{job.type}</span>
                                    </div>
                                    <h3 className="text-2xl font-black uppercase text-[var(--color-text-primary)]">{job.title}</h3>
                                    <p className="text-sm font-bold text-[var(--color-text-secondary)]">{job.location} • {job.salary}</p>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setSelectedJob(selectedJob?.id === job.id ? null : job)}
                                        className="neo-btn bg-white px-6 py-2 font-black uppercase text-sm border-2 border-black shadow-[4px_4px_0_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                                    >
                                        {selectedJob?.id === job.id ? 'Hide Details' : 'View Details'}
                                    </button>
                                    <button
                                        onClick={() => { setSelectedJob(job); setShowApplyModal(true); }}
                                        className="neo-btn bg-[var(--color-accent-primary)] text-black px-6 py-2 font-black uppercase text-sm border-2 border-black shadow-[4px_4px_0_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                                    >
                                        Apply Now
                                    </button>
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {selectedJob?.id === job.id && !showApplyModal && (
                                <div className="p-6 pt-0 border-t-4 border-dashed border-gray-200 animate-fade-in">
                                    <p className="text-[var(--color-text-primary)] font-bold mb-6">{job.description}</p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <h4 className="font-black uppercase text-sm mb-3 text-[var(--color-text-secondary)]">Responsibilities</h4>
                                            <ul className="space-y-2">
                                                {job.responsibilities.map((item, idx) => (
                                                    <li key={idx} className="flex items-start gap-2 text-sm font-bold text-[var(--color-text-primary)]">
                                                        <span className="text-[var(--color-accent-primary)]">▸</span>
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="font-black uppercase text-sm mb-3 text-[var(--color-text-secondary)]">Requirements</h4>
                                            <ul className="space-y-2">
                                                {job.requirements.map((item, idx) => (
                                                    <li key={idx} className="flex items-start gap-2 text-sm font-bold text-[var(--color-text-primary)]">
                                                        <span className="text-green-500">✓</span>
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* No Jobs Fallback */}
                {jobs.length === 0 && (
                    <div className="text-center py-20 border-4 border-dashed border-gray-300 rounded-xl">
                        <span className="text-5xl mb-4 block">📭</span>
                        <p className="text-xl font-bold text-gray-400">No open positions right now. Check back soon!</p>
                    </div>
                )}
            </div>

            {/* Apply Modal */}
            {showApplyModal && selectedJob && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-lg neo-modal-content bg-white border-4 border-black shadow-[16px_16px_0_black] max-h-[90vh] overflow-y-auto">
                        <div className="bg-black text-white p-6 flex justify-between items-center sticky top-0 z-10">
                            <div>
                                <h2 className="text-xl font-black uppercase">{applicationSuccess ? 'Success!' : 'Apply Now'}</h2>
                                <p className="text-xs font-bold text-gray-400">{selectedJob.title}</p>
                            </div>
                            <button onClick={() => { setShowApplyModal(false); setApplicationSuccess(false); }} className="text-3xl font-black hover:text-red-500">&times;</button>
                        </div>

                        {applicationSuccess ? (
                            <div className="p-8 text-center">
                                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-green-500">
                                    <span className="text-5xl">✓</span>
                                </div>
                                <h3 className="text-2xl font-black uppercase mb-4 text-green-700">Application Received!</h3>
                                <p className="text-gray-600 font-bold mb-6">
                                    Thank you for applying for the <strong>{selectedJob.title}</strong> position.
                                    Our team will review your application and get back to you within 5-7 business days.
                                </p>
                                <p className="text-sm text-gray-500 mb-8">
                                    A confirmation email has been sent to your email address.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <button
                                        onClick={() => { setShowApplyModal(false); setApplicationSuccess(false); }}
                                        className="neo-btn bg-black text-white px-6 py-3 font-black uppercase text-sm border-2 border-black"
                                    >
                                        Close
                                    </button>
                                    <button
                                        onClick={() => { setApplicationSuccess(false); setSelectedJob(null); setShowApplyModal(false); }}
                                        className="neo-btn bg-[var(--color-accent-primary)] text-black px-6 py-3 font-black uppercase text-sm border-2 border-black"
                                    >
                                        View Other Jobs
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleApply} className="p-6 space-y-5">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Full Name *</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} required
                                        className="w-full p-3 border-2 border-black font-bold" placeholder="Your Name" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Email *</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} required
                                        className="w-full p-3 border-2 border-black font-bold" placeholder="you@email.com" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Phone *</label>
                                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required
                                        className="w-full p-3 border-2 border-black font-bold" placeholder="+91 0000000000" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">LinkedIn Profile</label>
                                    <input type="url" name="linkedIn" value={formData.linkedIn} onChange={handleInputChange}
                                        className="w-full p-3 border-2 border-black font-bold" placeholder="https://linkedin.com/in/yourprofile" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Resume Link (Google Drive, Dropbox, etc.)</label>
                                    <input type="url" name="resumeUrl" value={formData.resumeUrl} onChange={handleInputChange}
                                        className="w-full p-3 border-2 border-black font-bold" placeholder="https://drive.google.com/your-resume" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Why do you want to join Tickify?</label>
                                    <textarea name="coverLetter" value={formData.coverLetter} onChange={handleInputChange} rows="4"
                                        className="w-full p-3 border-2 border-black font-bold resize-none" placeholder="Tell us about yourself..."></textarea>
                                </div>

                                <button type="submit" disabled={isSubmitting}
                                    className="w-full neo-btn bg-[var(--color-accent-primary)] text-black py-4 font-black uppercase text-lg border-2 border-black shadow-[6px_6px_0_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50">
                                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            <style>{`
                .animate-fade-in { animation: fadeIn 0.3s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default Careers;
