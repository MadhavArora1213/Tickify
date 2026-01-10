import React, { useState } from 'react';
import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { sendContactConfirmationEmail } from '../services/brevoService';
import toast from 'react-hot-toast';

const Contact = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        topic: '',
        customTopic: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);

    // Common support topics
    const topics = [
        'General Inquiry',
        'Event Booking Issue',
        'Payment & Refund',
        'Account & Login Help',
        'Organizer Registration',
        'Technical Problem / Bug Report',
        'Ticket Not Received',
        'Event Cancellation',
        'Partnership & Sponsorship',
        'Feedback & Suggestions',
        'Other'
    ];


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.firstName.trim()) {
            toast.error('Please enter your first name');
            return;
        }
        if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            toast.error('Please enter a valid email address');
            return;
        }
        if (!formData.topic) {
            toast.error('Please select a topic');
            return;
        }
        if (formData.topic === 'Other' && !formData.customTopic.trim()) {
            toast.error('Please specify your topic');
            return;
        }
        if (!formData.message.trim()) {
            toast.error('Please enter your message');
            return;
        }

        setLoading(true);
        try {
            // Prepare data
            const contactData = {
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                email: formData.email.trim().toLowerCase(),
                phone: formData.phone.trim(),
                topic: formData.topic === 'Other' ? formData.customTopic.trim() : formData.topic,
                topicType: formData.topic === 'Other' ? 'custom' : 'predefined',
                message: formData.message.trim(),
                status: 'new', // new, in-progress, resolved, closed
                createdAt: serverTimestamp(),
            };

            // Save to Firestore
            await addDoc(collection(db, 'contact_submissions'), contactData);

            // Send confirmation email
            const userName = formData.lastName ? `${formData.firstName} ${formData.lastName}` : formData.firstName;
            const topicName = formData.topic === 'Other' ? formData.customTopic : formData.topic;
            await sendContactConfirmationEmail(formData.email, userName, topicName);

            // Success
            toast.success('Message sent successfully! Check your email for confirmation.');

            // Reset form
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                topic: '',
                customTopic: '',
                message: ''
            });
        } catch (error) {
            toast.error('Failed to send message. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] pt-32 md:pt-40 pb-12 px-4">

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">

                {/* Left: Info */}
                <div className="space-y-8">
                    <h1 className="text-5xl md:text-6xl font-black uppercase text-[var(--color-text-primary)] leading-none">
                        Let's <br />
                        <span className="text-yellow-400 text-stroke-3 text-stroke-black">Talk.</span>
                    </h1>
                    <p className="text-xl font-bold text-[var(--color-text-secondary)]">
                        Got a question? Found a bug? Just want to say hi? We're all ears.
                    </p>

                    <div className="neo-card bg-[var(--color-bg-surface)] border-4 border-[var(--color-text-primary)] p-6 flex items-center gap-6 shadow-[8px_8px_0_var(--color-text-primary)]">
                        <div className="w-12 h-12 bg-blue-500 border-2 border-black flex items-center justify-center text-2xl shrink-0">📧</div>
                        <div className="overflow-hidden">
                            <p className="text-xs font-black uppercase text-[var(--color-text-secondary)]">Email Us</p>
                            <a href="mailto:Contacttickify@gmail.com" className="text-lg md:text-xl font-black text-[var(--color-text-primary)] hover:underline break-all">Contacttickify@gmail.com</a>
                        </div>
                    </div>

                    <div className="neo-card bg-[var(--color-bg-surface)] border-4 border-[var(--color-text-primary)] p-6 flex items-center gap-6 shadow-[8px_8px_0_var(--color-text-primary)]">
                        <div className="w-12 h-12 bg-green-500 border-2 border-black flex items-center justify-center text-2xl shrink-0">📱</div>
                        <div>
                            <p className="text-xs font-black uppercase text-[var(--color-text-secondary)]">Call Us</p>
                            <div className="flex flex-col">
                                <a href="tel:9636573425" className="text-lg font-black text-[var(--color-text-primary)] hover:underline">+91 9636573425</a>
                                <a href="tel:9172289897" className="text-lg font-black text-[var(--color-text-primary)] hover:underline">+91 9172289897</a>
                            </div>
                        </div>
                    </div>

                    <div className="neo-card bg-[var(--color-bg-surface)] border-4 border-[var(--color-text-primary)] p-6 flex items-center gap-6 shadow-[8px_8px_0_var(--color-text-primary)]">
                        <div className="w-12 h-12 bg-pink-500 border-2 border-black flex items-center justify-center text-2xl shrink-0">🌐</div>
                        <div>
                            <p className="text-xs font-black uppercase text-[var(--color-text-secondary)]">Follow Us</p>
                            <div className="flex gap-4 mt-1">
                                <a href="https://www.linkedin.com/in/saransh-mittal-172556395/" target="_blank" rel="noopener noreferrer" className="text-2xl hover:scale-110 transition-transform" title="LinkedIn">👔</a>
                                <a href="https://www.instagram.com/ticki_fy/" target="_blank" rel="noopener noreferrer" className="text-2xl hover:scale-110 transition-transform" title="Instagram">📸</a>
                                <a href="https://x.com/Tickify134140" target="_blank" rel="noopener noreferrer" className="text-2xl hover:scale-110 transition-transform" title="X (Twitter)">🐦</a>
                            </div>
                        </div>
                    </div>

                    <div className="neo-card bg-[var(--color-bg-surface)] border-4 border-[var(--color-text-primary)] p-6 flex items-center gap-6 shadow-[8px_8px_0_var(--color-text-primary)]">
                        <div className="w-12 h-12 bg-red-500 border-2 border-black flex items-center justify-center text-2xl shrink-0">📍</div>
                        <div>
                            <p className="text-xs font-black uppercase text-[var(--color-text-secondary)]">Visit Us</p>
                            <p className="text-xl font-black text-[var(--color-text-primary)]">Bangalore, India</p>
                        </div>
                    </div>

                    <div className="neo-card bg-[var(--color-bg-surface)] border-4 border-[var(--color-text-primary)] p-6 flex items-center gap-6 shadow-[8px_8px_0_var(--color-text-primary)]">
                        <div className="w-12 h-12 bg-purple-500 border-2 border-black flex items-center justify-center text-2xl shrink-0">⏰</div>
                        <div>
                            <p className="text-xs font-black uppercase text-[var(--color-text-secondary)]">Response Time</p>
                            <p className="text-xl font-black text-[var(--color-text-primary)]">Within 24-48 hours</p>
                        </div>
                    </div>
                </div>

                {/* Right: Form */}
                <div className="neo-card bg-[var(--color-bg-surface)] border-4 border-[var(--color-text-primary)] p-8 shadow-[16px_16px_0_var(--color-text-primary)] relative">
                    <h2 className="text-2xl font-black uppercase mb-6">Send us a Message</h2>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">First Name *</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    placeholder="John"
                                    className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] px-4 py-3 font-bold"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    placeholder="Doe"
                                    className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] px-4 py-3 font-bold"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="john@example.com"
                                    className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] px-4 py-3 font-bold"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">Phone (Optional)</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+91 9876543210"
                                    className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] px-4 py-3 font-bold"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">Topic *</label>
                            <select
                                name="topic"
                                value={formData.topic}
                                onChange={handleChange}
                                className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] px-4 py-3 font-bold"
                            >
                                <option value="">Select a topic...</option>
                                {topics.map((topic, idx) => (
                                    <option key={idx} value={topic}>{topic}</option>
                                ))}
                            </select>
                        </div>

                        {formData.topic === 'Other' && (
                            <div className="animate-fade-in-up">
                                <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">Please Specify *</label>
                                <input
                                    type="text"
                                    name="customTopic"
                                    value={formData.customTopic}
                                    onChange={handleChange}
                                    placeholder="Describe your topic..."
                                    className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] px-4 py-3 font-bold"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-black uppercase text-[var(--color-text-secondary)] mb-1">Message *</label>
                            <textarea
                                rows="4"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                placeholder="Tell us how we can help you..."
                                className="w-full neo-input bg-[var(--color-bg-secondary)] border-2 border-[var(--color-text-primary)] px-4 py-3 font-bold resize-none"
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] font-black uppercase text-xl border-2 border-transparent hover:bg-[var(--color-accent-primary)] hover:text-white shadow-[6px_6px_0_var(--color-text-secondary)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Sending...' : 'Send Message →'}
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
};

export default Contact;
