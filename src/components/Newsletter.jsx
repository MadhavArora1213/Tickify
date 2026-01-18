import React, { useState } from 'react';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { sendSubscriptionSuccessEmail } from '../services/brevoService';
import toast from 'react-hot-toast';

const Newsletter = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubscribe = async (e) => {
        e.preventDefault();

        // Ensure email is strictly lowercase for consistency
        const normalizedEmail = email.toLowerCase().trim();

        if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            toast.error("Please enter a valid email address.");
            return;
        }

        setLoading(true);
        try {
            // Check if already subscribed with the normalized email
            const q = query(collection(db, "subscribers"), where("email", "==", normalizedEmail));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                toast.error("You are already subscribed!");
                setLoading(false);
                return;
            }

            // Add to Firestore (store as lowercase)
            await addDoc(collection(db, "subscribers"), {
                email: normalizedEmail,
                subscribedAt: serverTimestamp(),
                source: 'homepage_newsletter'
            });

            // Send Thank You Email
            const emailResult = await sendSubscriptionSuccessEmail(normalizedEmail);
            if (!emailResult.success) {
                console.warn("Subscription email failed:", emailResult.message);
            }

            toast.success("Successfully subscribed! Check your inbox.");
            setEmail('');

        } catch (error) {
            console.error("Subscription error:", error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="py-20 bg-[var(--color-bg-primary)] border-t-4 border-black">
            <div className="container mx-auto px-4 text-center">
                <div className="max-w-4xl mx-auto bg-[var(--color-bg-surface)] rounded-2xl p-8 md:p-16 border-4 border-black shadow-[12px_12px_0_black] relative overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-accent-primary)] rounded-full border-4 border-black -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-[var(--color-accent-secondary)] rounded-full border-4 border-black translate-y-1/2 -translate-x-1/2"></div>

                    <h2 className="text-4xl md:text-6xl font-black mb-6 relative z-10 uppercase text-[var(--color-text-primary)]">
                        <span className="block dark:hidden" style={{ WebkitTextStroke: '2px black', color: 'white', textShadow: '4px 4px 0px #000' }}>Never Miss an Event</span>
                        <span className="hidden dark:block drop-shadow-[4px_4px_0_var(--color-accent-primary)]">Never Miss an Event</span>
                    </h2>
                    <p className="text-[var(--color-text-secondary)] font-bold text-xl mb-10 max-w-2xl mx-auto relative z-10">
                        Join 50,000+ subscribers and get exclusive access to presale tickets, artist meetups, and weekly event digests.
                    </p>

                    <form onSubmit={handleSubscribe} className="relative z-10 flex flex-col md:flex-row gap-4 max-w-lg mx-auto">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value.toLowerCase())}
                            placeholder="enter your email"
                            disabled={loading}
                            className="flex-1 bg-[var(--color-bg-secondary)] border-4 border-black rounded-xl px-6 py-4 outline-none focus:translate-x-[-4px] focus:translate-y-[-4px] focus:shadow-[6px_6px_0_black] transition-all font-bold lowercase placeholder-[var(--color-text-muted)] text-[var(--color-text-primary)] disabled:opacity-50 placeholder:uppercase"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-[var(--color-accent-primary)] text-white font-black uppercase text-xl py-4 px-8 rounded-xl border-4 border-black shadow-[6px_6px_0_black] hover:shadow-[8px_8px_0_black] hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Wait...' : 'Subscribe'}
                        </button>
                    </form>

                    <p className="mt-8 text-xs font-black text-[var(--color-text-muted)] uppercase relative z-10 tracking-widest">
                        No spam, ever. Unsubscribe anytime.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default Newsletter;
